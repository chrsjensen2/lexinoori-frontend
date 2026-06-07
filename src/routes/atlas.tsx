import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { useLanguage, getLang } from "@/lib/lang";
import { translations, type T } from "@/lib/i18n";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "Atlas — lexinoori." },
      { name: "description", content: "Stories around the world, mapped by region and topic." },
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
  location_name: string | null;
};

type SnapKey = "collapsed" | "default" | "expanded";

type Depth = "Bullets" | "Brief" | "Standard" | "Deep Dive";

function getDepth(): Depth {
  if (typeof window === "undefined") return "Standard";
  const v = window.localStorage.getItem("lex:depth");
  return v === "Bullets" || v === "Brief" || v === "Deep Dive" ? v : "Standard";
}

function readTimeLabel(depth: Depth, minutes: number | null): string {
  if (depth === "Bullets") return "1 MIN";
  if (depth === "Brief") return "2 MIN";
  if (depth === "Deep Dive") return `${(minutes ?? 5) * 3} MIN`;
  return `${Math.max(2, minutes ?? 5)} MIN`;
}

function toTopic(t: string | null): Topic | undefined {
  const valid: Topic[] = ["politics", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const normalized = t?.toLowerCase() ?? "";
  return valid.includes(normalized as Topic) ? (normalized as Topic) : undefined;
}

function timeAgo(iso: string, t: T) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.now;
  if (mins < 60) return `${mins}${t.minAgo}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t.hrAgo}`;
  return `${Math.floor(hrs / 24)}${t.dayAgo}`;
}

