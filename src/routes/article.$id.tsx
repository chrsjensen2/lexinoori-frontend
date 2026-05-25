import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Share2, ExternalLink, ChevronRight, ChevronDown } from "lucide-react";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { toast } from "sonner";

export const Route = createFileRoute("/article/$id")({
  head: () => ({ meta: [{ title: "Article — lexinoori." }] }),
  component: ArticleView,
});

const READ_LENGTHS = ["Bullets", "Brief", "Standard", "Deep Dive"] as const;
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
  const [sources, setSources] = useState<{ url: string; headline: string; name: string; loaded_language: any }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Resolve user's primary language
      let language = "en";
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("primary_language")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (profile?.primary_language) language = profile.primary_language;
      }
      console.log("Article language:", language);
      const suffix = language === "en" ? "" : `_${language}`;

      const baseCols = [
        "headline",
        "body_standard",
        "body_bullets",
        "body_brief",
        "body_deep_dive",
        "whats_missing",
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
        ...baseCols,
        ...langCols,
      ].join(", ");

      const { data, error } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .eq("id", id)
        .maybeSingle();
      console.log("Article fetch:", { data, error });
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
      const { data, error } = await (supabase as any)
        .from("source_articles")
        .select("url, headline, loaded_language, sources:source_id(name)")
        .eq("cluster_id", clusterId);
      console.log("Sources fetch:", { data, error });
      if (cancelled) return;
      const rows = (data ?? [])
        .map((r: any) => {
          const joined = Array.isArray(r?.sources) ? r.sources[0] : r?.sources;
          return {
            url: r?.url ?? "",
            headline: r?.headline ?? "",
            name: joined?.name ?? r?.source_name ?? "Unknown",
            loaded_language: r?.loaded_language ?? null,
          };
        })
        .filter((r: any) => r.url);
      setSources(rows);
    })();
    return () => { cancelled = true; };
  }, [id]);


  const TOPIC = toTopic(article?.topic);
  const topicColor = TOPIC_COLORS[TOPIC];
  const HEADLINE = article?.headline ?? (loading ? "Loading…" : "Article not found");
  const sourceCount = article?.source_count ?? 0;
  const readMinutes = article?.read_time_minutes ?? 0;
  const biasScore = Number(article?.bias_score ?? 0);
  const diversityScore = Number(article?.diversity_score ?? 0);
  const biasPct = Math.max(0, Math.min(100, ((biasScore + 1) / 2) * 100));
  const diversityPct = Math.max(0, Math.min(100, diversityScore * 100));
  const diversityDisplay = Math.round(diversityScore * 10);
  const poolLeanLabel =
    biasScore <= -0.6 ? "LEFT"
    : biasScore <= -0.2 ? "CENTRE-LEFT"
    : biasScore <= 0.1 ? "CENTRE"
    : biasScore <= 0.5 ? "CENTRE-RIGHT"
    : "RIGHT";
  const diversityLabel =
    diversityDisplay <= 3 ? "WEAK"
    : diversityDisplay <= 6 ? "MODERATE"
    : "STRONG";
  const diversityColor =
    diversityDisplay <= 3 ? "#FF3B30"
    : diversityDisplay <= 6 ? "#FF9500"
    : "#00C864";
  const rawBody = readLength === "Bullets"
    ? (article?.body_bullets ?? "")
    : readLength === "Brief"
    ? (article?.body_brief ?? "")
    : readLength === "Deep Dive"
    ? (article?.body_deep_dive ?? "")
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
  const deepDiveDisabled = !article?.body_deep_dive;




  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Fixed top controls — placed at root to escape any containing block */}
      <button
        onClick={() => router.history.back()}
        aria-label="Back"
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 9999, width: 40, height: 40, borderRadius: 8, backgroundColor: "rgba(17,17,17,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <ArrowLeft size={20} />
      </button>
      <button
        aria-label="Reading options"
        onClick={() => setSheet("aa")}
        style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999, height: 40, padding: "0 12px", borderRadius: 8, backgroundColor: "rgba(17,17,17,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#FFFFFF", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        Aa
      </button>

      {/* HERO */}
      <div style={{ position: "relative", width: "100%", height: 240 }}>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${topicColor} 0%, #111111 100%)`,
          }}
        />
        {/* Bottom darken overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 120,
            background: "linear-gradient(180deg, rgba(17,17,17,0) 0%, #111111 100%)",
          }}
        />

        {/* Top floating controls moved outside hero — see below */}


        {/* Bottom overlay content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 16px 16px",
          }}
        >
          <div style={{ display: "inline-block", marginBottom: 8 }}>
            <TopicPill topic={TOPIC} />
          </div>
          <h1
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {HEADLINE}
          </h1>
        </div>
      </div>

      {/* METADATA ROW */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 16, marginTop: 16 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: "#2C2C2E",
              color: "#8E8E93",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            R
          </span>
          <span style={{ color: "#FFFFFF", fontSize: 14 }}>{sourceCount} {sourceCount === 1 ? "source" : "sources"}</span>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <button
            aria-label={savedTop ? "Unsave" : "Save"}
            onClick={() => toggle(id)}
            style={{ color: savedTop ? "#1A7A5E" : "#8E8E93" }}
          >
            <Bookmark size={24} fill={savedTop ? "#1A7A5E" : "none"} />
          </button>
          <button
            aria-label="Share"
            onClick={() => shareArticle(HEADLINE, id)}
            style={{ color: "#8E8E93" }}
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* WHAT'S NEW */}
      <section
        style={{
          margin: "12px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "rgba(26,122,94,0.08)",
          border: "1px solid rgba(26,122,94,0.25)",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ color: "#1A7A5E", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            WHAT'S NEW
          </span>
          <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            SINCE YOU LAST READ · 3H AGO
          </span>
        </div>
        <p style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 1.5 }}>
          Council legal service has now formally objected to the 72-hour consultation window. Two
          new sources added.
        </p>
      </section>

      {/* BEFORE YOU READ */}
      <section
        style={{
          margin: "12px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
        }}
      >
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          BEFORE YOU READ
        </div>

        <div className="flex" style={{ gap: 16, marginBottom: 16 }}>
          <div className="flex-1">
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              SOURCES
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {sourceCount} sources
            </div>
          </div>
          <div className="flex-1">
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              READ LENGTH
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {readMinutes} min
            </div>

          </div>
        </div>

        {/* Pool lean slider */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              POOL LEAN
            </span>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              {poolLeanLabel}
            </span>
          </div>
          <div style={{ position: "relative", width: "100%", height: 14 }}>
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: "#2C2C2E",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 0,
                width: `${biasPct}%`,
                height: 4,
                backgroundColor: "#1A7A5E",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `calc(${biasPct}% - 7px)`,
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: "#1A7A5E",
              }}
            />

          </div>
        </div>

        {/* Source diversity */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              SOURCE DIVERSITY
            </span>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: diversityColor, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: diversityColor,
                  display: "inline-block",
                }}
              />
              {diversityLabel}
            </span>
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {diversityDisplay} / 10
          </div>
          <div style={{ position: "relative", height: 4, backgroundColor: "#2C2C2E", borderRadius: 999 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${diversityPct}%`,
                backgroundColor: diversityColor,
                borderRadius: 999,
              }}
            />

          </div>
        </div>
      </section>

      {/* READ LENGTH SELECTOR */}
      <div className="flex" style={{ gap: 8, margin: "12px 16px 0" }}>
        {READ_LENGTHS.map((rl) => {
          const active = rl === readLength;
          const disabled = rl === "Deep Dive" && deepDiveDisabled;
          return (
            <button
              key={rl}
              onClick={() => {
                if (disabled) return;
                setReadLength(rl);
                try {
                  window.localStorage.setItem("lex:depth", rl);
                  window.dispatchEvent(new Event("lex:depth-changed"));
                } catch {}
              }}

              disabled={disabled}
              title={disabled ? "Not enough source material" : undefined}
              className="flex-1"
              style={{
                padding: "10px 12px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: active ? "#FFFFFF" : "#1C1C1E",
                color: disabled ? "rgba(255,255,255,0.2)" : active ? "#111111" : "rgba(255,255,255,0.5)",
                border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E",
                whiteSpace: "nowrap",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {rl}
            </button>
          );
        })}
      </div>

      {/* ARTICLE BODY */}
      <article
        style={{
          padding: "0 16px",
          marginTop: 20,
          color: "#FFFFFF",
          fontSize: FONT_SIZES[fontSize],
          lineHeight: 1.65,
        }}
      >
        {body ? (
          <p style={{ marginBottom: 20, whiteSpace: "pre-wrap" }}>{body}</p>
        ) : (
          <p style={{ marginBottom: 20, color: "#8E8E93" }}>
            {loading ? "Loading article…" : "No content available."}
          </p>
        )}

      </article>

      {/* AFTER YOU READ */}
      <section
        style={{
          margin: "24px 16px 0",
          padding: "4px 16px 16px",
          borderRadius: 12,
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
        }}
      >



        {/* What's missing */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          WHAT'S MISSING
        </div>
        <div
          style={{
            borderLeft: "2px solid #E8873A",
            paddingLeft: 16,
            color: "#FFFFFF",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {article?.whats_missing ?? "No gaps identified."}
        </div>

        {/* Sources */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          SOURCES · {sources.length} {sources.length === 1 ? "SOURCE" : "SOURCES"}
        </div>

        {sources.length === 0 ? (
          <div style={{ color: "#8E8E93", fontSize: 14, padding: "12px 0" }}>
            No sources available.
          </div>
        ) : (
          sources.map((s, i) => (
            <SourceRow
              key={`${s.url}-${i}`}
              name={s.name}
              headline={s.headline}
              url={s.url}
              loadedLanguage={s.loaded_language}
              last={i === sources.length - 1}
            />
          ))
        )}

        {/* Bottom action */}
        <Link
          to="/timeline/$id"
          params={{ id: "1" }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            color: "#1A7A5E",
            fontSize: 14,
            marginTop: 20,
          }}
        >
          View story timeline →
        </Link>
      </section>

      {/* Share button */}
      <button
        onClick={() => shareArticle(HEADLINE, id)}
        style={{
          display: "block",
          margin: "20px 16px 0",
          width: "calc(100% - 32px)",
          height: 52,
          border: "1px solid #2C2C2E",
          borderRadius: 12,
          background: "transparent",
          appearance: "none",
          WebkitAppearance: "none",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Share
      </button>

      {/* Bottom sheets */}
      {sheet !== null && (
        <div
          onClick={() => setSheet(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              backgroundColor: "#1C1C1E",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
            }}
          >
            {sheet === "aa" && (
              <>
                <div
                  style={{
                    color: "#8E8E93",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginBottom: 16,
                  }}
                >
                  TEXT SIZE
                </div>
                <div className="flex" style={{ gap: 8 }}>
                  {(Object.keys(FONT_SIZES) as FontSizeKey[]).map((key) => {
                    const active = key === fontSize;
                    return (
                      <button
                        key={key}
                        onClick={() => setFontSize(key)}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 700,
                          backgroundColor: active ? "#FFFFFF" : "#1C1C1E",
                          color: active ? "#111111" : "rgba(255,255,255,0.5)",
                          border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E",
                        }}
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
    </div>
  );
}



function InlineTag({
  kind,
  children,
}: {
  kind: "fact" | "opinion" | "contested";
  children: React.ReactNode;
}) {
  const config = {
    fact: { bg: "rgba(26,122,94,0.08)", pillBg: "#1A7A5E", label: "FACT" },
    opinion: { bg: "rgba(232,135,58,0.08)", pillBg: "#E8873A", label: "OPINION" },
    contested: { bg: "rgba(255,69,0,0.08)", pillBg: "#FF4500", label: "CONTESTED" },
  }[kind];

  return (
    <span
      style={{
        backgroundColor: config.bg,
        padding: "0 4px",
        borderRadius: 4,
      }}
    >
      {children}
      <span
        style={{
          backgroundColor: config.pillBg,
          color: "#FFFFFF",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "2px 4px",
          borderRadius: 4,
          marginLeft: 4,
          verticalAlign: "middle",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    </span>
  );
}

function LoadedRow({
  original,
  neutral,
  last,
}: {
  original: string;
  neutral: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid #2C2C2E",
        fontSize: 14,
      }}
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
        {original}
      </span>
      <span style={{ color: "#8E8E93" }}>→</span>
      <span style={{ color: "#1A7A5E" }}>{neutral}</span>
    </div>
  );
}

function SourceRow({
  name,
  headline,
  url,
  loadedLanguage,
  last = false,
}: {
  name: string;
  headline: string;
  url: string;
  loadedLanguage?: any;
  last?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = headline.length > 60 ? `${headline.slice(0, 60)}…` : headline;
  const items: Array<{ phrase?: string; neutral?: string; reason?: string }> = Array.isArray(loadedLanguage)
    ? loadedLanguage.filter((it: any) => it && (it.phrase || it.neutral))
    : [];
  const count = items.length;
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid #2C2C2E" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
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
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
          <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>{name}</span>
          {count > 0 && (
            <span style={{ color: "#E8873A", fontSize: 12 }}>
              · {count} loaded {count === 1 ? "phrase" : "phrases"}
            </span>
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
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 13,
              lineHeight: 1.4,
              marginBottom: 10,
            }}
          >
            {truncated}
          </div>
          {items.length === 0 ? (
            <div style={{ color: "#8E8E93", fontSize: 13 }}>No loaded language detected</div>
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
                LOADED LANGUAGE
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
