import { createFileRoute, useRouter, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Share2, ExternalLink, ChevronRight, ChevronDown } from "lucide-react";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { toast } from "sonner";
import { useLanguage, getLang } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export const Route = createFileRoute("/article/$id")({
  head: () => ({ meta: [{ title: "Article — lexinoori." }] }),
  component: ArticleView,
});

const READ_LENGTHS = ["Bullets", "Brief", "Standard"] as const;
type ReadLength = (typeof READ_LENGTHS)[number];

const FONT_SIZES = { Small: 14, Medium: 16, Large: 19 } as const;
type FontSizeKey = keyof typeof FONT_SIZES;

type ArticleRow = {
  id: string;
  headline: string;
  body_standard: string | null;
  body_bullets: string | null;
  body_brief: string | null;
  body_deep_dive: string | null;
  topic: string | null;
  read_time_minutes: number | null;
  source_count: number | null;
  bias_score: number | null;
  diversity_score: number | null;
  whats_missing: string | null;
  update_summary: string | null;
  image_url: string | null;
  watchdog_only: boolean | null;
};

function toTopic(t: string | null | undefined): Topic {
  const valid: Topic[] = ["politics", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const n = (t ?? "").toLowerCase();
  return (valid.includes(n as Topic) ? (n as Topic) : "politics");
}

async function shareArticle(headline: string, id: string) {
  const url = `https://lexinoori.com/article/${id}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: headline, url });
    } catch {
      // User cancelled or share failed — ignore
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }
}

function ArticleView() {
  const router = useRouter();
  const { id } = Route.useParams();
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [readLength, setReadLength] = useState<ReadLength>("Standard");
  const [sheet, setSheet] = useState<null | "aa">(null);
  const { isSaved, toggle } = useSavedArticles();
  const savedTop = isSaved(id);
  const [fontSize, setFontSize] = useState<FontSizeKey>("Medium");
  const [sources, setSources] = useState<{ url: string; headline: string; name: string; loaded_language: any; journalist_id: string | null; author: string | null }[]>([]);
  const [clusterId, setClusterId] = useState<string | null>(null);
  const lang = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const language = getLang();
      const suffix = language === "en" ? "" : `_${language}`;

      const baseCols = [
        "headline",
        "body_standard",
        "body_bullets",
        "body_brief",
        "body_deep_dive",
        "whats_missing",
        "update_summary",
      ];
      const langCols =
        suffix === ""
          ? []
          : baseCols.filter((c) => c !== "body_deep_dive").map((c) => `${c}${suffix}`);
      const selectCols = [
        "id",
        "topic",
        "read_time_minutes",
        "source_count",
        "bias_score",
        "diversity_score",
        "image_url",
        "watchdog_only",
        ...baseCols,
        ...langCols,
      ].join(", ");

      const { data, error } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data) {
        const pick = (base: string) =>
          (suffix && (data as any)[`${base}${suffix}`]) || (data as any)[base] || null;
        setArticle({
          id: (data as any).id,
          topic: (data as any).topic,
          read_time_minutes: (data as any).read_time_minutes,
          source_count: (data as any).source_count,
          bias_score: (data as any).bias_score,
          diversity_score: (data as any).diversity_score,
          headline: pick("headline") ?? "",
          body_standard: pick("body_standard"),
          body_bullets: pick("body_bullets"),
          body_brief: pick("body_brief"),
          body_deep_dive: (data as any).body_deep_dive ?? null,
          whats_missing: pick("whats_missing"),
          update_summary: pick("update_summary"),
          image_url: (data as any).image_url ?? null,
          watchdog_only: (data as any).watchdog_only ?? null,
        } as ArticleRow);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: art } = await (supabase as any)
        .from("articles")
        .select("cluster_id")
        .eq("id", id)
        .maybeSingle();
      const clusterId = art?.cluster_id;
      if (!clusterId) {
        if (!cancelled) setSources([]);
        return;
      }
      if (!cancelled) setClusterId(clusterId);
      const { data, error } = await (supabase as any)
        .from("source_articles")
        .select("id, url, headline, author, journalist_id, loaded_language, sources:source_id(name)")
        .eq("cluster_id", clusterId);
      if (cancelled) return;
      const rows = (data ?? [])
        .map((r: any) => ({
          url: r?.url ?? "",
          headline: r?.headline ?? "",
          name: r?.sources?.name ?? "Unknown",
          loaded_language: r?.loaded_language ?? null,
          journalist_id: r?.journalist_id ?? null,
          author: r?.author ?? null,
        }))
        .filter((r: any) => r.url);
      setSources(rows);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const TOPIC = toTopic(article?.topic);
  const topicColor = TOPIC_COLORS[TOPIC];
  const HEADLINE = article?.headline ?? (loading ? "Loading…" : "Article not found");
  const sourceCount = sources.length;
  const storedReadMinutes = article?.read_time_minutes ?? 0;
  const readMinutes =
    readLength === "Bullets" ? 1
    : readLength === "Brief" ? 2
    : Math.max(2, storedReadMinutes);
  const biasScore = Number(article?.bias_score ?? 0);
  const diversityScore = Number(article?.diversity_score ?? 0);
  const biasPct = Math.max(0, Math.min(100, ((biasScore + 1) / 2) * 100));
  const diversityPct = Math.max(0, Math.min(100, diversityScore * 100));
  const diversityDisplay = Math.round(diversityScore * 10);
  const poolLeanLabel =
    biasScore <= -0.6 ? t.biasLeft
    : biasScore <= -0.2 ? t.biasCenterLeft
    : biasScore <= 0.1 ? t.biasCenter
    : biasScore <= 0.5 ? t.biasCenterRight
    : t.biasRight;
  const diversityLabel =
    diversityDisplay <= 3 ? t.diversityWeak
    : diversityDisplay <= 6 ? t.diversityModerate
    : t.diversityStrong;
  const diversityColor =
    diversityDisplay <= 3 ? "#FF3B30"
    : diversityDisplay <= 6 ? "#FF9500"
    : "#00C864";
  const rawBody = readLength === "Bullets"
    ? (article?.body_bullets ?? "")
    : readLength === "Brief"
    ? (article?.body_brief ?? "")
    : (article?.body_standard ?? "");
  const body = readLength === "Bullets" && rawBody
    ? (() => {
        const trimmed = rawBody.trim();
        let items: string[] = [];
        if (trimmed.startsWith("[")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              items = parsed.map((v) => String(v).trim()).filter(Boolean);
            }
          } catch {
            items = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
          }
        } else {
          items = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
        }
        const normalized = items.map((l) =>
          /^[•\-*]/.test(l) ? l : `• ${l}`
        );
        return normalized.slice(0, 5).join("\n");
      })()
    : rawBody;

  const READ_LENGTH_LABELS: Record<ReadLength, string> = {
    Bullets: t.readBullets,
    Brief: t.readBrief,
    Standard: t.readStandard,
  };

  const isWatchdog = article?.watchdog_only === true;
  const watchdogSource = sources[0] ?? null;
  const watchdogLangItems: Array<{ phrase?: string; neutral?: string }> = Array.isArray(
    watchdogSource?.loaded_language,
  )
    ? watchdogSource.loaded_language.filter((it: any) => it?.phrase || it?.neutral)
    : [];

  const fixedBtnStyle = {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(17,17,17,0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* BACK - always */}
      <button
        onClick={() => router.history.back()}
        aria-label="Back"
        style={{ position: "fixed", top: "calc(env(safe-area-inset-top) + 12px)", left: 16, zIndex: 9999, color: "#FFFFFF", ...fixedBtnStyle }}
      >
        <ArrowLeft size={20} />
      </button>

      {/* RIGHT TOP: save+share for watchdog, Aa for normal */}
      {isWatchdog ? (
        <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top) + 12px)", right: 16, zIndex: 9999, display: "flex", gap: 8 }}>
          <button
            aria-label={savedTop ? "Unsave" : "Save"}
            onClick={() => toggle(id)}
            style={{ color: savedTop ? "#1A7A5E" : "#FFFFFF", ...fixedBtnStyle }}
          >
            <Bookmark size={20} fill={savedTop ? "#1A7A5E" : "none"} />
          </button>
          <button
            aria-label="Share"
            onClick={() => shareArticle(HEADLINE, id)}
            style={{ color: "#FFFFFF", ...fixedBtnStyle }}
          >
            <Share2 size={20} />
          </button>
        </div>
      ) : (
        <button
          aria-label="Reading options"
          onClick={() => setSheet("aa")}
          style={{ position: "fixed", top: "calc(env(safe-area-inset-top) + 12px)", right: 16, zIndex: 9999, height: 40, padding: "0 12px", borderRadius: 8, backgroundColor: "rgba(17,17,17,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#FFFFFF", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          Aa
        </button>
      )}

      {/* HERO - full-width image behind status bar */}
      <div style={{ position: "relative", width: "100%", height: "calc(320px + env(safe-area-inset-top))", marginTop: 0 }}>
        {article?.image_url ? (
          <img
            src={article.image_url}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${topicColor ?? "#1A7A5E"}99 0%, #111111 100%)` }} />
        )}
        {/* Top vignette so back/Aa buttons read against any image */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0px, transparent 80px)" }} />
        {/* Topic-tinted gradient over bottom portion */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 0%, ${(topicColor ?? "#1A7A5E")}B3 100%)` }} />
        {/* Topic pill + headline + meta overlaid at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 20px", paddingTop: "env(safe-area-inset-top)" }}>
          {TOPIC && (
            <div style={{ display: "inline-block", marginBottom: 8 }}>
              <TopicPill topic={TOPIC} />
            </div>
          )}
          <h1 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 24, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            {HEADLINE}
          </h1>
          {!isWatchdog && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>
                {sourceCount} {sourceCount === 1 ? t.source : t.sources}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  aria-label={savedTop ? "Unsave" : "Save"}
                  onClick={() => toggle(id)}
                  style={{ color: savedTop ? "#00C864" : "#FFFFFF", ...fixedBtnStyle }}
                >
                  <Bookmark size={20} fill={savedTop ? "#00C864" : "none"} />
                </button>
                <button
                  aria-label="Share"
                  onClick={() => shareArticle(HEADLINE, id)}
                  style={{ color: "#FFFFFF", ...fixedBtnStyle }}
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── WATCHDOG VIEW ── */}
      {isWatchdog ? (
        <>
          {/* Amber warning card */}
          <section
            style={{
              margin: "16px 16px 0",
              padding: 16,
              borderRadius: 12,
              backgroundColor: "rgba(232,135,58,0.08)",
              border: "1px solid rgba(232,135,58,0.35)",
            }}
          >
            <div style={{ color: "#E8873A", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
              ENKELT KILDE
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>
              Ingen uafhængig bekræftelse
            </div>
            <p style={{ color: "#8E8E93", fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
              Denne artikel stammer fra én enkelt kilde og er ikke bekræftet af øvrige uafhængige medier.
            </p>
          </section>

          {/* Outlet + byline */}
          {watchdogSource && (
            <div
              style={{
                margin: "12px 16px 0",
                padding: 16,
                borderRadius: 12,
                backgroundColor: "#1C1C1E",
                border: "1px solid #2C2C2E",
              }}
            >
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}>{watchdogSource.name}</div>
              {watchdogSource.author && (
                <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>{watchdogSource.author}</div>
              )}
            </div>
          )}

          {/* Loaded language flags */}
          {watchdogLangItems.length > 0 && (
            <div
              style={{
                margin: "12px 16px 0",
                padding: 16,
                borderRadius: 12,
                backgroundColor: "#1C1C1E",
                border: "1px solid #2C2C2E",
              }}
            >
              <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
                {t.loadedLanguageLabel} · {watchdogLangItems.length}{" "}
                {watchdogLangItems.length === 1 ? t.loadedPhrase : t.loadedPhrases}
              </div>
              {watchdogLangItems.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 0",
                    fontSize: 13,
                    flexWrap: "wrap",
                    borderTop: idx > 0 ? "1px solid #2C2C2E" : "none",
                  }}
                >
                  <span style={{ color: "#FFFFFF", textDecoration: "underline", textDecorationColor: "#FF4500", textDecorationThickness: 2, textUnderlineOffset: 3 }}>
                    {it.phrase}
                  </span>
                  <span style={{ color: "#8E8E93" }}>→</span>
                  <span style={{ color: "#1A7A5E" }}>{it.neutral}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bias score */}
          <div
            style={{
              margin: "12px 16px 0",
              padding: 16,
              borderRadius: 12,
              backgroundColor: "#1C1C1E",
              border: "1px solid #2C2C2E",
            }}
          >
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
              {t.biasScoreBar}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>{poolLeanLabel}</span>
              <span style={{ color: "#8E8E93", fontSize: 13 }}>
                {biasScore > 0 ? "+" : ""}{biasScore.toFixed(2)}
              </span>
            </div>
            <div style={{ position: "relative", height: 4, backgroundColor: "#2C2C2E", borderRadius: 999 }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${biasPct}%`, backgroundColor: "#1A7A5E", borderRadius: 999 }} />
            </div>
          </div>

          {/* Read original button */}
          {watchdogSource?.url && (
            <a
              href={watchdogSource.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                margin: "20px 16px 0",
                height: 56,
                borderRadius: 14,
                backgroundColor: "#E8873A",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Læs original artikel
              <ExternalLink size={18} />
            </a>
          )}
        </>
      ) : (
        /* ── NORMAL MERGED VIEW ── */
        <>
          {/* WHAT'S NEW */}
          {article?.update_summary && article.update_summary.trim() !== "" && (
            <section
              style={{ margin: "12px 16px 0", padding: 16, borderRadius: 12, backgroundColor: "rgba(26,122,94,0.08)", border: "1px solid rgba(26,122,94,0.25)" }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span style={{ color: "#1A7A5E", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                  {t.whatsNew}
                </span>
              </div>
              <p style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 1.5 }}>{article.update_summary}</p>
            </section>
          )}

          {/* BEFORE YOU READ */}
          <section style={{ margin: "12px 16px 0", padding: 16, borderRadius: 12, backgroundColor: "#1C1C1E", border: "1px solid #2C2C2E" }}>
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
              {t.beforeYouRead}
            </div>
            <div className="flex" style={{ gap: 16, marginBottom: 16 }}>
              <div className="flex-1">
                <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{t.sourcesLabel}</div>
                <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
                  {sourceCount} {sourceCount === 1 ? t.source : t.sources}
                </div>
              </div>
              <div className="flex-1">
                <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{t.readLengthLabel}</div>
                <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>{readMinutes} min</div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{t.sourceDiversity}</span>
              </div>
              <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {sourceCount} {sourceCount === 1 ? t.source : t.sources}
              </div>
              <div style={{ position: "relative", height: 4, backgroundColor: "#2C2C2E", borderRadius: 999 }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${diversityPct}%`, backgroundColor: diversityColor, borderRadius: 999 }} />
              </div>
            </div>
          </section>

          {/* READ LENGTH SELECTOR */}
          <div className="flex" style={{ gap: 8, margin: "12px 16px 0" }}>
            {READ_LENGTHS.map((rl) => {
              const active = rl === readLength;
              return (
                <button
                  key={rl}
                  onClick={() => {
                    setReadLength(rl);
                    try {
                      window.localStorage.setItem("lex:depth", rl);
                      window.dispatchEvent(new Event("lex:depth-changed"));
                    } catch {}
                  }}
                  className="flex-1"
                  style={{ padding: "10px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, backgroundColor: active ? "#FFFFFF" : "#1C1C1E", color: active ? "#111111" : "rgba(255,255,255,0.5)", border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E", whiteSpace: "nowrap", cursor: "pointer" }}
                >
                  {READ_LENGTH_LABELS[rl]}
                </button>
              );
            })}
          </div>

          {/* ARTICLE BODY */}
          <article style={{ padding: "0 16px", marginTop: 20, color: "#FFFFFF", fontSize: FONT_SIZES[fontSize], lineHeight: 1.65 }}>
            {body ? (
              <p style={{ marginBottom: 20, whiteSpace: "pre-wrap" }}>{body}</p>
            ) : (
              <p style={{ marginBottom: 20, color: "#8E8E93" }}>
                {loading ? t.loadingArticle : t.noContent}
              </p>
            )}
          </article>

          {/* AFTER YOU READ */}
          <section style={{ margin: "24px 16px 0", padding: "4px 16px 16px", borderRadius: 12, backgroundColor: "#1C1C1E", border: "1px solid #2C2C2E" }}>
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginTop: 16, marginBottom: 8 }}>
              {t.whatsMissing}
            </div>
            <div style={{ borderLeft: "2px solid #E8873A", paddingLeft: 16, color: "#FFFFFF", fontSize: 14, lineHeight: 1.5 }}>
              {article?.whats_missing ?? t.noGaps}
            </div>
            {sources.length === 0 ? (
              <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginTop: 16, marginBottom: 4 }}>
                {t.sourceArticlesUnavailable}
              </div>
            ) : (
              <>
                <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginTop: 16, marginBottom: 4 }}>
                  {t.sourcesLabel} · {sources.length} {sources.length === 1 ? t.source.toUpperCase() : t.sources.toUpperCase()}
                </div>
                {sources.map((s, i) => (
                  <SourceRow
                    key={`${s.url}-${i}`}
                    name={s.name}
                    headline={s.headline}
                    url={s.url}
                    loadedLanguage={s.loaded_language}
                    journalistId={s.journalist_id}
                    author={s.author}
                    last={i === sources.length - 1}
                  />
                ))}
              </>
            )}
            <Link
              to="/timeline/$id"
              params={{ id: clusterId ?? "" }}
              style={{ display: "block", width: "100%", textAlign: "center", color: "#1A7A5E", fontSize: 14, marginTop: 20 }}
            >
              {t.viewTimeline}
            </Link>
          </section>

          {/* SHARE BUTTON */}
          <button
            onClick={() => shareArticle(HEADLINE, id)}
            style={{ display: "block", margin: "20px 16px 0", width: "calc(100% - 32px)", height: 52, border: "1px solid #2C2C2E", borderRadius: 12, background: "transparent", appearance: "none", WebkitAppearance: "none", color: "#FFFFFF", fontSize: 15, fontWeight: 700 }}
          >
            {t.share}
          </button>

          {/* BOTTOM SHEET */}
          {sheet !== null && (
            <div onClick={() => setSheet(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", backgroundColor: "#1C1C1E", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
                {sheet === "aa" && (
                  <>
                    <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
                      {t.textSize}
                    </div>
                    <div className="flex" style={{ gap: 8 }}>
                      {(Object.keys(FONT_SIZES) as FontSizeKey[]).map((key) => {
                        const active = key === fontSize;
                        return (
                          <button
                            key={key}
                            onClick={() => setFontSize(key)}
                            style={{ flex: 1, padding: "10px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, backgroundColor: active ? "#FFFFFF" : "#1C1C1E", color: active ? "#111111" : "rgba(255,255,255,0.5)", border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E" }}
                          >
                            {key}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SourceRow({
  name,
  headline,
  url,
  loadedLanguage,
  journalistId,
  author,
  last = false,
}: {
  name: string;
  headline: string;
  url: string;
  loadedLanguage?: any;
  journalistId?: string | null;
  author?: string | null;
  last?: boolean;
}) {
  const navigate = useNavigate();
  const lang = useLanguage();
  const t = translations[lang];
  const [expanded, setExpanded] = useState(false);
  const truncated = headline.length > 60 ? `${headline.slice(0, 60)}…` : headline;
  const items: Array<{ phrase?: string; neutral?: string; reason?: string }> = Array.isArray(loadedLanguage)
    ? loadedLanguage.filter((it: any) => it && (it.phrase || it.neutral))
    : [];
  const count = items.length;
  const hasJournalist = !!journalistId;
  const toggleExpand = () => setExpanded((v) => !v);
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid #2C2C2E" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpand();
          }
        }}
        className="flex items-center"
        style={{ gap: 12, padding: "12px 0", cursor: "pointer" }}
      >
        <span
          aria-hidden
          className="flex items-center justify-center"
          style={{ color: "#8E8E93", width: 16 }}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
            <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>{name}</span>
            {count > 0 && (
              <span style={{ color: "#E8873A", fontSize: 12 }}>
                · {count} {count === 1 ? t.loadedPhrase : t.loadedPhrases}
              </span>
            )}
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 13, lineHeight: 1.4, marginTop: 2 }}>{truncated}</div>
          {author && (
            hasJournalist ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: "/journalist/$id", params: { id: journalistId! } });
                }}
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: "#8E8E93",
                  fontSize: 13,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                {author}
              </button>
            ) : (
              <div style={{ color: "#8E8E93", fontSize: 13 }}>{author}</div>
            )
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View original article"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center"
          style={{ color: "#8E8E93", padding: "0 4px" }}
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {expanded && (
        <div style={{ padding: "4px 0 12px 28px" }}>
          {items.length === 0 ? (
            <div style={{ color: "#8E8E93", fontSize: 13 }}>{t.noLoadedLanguage}</div>
          ) : (
            <>
              <div
                style={{
                  color: "#8E8E93",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                {t.loadedLanguageLabel}
              </div>
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center"
                  style={{ gap: 8, padding: "6px 0", fontSize: 13, flexWrap: "wrap" }}
                >
                  <span
                    style={{
                      color: "#FFFFFF",
                      textDecoration: "underline",
                      textDecorationColor: "#FF4500",
                      textDecorationThickness: 2,
                      textUnderlineOffset: 3,
                    }}
                  >
                    {it.phrase}
                  </span>
                  <span style={{ color: "#8E8E93" }}>→</span>
                  <span style={{ color: "#1A7A5E" }}>{it.neutral}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