function AtlasPage() {
  const lang = useLanguage();
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(700);
  const [snap, setSnap] = useState<SnapKey>("collapsed");
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragMoved = useRef(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clusterIds, setClusterIds] = useState<string[] | null>(null);
  const [depth, setDepth] = useState<Depth>("Standard");
  const leafletMapRef = useRef<any>(null);
  const [mapZoom, setMapZoom] = useState<number>(2);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [mapTick, setMapTick] = useState(0);
  const navigate = useNavigate();

  const handleZoomSelect = useCallback((z: number) => {
    const m = leafletMapRef.current;
    if (m) m.setZoom(z, { animate: true });
  }, []);

  const handleMapMoved = useCallback(() => {
    setMapTick((tick) => tick + 1);
  }, []);

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
      const language = getLang();
      const suffix = language === "en" ? "" : `_${language}`;
      const pick = <T,>(row: any, base: string): T =>
        (row?.[`${base}${suffix}`] ?? row?.[base]) as T;

      const since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      const { data, error } = await (supabase as any)
        .from("articles")
        .select(
          "id, topic, source_count, read_time_minutes, created_at, is_breaking, lat, lng, location_name, headline, headline_da, headline_de, headline_es"
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
        location_name: row.location_name ?? null,
      }));
      setArticles(mapped);
    })();
    return () => { cancelled = true; };
  }, [lang]);

  const displayCount = useMemo(() => {
    if (!clusterIds) return null;
    return clusterIds.length;
  }, [clusterIds]);
  const isSingleCard = displayCount === 1;
  const snapHeights: Record<SnapKey, number> = {
    collapsed: 130,
    default: isSingleCard ? 220 : Math.round(containerH * 0.55),
    expanded: isSingleCard ? 220 : Math.round(containerH * 0.8),
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

  const filteredArticles = useMemo(() => {
    if (!mapBounds) return articles;
    const { north, south, east, west } = mapBounds;
    const lngInBounds = (lng: number) => {
      if (west <= east) return lng >= west && lng <= east;
      return lng >= west || lng <= east;
    };
    return articles.filter(
      (a) => a.lat <= north && a.lat >= south && lngInBounds(a.lng),
    );
  }, [articles, mapBounds]);

  const peekArticle = useMemo(
    () => filteredArticles.find((a) => a.id === selectedId) ?? filteredArticles[0] ?? null,
    [filteredArticles, selectedId],
  );

  const handleMarkerTap = (id: string) => {
    setSelectedId(id);
    setClusterIds([id]);
    setSnap("default");
  };

  const handleClusterTap = (group: Article[]) => {
    setSelectedId(null);
    setClusterIds(group.map((a) => a.id));
    if (snap === "collapsed") setSnap("default");
  };

  const handleMapTap = useCallback(() => {
    setSelectedId(null);
    setClusterIds(null);
    setSnap("collapsed");
  }, []);

  const displayArticles = useMemo(() => {
    if (clusterIds) {
      const ids = new Set(clusterIds);
      return filteredArticles.filter((a) => ids.has(a.id));
    }
    return filteredArticles;
  }, [filteredArticles, clusterIds]);

  const selectedArticle = useMemo(
    () => (selectedId ? articles.find((a) => a.id === selectedId) ?? null : null),
    [articles, selectedId],
  );

  const popupPos = useMemo(() => {
    void mapTick;
    const m = leafletMapRef.current;
    if (!m || !selectedArticle) return null;
    try {
      const pt = m.latLngToContainerPoint([selectedArticle.lat, selectedArticle.lng]);
      const rect = m.getContainer().getBoundingClientRect();
      return { x: rect.left + pt.x, y: rect.top + pt.y };
    } catch {
      return null;
    }
  }, [selectedArticle, mapTick]);

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
                {filteredArticles.length} {filteredArticles.length === 1 ? t.story : t.stories} {t.storiesInFrame}
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
        <LeafletMap
          articles={filteredArticles}
          selectedId={selectedId}
          onMarkerTap={handleMarkerTap}
          onClusterTap={handleClusterTap}
          onMapTap={handleMapTap}
          mapRef={leafletMapRef}
          onZoomChange={(z) => {
            setMapZoom(z);
            handleMapMoved();
          }}
          onBoundsChange={(b) => {
            setMapBounds(b);
            handleMapMoved();
          }}
        />
        <ZoomControl zoom={mapZoom} onSelect={handleZoomSelect} />
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
          zIndex: 1000,
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
          <div style={{ width: 32, height: 4, backgroundColor: "#2C2C2E", borderRadius: 999 }} />
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
            {displayArticles.length === 0 ? (
              <p style={{ color: "#8E8E93", fontSize: 14, padding: "16px 0" }}>
                <EmptyText />
              </p>
            ) : (
              displayArticles.map((a, i) => (
                <ArticleRow
                  key={a.id}
                  article={a}
                  depth={depth}
                  selected={a.id === selectedId}
                  last={i === displayArticles.length - 1}
                />
              ))
            )}
          </div>
        )}
      </div>

      {selectedArticle && popupPos && (
        <button
          type="button"
          onClick={() => {
            navigate({ to: "/article/$id", params: { id: selectedArticle.id } });
          }}
          style={{
            position: "fixed",
            left: popupPos.x,
            top: popupPos.y - 16,
            transform: "translate(-50%, -100%)",
            zIndex: 2000,
            background: "#1a1a1a",
            border: "none",
            borderRadius: 6,
            padding: "6px 8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            cursor: "pointer",
            fontFamily: "'Heebo', sans-serif",
            textAlign: "left",
            maxWidth: 220,
            pointerEvents: "auto",
          }}
        >
          {selectedArticle.location_name && (
            <div style={{ color: "#8E8E93", fontSize: 10, lineHeight: 1.2, marginBottom: 4 }}>
              {selectedArticle.location_name}
            </div>
          )}
          <div
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {selectedArticle.headline.length > 50
              ? selectedArticle.headline.slice(0, 47).trimEnd() + "…"
              : selectedArticle.headline}
          </div>
        </button>
      )}
    </div>
  );
}

function EmptyText() {
  const lang = useLanguage();
  const t = translations[lang];
  return <>{t.noStoriesWithLocation}</>;
}

