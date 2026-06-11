import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Search as SearchIcon, Clock, X, Bookmark } from "lucide-react";
import { TOPIC_COLORS, TopicPill, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { getUserLanguage, pickLang, TRANSLATED_COLS } from "@/lib/articleLanguage";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

const DARK_TEXT: Topic[] = ["economics", "technology", "health"];

const RECENT_DEFAULT = [
  "EU sanctions",
  "Climate permafrost",
  "Bank of Japan",
];

type ArticleResult = {
  id: string;
  topic: string | null;
  headline: string;
  body_standard: string | null;
  source_count: number | null;
  read_time_minutes: number | null;
  created_at: string;
  is_breaking: boolean | null;
};

type JournalistResult = {
  id: string;
  name: string;
  article_count: number | null;
  confidence_level: string | null;
  outlet: string | null;
};

type SourceResult = {
  id: string;
  name: string;
  tier: number | null;
  url: string | null;
  owner: string | null;
  article_count: number | null;
  logo_url: string | null;
};

type Depth = "Bullets" | "Brief" | "Standard" | "Deep Dive";
function getDepth(): Depth {
  if (typeof window === "undefined") return "Standard";
  const v = window.localStorage.getItem("lex:depth");
  return v === "Bullets" || v === "Brief" || v === "Deep Dive" ? v : "Standard";
}
function depthMinutes(depth: Depth, minutes: number): number {
  if (depth === "Bullets") return 1;
  if (depth === "Brief") return 2;
  if (depth === "Deep Dive") return minutes * 3;
  return Math.max(2, minutes);
}

function toTopic(t: string | null): Topic | undefined {
  const valid: Topic[] = ["politics", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const n = t?.toLowerCase() ?? "";
  return valid.includes(n as Topic) ? (n as Topic) : undefined;
}

function SectionLabel({ children, mt = 16 }: { children: React.ReactNode; mt?: number }) {
  return (
    <div
      style={{
        color: "#8E8E93",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        paddingLeft: 16,
        marginTop: mt,
      }}
    >
      {children}
    </div>
  );
}

function ResultCard({ article }: { article: ArticleResult }) {
  const { isSaved, toggle } = useSavedArticles();
  const saved = isSaved(article.id);
  const lang = useLanguage();
  const t = translations[lang];
  const validTopic = toTopic(article.topic);
  const outletInitial = (article.headline || "?").trim().charAt(0).toUpperCase();

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${Math.max(m, 1)}${t.minAgo}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t.hrAgo}`;
    return `${Math.floor(h / 24)}${t.dayAgo}`;
  }

  return (
    <Link
      to="/article/$id"
      params={{ id: article.id }}
      className="block"
      style={{
        backgroundColor: "#1C1C1E",
        border: "1px solid #2C2C2E",
        borderRadius: 12,
        padding: 16,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {validTopic && <TopicPill topic={validTopic} />}
        </div>
        <span style={{ color: "#8E8E93", fontSize: 12 }}>{timeAgo(article.created_at)}</span>
      </div>
      <h3 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 18, lineHeight: 1.3, marginTop: 8 }}>
        {article.headline}
      </h3>
      {article.body_standard && (
        <p style={{ color: "#8E8E93", fontSize: 14, lineHeight: 1.4, marginTop: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.body_standard}
        </p>
      )}
      <div className="flex items-center gap-2" style={{ marginTop: 12 }}>
        <span className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: "#2C2C2E", color: "#8E8E93", fontSize: 11, fontWeight: 700 }}>
          {outletInitial}
        </span>
        <span style={{ color: "#8E8E93", fontSize: 13 }}>
          {article.source_count
            ? `${t.merged} · ${article.source_count} ${article.source_count === 1 ? t.source : t.sources}`
            : t.merged}
        </span>
        <span style={{ color: "#8E8E93", fontSize: 13, marginLeft: "auto" }}>
          {depthMinutes(getDepth(), article.read_time_minutes ?? 5)} {t.min}
        </span>
        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(article.id); }}
          style={{ color: saved ? "#1A7A5E" : "#8E8E93", background: "transparent", display: "inline-flex" }}
        >
          <Bookmark size={24} fill={saved ? "#1A7A5E" : "none"} />
        </button>
      </div>
    </Link>
  );
}

function SourceCard({ source }: { source: SourceResult }) {
  const tierColor =
    source.tier === 1 ? "#00C864"
    : source.tier === 2 ? "#1A7A5E"
    : "#8E8E93";
  const tierLabel = source.tier != null ? `TIER ${source.tier}` : null;

  return (
    <Link
      to="/outlet/$id"
      params={{ id: source.id }}
      style={{
        display: "block",
        backgroundColor: "#1E3A5F",
        borderRadius: 12,
        padding: 16,
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
          {source.name}
        </div>
        {source.logo_url && (
          <img
            src={source.logo_url}
            alt={source.name}
            style={{ width: 36, height: 36, borderRadius: 6, objectFit: "contain", flexShrink: 0 }}
          />
        )}
      </div>
      {source.owner && (
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 }}>
          {source.owner}
        </div>
      )}
      {source.article_count != null && source.article_count > 0 && (
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
          {source.article_count} artikler analyseret
        </div>
      )}
    </Link>
  );
}

function JournalistCard({ journalist }: { journalist: JournalistResult }) {
  const articleCount = journalist.article_count ?? 0;
  const dbConf = journalist.confidence_level?.toUpperCase();
  const confidence = dbConf ?? (
    articleCount >= 500 ? "HIGH"
    : articleCount >= 100 ? "MODERATE"
    : articleCount >= 20 ? "LOW"
    : "BUILDING"
  );
  const confidenceLabel =
    confidence === "BUILDING" ? "UNDER OPBYGNING"
    : confidence === "LOW" ? "TILSTRÆKKELIGE DATA"
    : confidence === "MODERATE" ? "PÅLIDELIGE DATA"
    : "STÆRKE DATA";
  const confidenceColor =
    confidence === "BUILDING" ? "#E8873A"
    : confidence === "LOW" ? "#8E8E93"
    : confidence === "MODERATE" ? "#1A7A5E"
    : "#00C864";

  return (
    <Link
      to="/journalist/$id"
      params={{ id: journalist.id }}
      style={{
        display: "block",
        backgroundColor: "#1A7A5E",
        borderRadius: 12,
        padding: 16,
        textDecoration: "none",
      }}
    >
      <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
        {journalist.name}
      </div>
      {journalist.outlet && (
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>
          {journalist.outlet}
        </div>
      )}
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>
        {articleCount} artikler analyseret
      </div>
      <div style={{ marginTop: 10 }}>
        <span
          style={{
            backgroundColor: confidenceColor,
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          {confidenceLabel}
        </span>
      </div>
    </Link>
  );
}

function SearchPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(RECENT_DEFAULT);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [results, setResults] = useState<ArticleResult[]>([]);
  const [sourceResult, setSourceResult] = useState<SourceResult | null>(null);
  const [journalistResult, setJournalistResult] = useState<JournalistResult | null>(null);
  const [journalistArticles, setJournalistArticles] = useState<ArticleResult[]>([]);
  const [loading, setLoading] = useState(false);

  const TOPIC_LABELS: Partial<Record<Topic, string>> = {
    politics: t.pillPolitics,
    climate: t.pillClimate,
    technology: t.pillTech,
    economics: t.pillEconomics,
    sport: t.pillSport,
    health: t.pillHealth,
    culture: t.pillCulture,
    local: t.pillLocal,
    breaking: t.pillBreaking,
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim();
  const showRecent = trimmed.length === 0;

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setSourceResult(null);
      setJournalistResult(null);
      setJournalistArticles([]);
      setActiveTopic(null);
      return;
    }
    setActiveTopic(null);
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      const language = await getUserLanguage();
      const articleCols =
        "id, topic, read_time_minutes, source_count, created_at, is_breaking, " + TRANSLATED_COLS;

      const mapArticle = (r: any): ArticleResult => ({
        id: r.id,
        topic: r.topic,
        source_count: r.source_count,
        read_time_minutes: r.read_time_minutes,
        created_at: r.created_at,
        is_breaking: r.is_breaking,
        headline: pickLang<string>(r, "headline", language) ?? "",
        body_standard: pickLang<string | null>(r, "body_standard", language) ?? null,
      });

      // Run source + journalist + article searches in parallel
      const [sourceRes, journalistRes, articleRes] = await Promise.all([
        (supabase as any)
          .from("sources")
          .select("id, name, tier, url, owner, article_count, logo_url")
          .ilike("name", `%${trimmed}%`)
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from("journalists")
          .select("id, name, article_count, confidence_level, sources:current_source_id(name)")
          .ilike("name", `%${trimmed}%`)
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from("articles")
          .select(articleCols)
          .ilike("headline", `%${trimmed}%`)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (cancelled) return;

      // Source match
      const sRow = sourceRes.data ?? null;
      setSourceResult(sRow ? { id: sRow.id, name: sRow.name, tier: sRow.tier, url: sRow.url, owner: sRow.owner, article_count: sRow.article_count } : null);

      // Journalist match
      const jRow = journalistRes.data ?? null;
      if (jRow) {
        setJournalistResult({
          id: jRow.id,
          name: jRow.name,
          article_count: jRow.article_count,
          confidence_level: jRow.confidence_level,
          outlet: jRow.sources?.name ?? null,
        });

        // Fetch merged articles where this journalist is a source
        const { data: saRows } = await (supabase as any)
          .from("source_articles")
          .select("cluster_id")
          .eq("journalist_id", jRow.id)
          .not("cluster_id", "is", null);

        if (cancelled) return;

        const clusterIds = [...new Set(
          ((saRows ?? []) as any[]).map((r) => r.cluster_id).filter(Boolean)
        )];

        if (clusterIds.length > 0) {
          const { data: jArtRows } = await (supabase as any)
            .from("articles")
            .select(articleCols)
            .in("cluster_id", clusterIds)
            .order("created_at", { ascending: false })
            .limit(20);
          if (cancelled) return;
          setJournalistArticles(((jArtRows as any[]) ?? []).map(mapArticle));
        } else {
          setJournalistArticles([]);
        }
      } else {
        setJournalistResult(null);
        setJournalistArticles([]);
      }

      // Article headline results (deduplicated against journalist articles below at render time)
      setResults(((articleRes.data as any[]) ?? []).map(mapArticle));
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  const removeRecent = (term: string) => setRecent((r) => r.filter((i) => i !== term));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", paddingTop: "env(safe-area-inset-top)" }}>
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 56, backgroundColor: "#1C1C1E", border: "1px solid #2C2C2E", borderRadius: 12, display: "flex", alignItems: "center", paddingLeft: 16, paddingRight: 12 }}>
          <SearchIcon size={20} color="#8E8E93" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ flex: 1, marginLeft: 12, background: "transparent", border: "none", outline: "none", color: "#FFFFFF", caretColor: "#FFFFFF", fontSize: 14, fontFamily: "inherit" }}
          />
        </div>
        <button
          onClick={() => router.history.back()}
          style={{ background: "transparent", border: "none", color: "#1A7A5E", fontSize: 15, fontWeight: 400, padding: 0, cursor: "pointer" }}
        >
          {t.cancel}
        </button>
      </div>

      {!showRecent && results.length > 0 && (() => {
        const availableTopics = [...new Set(
          results.map((a) => toTopic(a.topic)).filter((tp): tp is Topic => tp !== undefined)
        )];
        if (availableTopics.length === 0) return null;
        return (
          <>
            <SectionLabel mt={8}>{t.topicsSection}</SectionLabel>
            <div style={{ marginTop: 8, display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none" }}>
              {availableTopics.map((topicId) => {
                const active = activeTopic === topicId;
                const bg = active ? TOPIC_COLORS[topicId] : "#1C1C1E";
                const color = active ? (DARK_TEXT.includes(topicId) ? "#111111" : "#FFFFFF") : "#8E8E93";
                return (
                  <button
                    key={topicId}
                    onClick={() => setActiveTopic(active ? null : topicId)}
                    style={{ backgroundColor: bg, color, border: active ? "none" : "1px solid #2C2C2E", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", padding: "6px 8px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer" }}
                  >
                    {TOPIC_LABELS[topicId] ?? topicId.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}

      {showRecent ? (
        <>
          <SectionLabel>{t.recentSection}</SectionLabel>
          <div style={{ marginTop: 8 }}>
            {recent.map((term, idx) => (
              <div key={term} style={{ height: 48, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: idx < recent.length - 1 ? "1px solid #2C2C2E" : "none", gap: 12 }}>
                <Clock size={20} color="#8E8E93" />
                <button
                  onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                  style={{ flex: 1, background: "transparent", border: "none", color: "#FFFFFF", fontSize: 15, textAlign: "left", padding: 0, cursor: "pointer" }}
                >
                  {term}
                </button>
                <button
                  onClick={() => removeRecent(term)}
                  aria-label={`Remove ${term}`}
                  style={{ background: "transparent", border: "none", color: "#8E8E93", padding: 4, cursor: "pointer", display: "flex" }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (() => {
          const journalistArticleIds = new Set(journalistArticles.map((a) => a.id));
          const deduped = results.filter((a) => !journalistArticleIds.has(a.id));
          const filteredResults = activeTopic
            ? deduped.filter((a) => toTopic(a.topic) === activeTopic)
            : deduped;
          const hasResults =
            !!sourceResult || !!journalistResult || journalistArticles.length > 0 || deduped.length > 0;

          if (loading && !hasResults) {
            return (
              <div style={{ color: "#8E8E93", fontSize: 14, padding: "24px 16px" }}>
                {t.searching}
              </div>
            );
          }
          if (!hasResults) {
            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", marginTop: "30vh" }}>
                <div style={{ color: "#8E8E93", fontSize: 16 }}>{t.noResultsFor}</div>
                <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, marginTop: 4 }}>{trimmed}</div>
                <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 8 }}>{t.tryDifferent}</div>
              </div>
            );
          }
          return (
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {sourceResult && (
                <>
                  <SectionLabel mt={0}>MEDIE</SectionLabel>
                  <SourceCard source={sourceResult} />
                </>
              )}

              {journalistResult && (
                <>
                  <SectionLabel mt={sourceResult ? 4 : 0}>JOURNALIST</SectionLabel>
                  <JournalistCard journalist={journalistResult} />
                </>
              )}

              {journalistArticles.length > 0 && (
                <>
                  <SectionLabel mt={4}>{journalistResult?.name.toUpperCase()} · ARTIKLER</SectionLabel>
                  {journalistArticles.map((a) => (
                    <ResultCard key={a.id} article={a} />
                  ))}
                </>
              )}

              {filteredResults.length > 0 && (
                <>
                  <SectionLabel mt={4}>{t.storiesSection}</SectionLabel>
                  {filteredResults.map((a) => (
                    <ResultCard key={a.id} article={a} />
                  ))}
                </>
              )}
            </div>
          );
        })()}
    </div>
  );
}
