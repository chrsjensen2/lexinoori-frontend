import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search, Trash2, Bookmark } from "lucide-react";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLang } from "@/lib/lang";
import { translations } from "@/lib/i18n";

type SavedArticle = {
  id: string;
  topic: Topic;
  headline: string;
  sources: number;
  readMinutes: number;
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

const DARK_TEXT: Topic[] = ["economics", "technology", "health"];

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved — lexinoori." }] }),
  component: SavedPage,
});

function toTopic(t: string | null | undefined): Topic {
  const valid: Topic[] = ["politics", "world", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const n = (t ?? "").toLowerCase();
  return (valid.includes(n as Topic) ? (n as Topic) : "politics");
}

function SavedPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang];
  const [filter, setFilter] = useState<Topic | "all">("all");
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const { toggle, userId } = useSavedArticles();
  const [depth, setDepth] = useState<Depth>(getDepth());

  useEffect(() => {
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
    async function load() {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        if (!cancelled) setArticles([]);
        return;
      }

      const language = getLang();
      const suffix = language === "en" ? "" : `_${language}`;

      const { data: savedRows } = await supabase
        .from("saved_articles")
        .select("article_id")
        .eq("user_id", uid);
      if (cancelled) return;

      const ids = (savedRows ?? []).map((r: { article_id: string }) => r.article_id);
      if (ids.length === 0) {
        setArticles([]);
        return;
      }

      const selectCols =
        "id, topic, read_time_minutes, source_count, headline, headline_da, headline_de, headline_es";

      const { data: articleRows } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .in("id", ids);
      if (cancelled) return;

      const mapped: SavedArticle[] = (articleRows ?? []).map((row: any) => ({
        id: row.id,
        topic: toTopic(row.topic),
        headline: (row[`headline${suffix}`] ?? row.headline) ?? "",
        sources: row.source_count ?? 0,
        readMinutes: row.read_time_minutes ?? 5,
      }));
      setArticles(mapped);
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const FILTERS: { label: string; topic: Topic | "all" }[] = [
    { label: t.allTopics, topic: "all" },
    { label: t.tabPolitics, topic: "politics" },
    { label: t.tabWorld, topic: "world" },
    { label: t.tabClimate, topic: "climate" },
    { label: t.tabTech, topic: "technology" },
    { label: t.tabEconomics, topic: "economics" },
    { label: t.tabSport, topic: "sport" },
    { label: t.tabHealth, topic: "health" },
    { label: t.tabCulture, topic: "culture" },
    { label: t.tabLocal, topic: "local" },
  ];

  const filtered = filter === "all" ? articles : articles.filter((a) => a.topic === filter);

  const handleRemove = async (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    await toggle(id);
  };

  return (
    <div style={{ fontFamily: "Heebo, system-ui, sans-serif", paddingTop: 16 }}>
      {/* Header */}
      <div style={{ padding: "0 16px" }}>
        <div className="flex items-center justify-between" style={{ height: 44 }}>
          <button
            onClick={() => router.history.back()}
            aria-label="Back"
            style={{ color: "#FFFFFF", background: "transparent", padding: 4 }}
          >
            <ArrowLeft size={24} />
          </button>
          <Link to="/search" aria-label="Search" style={{ color: "#8E8E93", background: "transparent", padding: 4, display: "inline-flex" }}>
            <Search size={24} />
          </Link>
        </div>
        <h1 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 32, lineHeight: 1.1, marginTop: 8 }}>
          {t.savedHeading}
        </h1>
        <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>
          {articles.length} {articles.length === 1 ? t.article : t.articles} {t.saved}
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ position: "relative", marginTop: 16 }}>
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <style>{`.lex-saved-filters::-webkit-scrollbar{display:none}`}</style>
          <div
            className="lex-saved-filters flex"
            style={{ gap: 8, paddingLeft: 16, paddingRight: 0, minWidth: "max-content" }}
          >
            {FILTERS.map((f) => {
              const isActive = filter === f.topic;
              const bg =
                isActive && f.topic !== "all"
                  ? TOPIC_COLORS[f.topic as Topic]
                  : isActive
                    ? "#FFFFFF"
                    : "#1C1C1E";
              const color =
                isActive && f.topic !== "all" && DARK_TEXT.includes(f.topic as Topic)
                  ? "#111111"
                  : isActive
                    ? f.topic === "all"
                      ? "#111111"
                      : "#FFFFFF"
                    : "#8E8E93";
              return (
                <button
                  key={f.topic}
                  onClick={() => setFilter(f.topic)}
                  style={{
                    backgroundColor: bg,
                    color,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "6px 8px",
                    borderRadius: 20,
                    border: isActive ? "1px solid transparent" : "1px solid #2C2C2E",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 32,
            pointerEvents: "none",
            background: "linear-gradient(90deg, rgba(17,17,17,0) 0%, #111111 100%)",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ marginTop: 16, padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((a) => (
            <SwipeableCard key={a.id} article={a} depth={depth} onRemove={() => handleRemove(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SwipeableCard({
  article,
  onRemove,
  depth,
}: {
  article: SavedArticle;
  onRemove: () => void;
  depth: Depth;
}) {
  const lang = useLanguage();
  const t = translations[lang];
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const REVEAL = 88;

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;
    if (dx < 0) setOffset(Math.max(dx, -REVEAL - 20));
    else if (offset < 0) setOffset(Math.min(0, offset + dx));
  };
  const onPointerUp = () => {
    if (offset < -REVEAL / 2) setOffset(-REVEAL);
    else setOffset(0);
    startX.current = null;
  };

  const topicColor = TOPIC_COLORS[article.topic];

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={onRemove}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: REVEAL,
          backgroundColor: "#FF3B30",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          border: "none",
        }}
        aria-label="Remove"
      >
        <Trash2 size={22} />
        <span style={{ fontSize: 13, color: "#FFFFFF" }}>{t.remove}</span>
      </button>

      <Link
        to="/article/$id"
        params={{ id: article.id }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => {
          if (moved.current || offset !== 0) e.preventDefault();
        }}
        style={{
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          gap: 12,
          transform: `translateX(${offset}px)`,
          transition: startX.current === null ? "transform 200ms ease" : "none",
          touchAction: "pan-y",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <TopicPill topic={article.topic} />
          <h3
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.3,
              marginTop: 6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.headline}
          </h3>
          <p style={{ color: "#8E8E93", fontSize: 12, marginTop: 6 }}>
            {t.merged} · {article.sources} {article.sources === 1 ? t.source : t.sources}
          </p>
          <p style={{ color: "#8E8E93", fontSize: 12, marginTop: 4 }}>
            {depthMinutes(depth, article.readMinutes)} {t.minRead}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <button
            aria-label="Unsave"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            style={{ color: "#1A7A5E", background: "transparent", display: "inline-flex", padding: 0 }}
          >
            <Bookmark size={22} fill="#1A7A5E" />
          </button>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              background: `linear-gradient(180deg, ${topicColor} 0%, #1C1C1E 100%)`,
            }}
          />
        </div>
      </Link>
    </div>
  );
}

function EmptyState() {
  const lang = useLanguage();
  const t = translations[lang];
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: "0 32px", minHeight: "50vh", marginTop: 32 }}
    >
      <Bookmark size={48} color="#2C2C2E" strokeWidth={1.5} />
      <h2 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20, marginTop: 16 }}>
        {t.noSavedArticles}
      </h2>
      <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 8 }}>
        {t.tapToSave}
      </p>
    </div>
  );
}