function CollapsedPeek({ article }: { article: Article }) {
  const lang = useLanguage();
  const t = translations[lang];
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
          {timeAgo(article.created_at, t)}
        </span>
      </div>
      <div style={{ position: "relative", marginTop: 8, maxHeight: 35, overflow: "hidden" }}>
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
  const lang = useLanguage();
  const t = translations[lang];
  return (
    <div style={{ padding: "0 20px" }}>
      <p style={{ color: "#8E8E93", fontSize: 14 }}>{t.noStoriesWithLocation}</p>
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
  const lang = useLanguage();
  const t = translations[lang];
  const topic = toTopic(article.topic);
  const sourceCount = article.source_count ?? 0;
  const sourceLabel = sourceCount > 0
    ? `${sourceCount} ${sourceCount === 1 ? t.source : t.sources}`
    : "";
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selected]);

  return (
    <Link
      to="/article/$id"
      params={{ id: article.id }}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        ref={rowRef}
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 12,
          paddingRight: 12,
          marginLeft: -12,
          marginRight: -12,
          borderRadius: 12,
          backgroundColor: selected ? "rgba(26,122,94,0.12)" : "transparent",
          border: selected ? "1px solid #1A7A5E" : "1px solid transparent",
          borderBottom: selected
            ? "1px solid #1A7A5E"
            : last
              ? "1px solid transparent"
              : "1px solid #2C2C2E",
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
            {timeAgo(article.created_at, t)}
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

function LeafletMap({
  articles,
  selectedId,
  onMarkerTap,
  onClusterTap,
  onMapTap,
  mapRef: externalMapRef,
  onZoomChange,
  onBoundsChange,
}: {
  articles: Article[];
  selectedId: string | null;
  onMarkerTap: (id: string) => void;
  onClusterTap: (group: Article[]) => void;
  onMapTap?: () => void;
  mapRef?: React.MutableRefObject<any>;
  onZoomChange?: (z: number) => void;
  onBoundsChange?: (b: { north: number; south: number; east: number; west: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const onTapRef = useRef(onMarkerTap);
  const onClusterRef = useRef(onClusterTap);
  const onMapTapRef = useRef(onMapTap);
  const onZoomRef = useRef(onZoomChange);
  const onBoundsRef = useRef(onBoundsChange);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { onTapRef.current = onMarkerTap; }, [onMarkerTap]);
  useEffect(() => { onClusterRef.current = onClusterTap; }, [onClusterTap]);
  useEffect(() => { onZoomRef.current = onZoomChange; }, [onZoomChange]);
  useEffect(() => { onBoundsRef.current = onBoundsChange; }, [onBoundsChange]);
  useEffect(() => { onMapTapRef.current = onMapTap; }, [onMapTap]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        worldCopyJump: true,
        zoomControl: false,
        attributionControl: true,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, attribution: "© OpenStreetMap contributors © CARTO" },
      ).addTo(map);
      const emitBounds = () => {
        const b = map.getBounds();
        onBoundsRef.current?.({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      };
      map.on("zoomend", () => {
        onZoomRef.current?.(map.getZoom());
        emitBounds();
      });
      map.on("moveend", emitBounds);
      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      if (externalMapRef) externalMapRef.current = map;
      map.on("click", () => { onMapTapRef.current?.(); });
      onZoomRef.current?.(map.getZoom());
      const b = map.getBounds();
      onBoundsRef.current?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
      setTimeout(() => {
        map.invalidateSize();
        if (!cancelled) setMapReady(true);
      }, 0);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        if (externalMapRef) externalMapRef.current = null;
      }
      markerLayerRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();

    const buckets = new Map<string, Article[]>();
    for (const a of articles) {
      const key = `${Math.floor(a.lat / 0.5)}_${Math.floor(a.lng / 0.5)}`;
      const arr = buckets.get(key);
      if (arr) arr.push(a);
      else buckets.set(key, [a]);
    }

    for (const group of buckets.values()) {
      if (group.length === 1) {
        const a = group[0];
        const topic = toTopic(a.topic);
        const color = topic ? TOPIC_COLORS[topic] : "#FFFFFF";
        const isSelected = a.id === selectedId;
        const opts = {
          radius: isSelected ? 9 : 6,
          color: "#FFFFFF",
          weight: isSelected ? 2 : 1,
          fillColor: color,
          fillOpacity: 0.95,
        };
        const m = L.circleMarker([a.lat, a.lng], opts);
        m.on("click", (e: any) => {
          (LRef.current as any)?.DomEvent?.stopPropagation?.(e);
          onTapRef.current(a.id);
        });
        layer.addLayer(m);
      } else {
        const count = group.length;
        const meanLat = group.reduce((s, a) => s + a.lat, 0) / count;
        const meanLng = group.reduce((s, a) => s + a.lng, 0) / count;
        const tally = new Map<string, number>();
        for (const a of group) {
          const topic = toTopic(a.topic);
          const c = topic ? TOPIC_COLORS[topic] : "#FFFFFF";
          tally.set(c, (tally.get(c) ?? 0) + 1);
        }
        let color = "#FFFFFF";
        let best = 0;
        for (const [c, n] of tally.entries()) {
          if (n > best) { best = n; color = c; }
        }
        const size = count >= 10 ? 32 : 26;
        const html = `
          <div style="
            width:${size}px;height:${size}px;border-radius:999px;
            background:${color};border:2px solid #FFFFFF;
            display:flex;align-items:center;justify-content:center;
            color:#FFFFFF;font-family:'Heebo',sans-serif;font-weight:700;
            font-size:${count >= 10 ? 12 : 13}px;letter-spacing:-0.01em;
            box-shadow:0 2px 6px rgba(0,0,0,0.5);
          ">${count}</div>
        `;
        const icon = L.divIcon({
          html,
          className: "atlas-cluster",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const m = L.marker([meanLat, meanLng], { icon });
        m.on("click", (e: any) => {
          (LRef.current as any)?.DomEvent?.stopPropagation?.(e);
          onClusterRef.current(group);
        });
        layer.addLayer(m);
      }
    }
  }, [articles, selectedId, mapReady]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, backgroundColor: "#0A0A0F" }}
    />
  );
}

function ZoomControl({
  zoom,
  onSelect,
}: {
  zoom: number;
  onSelect: (z: number) => void;
}) {
  const lang = useLanguage();
  const t = translations[lang];

  const levels = [
    { key: t.zoomWorld, top: 0, zoom: 2 },
    { key: t.zoomContinent, top: 40, zoom: 4 },
    { key: t.zoomCountry, top: 80, zoom: 6 },
    { key: t.zoomLocal, top: 120, zoom: 10 },
  ];

  const activeIdx = levels.reduce(
    (best, l, i) =>
      Math.abs(l.zoom - zoom) < Math.abs(levels[best].zoom - zoom) ? i : best,
    0,
  );
  const indicatorTop = levels[activeIdx].top;

  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: "50%",
        transform: "translateY(-50%)",
        height: 120,
        width: 80,
        zIndex: 500,
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
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 3,
          top: indicatorTop - 6,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: "#1A7A5E",
          boxShadow: "0 0 8px rgba(26,122,94,0.6)",
          transition: "top 200ms ease-out",
          pointerEvents: "none",
        }}
      />
      {levels.map((l, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={l.key}
            type="button"
            onClick={() => onSelect(l.zoom)}
            style={{
              position: "absolute",
              right: 20,
              top: l.top - 12,
              padding: "8px 4px 8px 8px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: active ? "#1A7A5E" : "#8E8E93",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {l.key}
          </button>
        );
      })}
    </div>
  );
}
