import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search, Trash2, Bookmark } from "lucide-react";
import { TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { supabase } from "@/integrations/supabase/client";
import { getArticle } from "@/lib/articleCatalog";

type SavedArticle = {
  id: string;
  topic: Topic;
  headline: string;
  savedDate: string;
  sources: number;
  bias: string;
  biasColor: string;
};

const FILTERS: { label: string; topic: Topic | "all" }[] = [
  { label: "All", topic: "all" },
  { label: "Politics", topic: "politics" },
  { label: "Climate", topic: "climate" },
  { label: "Tech", topic: "technology" },
  { label: "Economy", topic: "economics" },
  { label: "Sport", topic: "sport" },
  { label: "Health", topic: "health" },
  { label: "Culture", topic: "culture" },
  { label: "Local", topic: "local" },
];

const TOPIC_LABELS: Record<Topic, string> = {
  politics: "POLITICS",
  climate: "CLIMATE",
  economics: "ECONOMICS",
  sport: "SPORT",
  technology: "TECHNOLOGY",
  health: "HEALTH",
  culture: "CULTURE",
  local: "LOCAL",
  breaking: "BREAKING",
};

const DARK_TEXT: Topic[] = ["economics", "technology", "health"];

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved — lexinoori." }] }),
  component: SavedPage,
});

function formatSavedDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SavedPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Topic | "all">("all");
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggle, userId } = useSavedArticles();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        if (!cancelled) {
          setArticles([]);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("saved_articles")
        .select("article_id, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      const mapped = (data ?? []).map((r: { article_id: string; created_at: string }) => {
        const a = getArticle(r.article_id);
        return {
          id: a.id,
          topic: a.topic,
          headline: a.headline,
          savedDate: formatSavedDate(r.created_at),
          sources: a.sources,
          bias: a.bias,
          biasColor: a.biasColor,
        };
      });
      setArticles(mapped);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const filtered =
    filter === "all" ? articles : articles.filter((a) => a.topic === filter);

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
        <h1
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.1,
            marginTop: 8,
          }}
        >
          Saved.
        </h1>
        <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>
          {articles.length} {articles.length === 1 ? "article" : "articles"} saved
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ position: "relative", marginTop: 16 }}>
        <div
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
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
                  key={f.label}
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

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            marginTop: 16,
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {filtered.map((a) => (
            <SwipeableCard key={a.id} article={a} onRemove={() => handleRemove(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SwipeableCard({
  article,
  onRemove,
}: {
  article: SavedArticle;
  onRemove: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const REVEAL = 88;

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (dx < 0) setOffset(Math.max(dx, -REVEAL - 20));
    else if (offset < 0) setOffset(Math.min(0, offset + dx));
  };
  const onPointerUp = () => {
    if (offset < -REVEAL / 2) setOffset(-REVEAL);
    else setOffset(0);
    startX.current = null;
  };

  const topicColor = TOPIC_COLORS[article.topic];
  const labelColor = DARK_TEXT.includes(article.topic) ? "#111111" : "#FFFFFF";

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      {/* Delete area */}
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
        <span style={{ fontSize: 13, color: "#FFFFFF" }}>Remove</span>
      </button>

      {/* Card */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: topicColor,
              color: labelColor,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              padding: "6px 8px",
              borderRadius: 20,
              lineHeight: 1,
            }}
          >
            {TOPIC_LABELS[article.topic]}
          </span>
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
            Saved · {article.savedDate}
          </p>
          <p style={{ color: "#8E8E93", fontSize: 12, marginTop: 4 }}>
            Merged · {article.sources} sources
          </p>
          <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: article.biasColor,
                display: "inline-block",
              }}
            />
            <span style={{ color: "#8E8E93", fontSize: 12 }}>{article.bias}</span>
          </div>
        </div>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            flexShrink: 0,
            background: `linear-gradient(180deg, ${topicColor} 0%, #1C1C1E 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: "0 32px", minHeight: "50vh", marginTop: 32 }}
    >
      <Bookmark size={48} color="#2C2C2E" strokeWidth={1.5} />
      <h2
        style={{
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 20,
          marginTop: 16,
        }}
      >
        Nothing saved yet.
      </h2>
      <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 8 }}>
        Tap the bookmark icon on any article to save it.
      </p>
    </div>
  );
}
