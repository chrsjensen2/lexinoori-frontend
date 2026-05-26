import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "Atlas — lexinoori." },
      {
        name: "description",
        content: "Stories around the world, mapped by region and topic.",
      },
    ],
  }),
  component: AtlasPage,
});

type Article = {
  id: string;
  headline: string;
  topic: string | null;
  source_count: number | null;
  read_time_minutes: number | null;
  created_at: string;
  lat: number;
  lng: number;
  is_breaking: boolean | null;
};

type SnapKey = "collapsed" | "default" | "expanded";

type Depth = "Bullets" | "Brief" | "Standard" | "Deep Dive";
function getDepth(): Depth {
  if (typeof window === "undefined") return "Standard";
  const v = window.localStorage.getItem("lex:depth");
  return v === "Bullets" || v === "Brief" || v === "Deep Dive" ? v : "Standard";
}
function readTimeLabel(depth: Depth, minutes: number | null): string {
  if (depth === "Bullets") return "< 1 MIN";
  if (depth === "Brief") return "1-2 MIN";
  return `${minutes ?? 5} MIN`;
}

function toTopic(t: string | null): Topic | undefined {
  const valid: Topic[] = ["politics", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const normalized = t?.toLowerCase() ?? "";
  return valid.includes(normalized as Topic) ? (normalized as Topic) : undefined;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

// Equirectangular projection → percent of map area.
function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

function AtlasPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(700);
  const [snap, setSnap] = useState<SnapKey>("collapsed");
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragMoved = useRef(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [depth, setDepth] = useState<Depth>("Standard");

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerH(containerRef.current.clientHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
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
    (async () => {
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

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await (supabase as any)
        .from("articles")
        .select(
          "id, topic, source_count, read_time_minutes, created_at, is_breaking, lat, lng, headline, headline_da, headline_de, headline_es"
        )
        .gte("created_at", since)
        .not("lat", "is", null)
        .not("lng", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (cancelled || error || !data) return;
      const mapped: Article[] = (data as any[]).map((row) => ({
        id: row.id,
        headline: pick<string>(row, "headline") ?? "",
        topic: row.topic,
        source_count: row.source_count,
        read_time_minutes: row.read_time_minutes,
        created_at: row.created_at,
        lat: Number(row.lat),
        lng: Number(row.lng),
        is_breaking: row.is_breaking,
      }));
      setArticles(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const snapHeights: Record<SnapKey, number> = {
    collapsed: 130,
    default: Math.round(containerH * 0.55),
    expanded: Math.round(containerH * 0.8),
  };
  const baseH = snapHeights[snap];
  const liveH = Math.max(snapHeights.collapsed, Math.min(snapHeights.expanded, baseH - dragOffset));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragMoved.current = false;
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartY.current == null) return;
    const dy = e.clientY - dragStartY.current;
    if (Math.abs(dy) > 4) dragMoved.current = true;
    setDragOffset(dy);
  }, []);

  const cycle = (s: SnapKey): SnapKey => (s === "collapsed" ? "default" : s === "default" ? "expanded" : "collapsed");

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const moved = dragMoved.current;
      const dy = dragOffset;
      dragStartY.current = null;
      setDragging(false);
      setDragOffset(0);

      if (!moved) {
        setSnap((s) => cycle(s));
        return;
      }
      const order: SnapKey[] = ["collapsed", "default", "expanded"];
      const idx = order.indexOf(snap);
      const goingUp = dy < 0;
      const goingDown = dy > 0;
      if (goingUp && idx < 2) {
        const next = order[idx + 1];
        const distance = snapHeights[next] - snapHeights[snap];
        if (Math.abs(dy) >= distance * 0.3) {
          setSnap(next);
          return;
        }
      }
      if (goingDown && idx > 0) {
        const prev = order[idx - 1];
        const distance = snapHeights[snap] - snapHeights[prev];
        if (dy >= distance * 0.3) {
          setSnap(prev);
          return;
        }
      }
      void e;
    },
    [dragOffset, snap, snapHeights],
  );

  const peekArticle = useMemo(
    () => articles.find((a) => a.id === selectedId) ?? articles[0] ?? null,
    [articles, selectedId],
  );

  const handleMarkerTap = (id: string) => {
    setSelectedId(id);
    if (snap === "collapsed") setSnap("default");
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: "calc(100dvh - 64px - env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          paddingTop: "env(safe-area-inset-top)",
          backgroundColor: "#111111",
        }}
      >
        <div style={{ padding: "16px 24px 12px" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1
                style={{
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Atlas.
              </h1>
              <p
                style={{
                  color: "#8E8E93",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  marginTop: 8,
                  textTransform: "uppercase",
                }}
              >
                {articles.length} {articles.length === 1 ? "STORY" : "STORIES"} IN VIEW
              </p>
            </div>
            <Link to="/search" aria-label="Search" style={{ color: "#8E8E93", paddingTop: 6, display: "inline-flex" }}>
              <Search size={24} />
            </Link>
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          width: "100%",
          backgroundColor: "#0A0A0F",
          overflow: "hidden",
        }}
      >
        <WorldMap />
        {articles.map((a) => {
          const { x, y } = projectLatLng(a.lat, a.lng);
          const topic = toTopic(a.topic);
          const color = topic ? TOPIC_COLORS[topic] : "#8E8E93";
          const isSelected = a.id === selectedId;
          return (
            <ArticleMarker
              key={a.id}
              x={x}
              y={y}
              color={color}
              pulse={!!a.is_breaking}
              selected={isSelected}
              label={a.headline}
              onTap={() => handleMarkerTap(a.id)}
            />
          );
        })}
        <ZoomControl />
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          right: "auto",
          bottom: "calc(64px + env(safe-area-inset-bottom))",
          width: "100%",
          maxWidth: 390,
          height: liveH,
          transform: "translateX(-50%)",
          backgroundColor: "#1C1C1E",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
          transition: dragging ? "none" : "height 300ms ease-in-out",
          touchAction: "none",
          zIndex: 5,
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: 20,
            minHeight: 44,
            flexShrink: 0,
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 4,
              backgroundColor: "#2C2C2E",
              borderRadius: 999,
            }}
          />
        </div>

        {snap === "collapsed" && !dragging ? (
          peekArticle ? (
            <Link
              to="/article/$id"
              params={{ id: peekArticle.id }}
              style={{ textDecoration: "none", display: "block" }}
            >
              <CollapsedPeek article={peekArticle} />
            </Link>
          ) : (
            <EmptyPeek />
          )
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              maxHeight: "100%",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              padding: "8px 20px 24px",
            }}
          >
            {articles.length === 0 ? (
              <p style={{ color: "#8E8E93", fontSize: 14, padding: "16px 0" }}>
                No stories with location data in the last 24 hours.
              </p>
            ) : (
              articles.map((a, i) => (
                <ArticleRow
                  key={a.id}
                  article={a}
                  depth={depth}
                  selected={a.id === selectedId}
                  last={i === articles.length - 1}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsedPeek({ article }: { article: Article }) {
  const topic = toTopic(article.topic);
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        padding: "0 20px",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center gap-2" style={{ paddingTop: 4 }}>
        {topic && <TopicPill topic={topic} />}
        <span
          style={{
            color: "#8E8E93",
            fontSize: 11,
            letterSpacing: "0.08em",
            fontWeight: 700,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {timeAgo(article.created_at)}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 8,
          maxHeight: 35,
          overflow: "hidden",
        }}
      >
        <h3
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {article.headline}
        </h3>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 24,
            background: "linear-gradient(to bottom, rgba(28,28,30,0), #1C1C1E)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function EmptyPeek() {
  return (
    <div style={{ padding: "0 20px" }}>
      <p style={{ color: "#8E8E93", fontSize: 14 }}>
        No stories with location data in the last 24 hours.
      </p>
    </div>
  );
}

function ArticleRow({
  article,
  depth,
  selected,
  last,
}: {
  article: Article;
  depth: Depth;
  selected: boolean;
  last?: boolean;
}) {
  const topic = toTopic(article.topic);
  const sourceCount = article.source_count ?? 0;
  const sourceLabel =
    sourceCount > 0 ? `${sourceCount} ${sourceCount === 1 ? "source" : "sources"}` : "";

  return (
    <Link
      to="/article/$id"
      params={{ id: article.id }}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: selected ? 12 : 0,
          paddingRight: selected ? 12 : 0,
          marginLeft: selected ? -12 : 0,
          marginRight: selected ? -12 : 0,
          borderRadius: selected ? 12 : 0,
          backgroundColor: selected ? "rgba(26,122,94,0.10)" : "transparent",
          borderBottom: last ? "none" : "1px solid #2C2C2E",
        }}
      >
        <div className="flex items-center gap-2">
          {topic && <TopicPill topic={topic} />}
          <span
            style={{
              color: "#8E8E93",
              fontSize: 11,
              letterSpacing: "0.08em",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {timeAgo(article.created_at)}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3" style={{ marginTop: 8 }}>
          <h3
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 18,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              flex: 1,
            }}
          >
            {article.headline}
          </h3>
          <ArrowRight size={20} color="#1A7A5E" style={{ flexShrink: 0, marginBottom: 2 }} />
        </div>
        <div
          className="flex items-center gap-3"
          style={{ marginTop: 8, color: "#8E8E93", fontSize: 12 }}
        >
          {sourceLabel && <span>{sourceLabel}</span>}
          <span style={{ marginLeft: "auto" }}>
            {readTimeLabel(depth, article.read_time_minutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleMarker({
  x,
  y,
  color,
  pulse,
  selected,
  label,
  onTap,
}: {
  x: number;
  y: number;
  color: string;
  pulse: boolean;
  selected: boolean;
  label: string;
  onTap: () => void;
}) {
  const size = selected ? 20 : 14;
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onTap();
      }}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        padding: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: 2,
      }}
    >
      {pulse && (
        <span
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 999,
            border: `2px solid ${color}`,
            animation: "lex-pulse 1.6s ease-in-out infinite",
          }}
        />
      )}
      <span
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          borderRadius: 999,
          backgroundColor: color,
          border: selected ? "2px solid #FFFFFF" : "2px solid rgba(255,255,255,0.7)",
          boxShadow: `0 0 12px ${color}80`,
        }}
      />
    </button>
  );
}

