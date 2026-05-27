import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Bookmark } from "lucide-react";
import { TopicTabs } from "@/components/feed/TopicTabs";
import { BreakingNewsCard } from "@/components/feed/BreakingNewsCard";
import { TopicPill, WhatsNewPill, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { useSavedArticles } from "@/hooks/useSavedArticles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — lexinoori." },
      { name: "description", content: "Today's news, merged from 213 outlets." },
    ],
  }),
  component: TodayPage,
});

type SourceArticle = {
  id: string;
  headline: string;
  body_standard: string | null;
  topic: string | null;
  read_time_minutes: number | null;
  source_count: number | null;
  created_at: string;
  is_breaking: boolean | null;
};

function formatDate(d: Date) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  const days = Math.floor(hrs / 24);
  return `${days}D AGO`;
}

function toTopic(t: string | null): Topic | undefined {
  const valid: Topic[] = ["politics", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const normalized = t?.toLowerCase() ?? "";
  return valid.includes(normalized as Topic) ? (normalized as Topic) : undefined;
}

type Depth = "Bullets" | "Brief" | "Standard" | "Deep Dive";
function getDepth(): Depth {
  if (typeof window === "undefined") return "Standard";
  const v = window.localStorage.getItem("lex:depth");
  return v === "Bullets" || v === "Brief" || v === "Deep Dive" ? v : "Standard";
}
function readTimeLabel(depth: Depth, minutes: number | null): string {
  if (depth === "Bullets") return "< 1 min";
  if (depth === "Brief") return "1-2 min";
  return `${minutes ?? 5} min`;
}

function SourceArticleCard({ article, depth }: { article: SourceArticle; depth: Depth }) {
  const { isSaved, toggle } = useSavedArticles();
  const saved = isSaved(article.id);
  const validTopic = toTopic(article.topic);
  const sourceCount = article.source_count ?? 0;
  const sourceLabel = sourceCount > 0
    ? `${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`
    : "";



  return (
    <Link
      to="/article/$id"
      params={{ id: article.id }}
      className="block"
      style={{
        backgroundColor: "#1C1C1E",
        border: "1px solid #2C2C2E",
        borderRadius: 12,
        margin: "0 16px",
        padding: 16,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {validTopic && <TopicPill topic={validTopic} />}
          {article.is_breaking && <WhatsNewPill />}
        </div>
        <span style={{ color: "#8E8E93", fontSize: 12 }}>{timeAgo(article.created_at)}</span>
      </div>

      <h3
        style={{
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.3,
          marginTop: 8,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {article.headline}
      </h3>

      {article.body_standard && (
        <p
          style={{
            color: "#8E8E93",
            fontSize: 14,
            lineHeight: 1.4,
            marginTop: 8,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.body_standard}
        </p>
      )}

      <div className="flex items-center gap-2" style={{ marginTop: 12 }}>
        <span style={{ color: "#8E8E93", fontSize: 13 }}>{sourceLabel}</span>
        <span style={{ color: "#8E8E93", fontSize: 13, marginLeft: "auto" }}>
          {readTimeLabel(depth, article.read_time_minutes)}
        </span>

        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(article.id);
          }}
          style={{
            color: saved ? "#1A7A5E" : "#8E8E93",
            background: "transparent",
            display: "inline-flex",
          }}
        >
          <Bookmark size={24} fill={saved ? "#1A7A5E" : "none"} />
        </button>
      </div>
    </Link>
  );
}

function TodayPage() {
  const [dateLabel, setDateLabel] = useState("");
  const [activeTab, setActiveTab] = useState("Today");

  const [articles, setArticles] = useState<SourceArticle[]>([]);
  const [breakingArticle, setBreakingArticle] = useState<SourceArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState<Depth>("Standard");
  const [sourceCount, setSourceCount] = useState(0);
  const [todayStoryCount, setTodayStoryCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const PULL_THRESHOLD = 70;

  useEffect(() => {
    setDateLabel(formatDate(new Date()));
    setDepth(getDepth());
    const onDepth = () => setDepth(getDepth());
    window.addEventListener("lex:depth-changed", onDepth);
    window.addEventListener("storage", onDepth);
    return () => {
      window.removeEventListener("lex:depth-changed", onDepth);
      window.removeEventListener("storage", onDepth);
    };
  }, []);


  useEffect(() => {
    let cancelled = false;

    const TAB_TO_TOPIC: Record<string, string | null> = {
      Today: null,
      Politics: "politics",
      Climate: "climate",
      Tech: "technology",
      Economy: "economics",
      Sport: "sport",
      Culture: "culture",
      Health: "health",
      Local: "local",
    };

    const fetchArticles = async () => {
      setLoading(true);

      let language = "en";
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("primary_language")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        if (profile?.primary_language) language = profile.primary_language;
      }

      const suffix = language === "en" ? "" : `_${language}`;
      const pick = <T,>(row: any, base: string): T =>
        (row?.[`${base}${suffix}`] ?? row?.[base]) as T;

      const selectCols =
        "id, topic, read_time_minutes, source_count, created_at, is_breaking, " +
        "headline, body_standard, " +
        "headline_da, body_standard_da, headline_de, body_standard_de, headline_es, body_standard_es";

      const topicFilter = TAB_TO_TOPIC[activeTab] ?? null;

      let query = (supabase as any)
        .from("articles")
        .select(selectCols)
        .order("created_at", { ascending: false })
        .limit(50);
      if (topicFilter) query = query.eq("topic", topicFilter);

      const [{ data, error }, breakingRes] = await Promise.all([
        query,
        (supabase as any)
          .from("articles")
          .select(selectCols)
          .eq("is_breaking", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      const mapRow = (row: any): SourceArticle => ({
        id: row.id,
        topic: row.topic,
        read_time_minutes: row.read_time_minutes,
        source_count: row.source_count,
        created_at: row.created_at,
        is_breaking: row.is_breaking,
        headline: pick<string>(row, "headline") ?? "",
        body_standard: pick<string | null>(row, "body_standard") ?? null,
      });
      if (!error && data) {
        const mapped = (data as any[]).map(mapRow);
        setArticles(mapped);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Count outlets active in the last 24h: source_articles -> journalists -> sources.id
        const { data: saData } = await (supabase as any)
          .from("source_articles")
          .select("journalists:journalist_id(source_id)")
          .gt("scraped_at", twentyFourHoursAgo);
        const outlets = new Set<string>();
        for (const row of (saData as any[]) ?? []) {
          const sid = row?.journalists?.source_id;
          if (sid) outlets.add(String(sid));
        }
        setSourceCount(outlets.size);

        // Count articles created in the last 24h
        const { count: storyCount } = await (supabase as any)
          .from("articles")
          .select("id", { count: "exact", head: true })
          .gt("created_at", twentyFourHoursAgo);
        setTodayStoryCount(storyCount ?? 0);
      } else {
        setSourceCount(0);
        setTodayStoryCount(0);
      }
      setBreakingArticle(
        !breakingRes.error && breakingRes.data ? mapRow(breakingRes.data) : null
      );
      setLoading(false);
    };

    fetchArticles();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchArticles();
    });

    const onFocus = () => fetchArticles();
    window.addEventListener("focus", onFocus);
    window.addEventListener("lex:language-changed", onFocus);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("lex:language-changed", onFocus);
    };

  }, [activeTab]);



  return (
    <div>
      <header
        className="sticky top-0 z-30 bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div style={{ padding: "16px 24px 12px" }}>
          <div className="flex items-start justify-between gap-3">
            <h1
              className="flex items-center"
              style={{
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Today{!breakingArticle && "."}
              {breakingArticle && (
                <span
                  aria-label="Breaking news live"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: "#00C864",
                    marginLeft: 4,
                    marginBottom: 6,
                    alignSelf: "flex-end",
                    animation: "lex-pulse 1.6s ease-in-out infinite",
                  }}
                />
              )}

            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12 }}>
              <span
                style={{
                  color: "#8E8E93",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {dateLabel}
              </span>
              <Link
                to="/search"
                aria-label="Search"
                style={{ color: "#8E8E93", display: "inline-flex" }}
              >
                <Search size={24} />
              </Link>
            </div>
          </div>

          <p style={{ color: "#8E8E93", fontSize: 13, marginTop: 8 }}>
            {loading ? "Loading latest stories…" : `Today: ${todayStoryCount} new stories · ${sourceCount} outlets`}
          </p>
        </div>


        <div style={{ paddingBottom: 4 }}>
          <TopicTabs active={activeTab} onChange={setActiveTab} />
        </div>
        <div style={{ height: 1, backgroundColor: "#2C2C2E" }} />
      </header>

      {breakingArticle && (
        <div style={{ marginTop: 16 }}>
          <BreakingNewsCard
            headline={breakingArticle.headline}
            sources={breakingArticle.source_count ?? 0}
            timeAgo={timeAgo(breakingArticle.created_at)}
            articleId={breakingArticle.id}
          />
        </div>
      )}


      <div
        className="flex items-center justify-between"
        style={{ padding: "0 24px", marginTop: 20, marginBottom: 12 }}
      >
        <span style={{ color: "#8E8E93", fontSize: 11, letterSpacing: "0.08em", fontWeight: 700 }}>
          FOR YOU · {articles.length} STORIES
        </span>
      </div>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {articles.map((a) => (
          <SourceArticleCard key={a.id} article={a} depth={depth} />
        ))}

        {!loading && articles.length === 0 && (
          <p style={{ color: "#8E8E93", fontSize: 13, padding: "0 24px" }}>
            No articles yet. Check back soon.
          </p>
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
