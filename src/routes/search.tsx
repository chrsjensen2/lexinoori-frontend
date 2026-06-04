import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Search as SearchIcon, Clock, X, Bookmark } from "lucide-react";
import { TOPIC_COLORS, TopicPill, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { getUserLanguage, pickLang, TRANSLATED_COLS } from "@/lib/articleLanguage";
import { useSavedArticles } from "@/hooks/useSavedArticles";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

const TOPICS: { id: Topic; label: string }[] = [
  { id: "politics", label: "POLITICS" },
  { id: "climate", label: "CLIMATE" },
  { id: "technology", label: "TECH" },
  { id: "economics", label: "ECONOMY" },
  { id: "sport", label: "SPORT" },
  { id: "health", label: "HEALTH" },
  { id: "culture", label: "CULTURE" },
  { id: "local", label: "LOCAL" },
];

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
  return minutes;
}

function toTopic(t: string | null): Topic | undefined {
  const valid: Topic[] = ["politics","climate","economics","sport","technology","health","culture","local","breaking"];
  const n = t?.toLowerCase() ?? "";
  return valid.includes(n as Topic) ? (n as Topic) : undefined;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(m, 1)}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
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
  const validTopic = toTopic(article.topic);
  const outletInitial = (article.headline || "?").trim().charAt(0).toUpperCase();
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
          {article.source_count ? `Merged · ${article.source_count} sources` : "Merged"}
        </span>
        <span style={{ color: "#8E8E93", fontSize: 13, marginLeft: "auto" }}>
          {depthMinutes(getDepth(), article.read_time_minutes ?? 5)} min
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

function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(RECENT_DEFAULT);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [results, setResults] = useState<ArticleResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim();
  const showRecent = trimmed.length === 0;

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = window.setTimeout(async () => {
      const language = await getUserLanguage();
      const selectCols =
        "id, topic, read_time_minutes, source_count, created_at, is_breaking, " + TRANSLATED_COLS;
      const { data } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .ilike("headline", `%${trimmed}%`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      setResults(
        ((data as any[]) || []).map((r) => ({
          id: r.id,
          topic: r.topic,
          source_count: r.source_count,
          read_time_minutes: r.read_time_minutes,
          created_at: r.created_at,
          is_breaking: r.is_breaking,
          headline: pickLang<string>(r, "headline", language) ?? "",
          body_standard: pickLang<string | null>(r, "body_standard", language) ?? null,
        }))
      );
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [trimmed]);

  const removeRecent = (term: string) => setRecent((r) => r.filter((t) => t !== term));

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
            placeholder="Search stories, topics, journalists..."
            style={{ flex: 1, marginLeft: 12, background: "transparent", border: "none", outline: "none", color: "#FFFFFF", caretColor: "#FFFFFF", fontSize: 14, fontFamily: "inherit" }}
          />
        </div>
        <button
          onClick={() => router.history.back()}
          style={{ background: "transparent", border: "none", color: "#1A7A5E", fontSize: 15, fontWeight: 400, padding: 0, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>

      <SectionLabel mt={8}>TOPICS</SectionLabel>
      <div style={{ marginTop: 8, display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none" }}>
        {TOPICS.map((t) => {
          const active = activeTopic === t.id;
          const bg = active ? TOPIC_COLORS[t.id] : "#1C1C1E";
          const color = active ? (DARK_TEXT.includes(t.id) ? "#111111" : "#FFFFFF") : "#8E8E93";
          return (
            <button
              key={t.id}
              onClick={() => setActiveTopic(active ? null : t.id)}
              style={{ backgroundColor: bg, color, border: active ? "none" : "1px solid #2C2C2E", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", padding: "6px 8px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {showRecent ? (
        <>
          <SectionLabel>RECENT</SectionLabel>
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
      ) : results.length > 0 ? (
        <>
          <SectionLabel>STORIES</SectionLabel>
          <div style={{ marginTop: 12, padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((a) => (
              <ResultCard key={a.id} article={a} />
            ))}
          </div>
        </>
      ) : loading ? (
        <div style={{ color: "#8E8E93", fontSize: 14, padding: "24px 16px" }}>Searching…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", marginTop: "30vh" }}>
          <div style={{ color: "#8E8E93", fontSize: 16 }}>No results for</div>
          <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, marginTop: 4 }}>{trimmed}</div>
          <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 8 }}>Try a different keyword or topic.</div>
        </div>
      )}
    </div>
  );
}