function ZoomControl() {
  const levels = [
    { key: "WORLD", top: 0 },
    { key: "CONTINENT", top: 40 },
    { key: "COUNTRY", top: 80, active: true },
    { key: "LOCAL", top: 120 },
  ];
  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: "50%",
        transform: "translateY(-50%)",
        height: 120,
        width: 80,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 8,
          top: 0,
          width: 2,
          height: 120,
          backgroundColor: "#2C2C2E",
          borderRadius: 999,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 3,
          top: 80 - 6,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: "#1A7A5E",
          boxShadow: "0 0 8px rgba(26,122,94,0.6)",
        }}
      />
      {levels.map((l) => (
        <span
          key={l.key}
          style={{
            position: "absolute",
            right: 20,
            top: l.top - 5,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: l.active ? "#FFFFFF" : "#8E8E93",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {l.key}
        </span>
      ))}
    </div>
  );
}

function WorldMap() {
  const fill = "#1A1A2A";
  return (
    <svg
      viewBox="0 0 390 360"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{ display: "block" }}
      aria-hidden
    >
      <path
        d="M 8 80 L 55 60 L 105 70 L 130 95 L 135 135 L 115 175 L 80 195 L 45 180 L 22 150 L 10 115 Z"
        fill={fill}
      />
      <path d="M 95 195 L 120 195 L 130 215 L 110 225 L 98 215 Z" fill={fill} />
      <path d="M 110 225 L 145 225 L 160 270 L 150 320 L 125 345 L 108 325 L 105 280 Z" fill={fill} />
      <path d="M 160 50 L 195 45 L 200 75 L 175 85 L 158 72 Z" fill={fill} />
      <path d="M 195 90 L 230 85 L 245 105 L 240 130 L 215 138 L 195 125 Z" fill={fill} />
      <path
        d="M 200 145 L 260 140 L 285 175 L 295 225 L 280 280 L 245 320 L 215 320 L 195 285 L 188 235 L 188 185 Z"
        fill={fill}
      />
      <path d="M 250 145 L 285 140 L 300 165 L 290 185 L 260 180 Z" fill={fill} />
      <path d="M 245 90 L 320 75 L 370 95 L 380 135 L 370 175 L 330 195 L 295 185 L 270 160 L 252 130 Z" fill={fill} />
      <path d="M 295 195 L 325 190 L 332 225 L 312 245 L 298 220 Z" fill={fill} />
      <path d="M 335 230 L 375 235 L 380 265 L 350 275 L 338 255 Z" fill={fill} />
      <path d="M 330 290 L 375 285 L 385 315 L 358 335 L 330 325 Z" fill={fill} />
    </svg>
  );
}
