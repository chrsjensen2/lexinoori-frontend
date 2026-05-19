import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

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

type Bubble = {
  x: number;
  y: number;
  size: number;
  color: string;
  pulse?: boolean;
  label: string;
};

const BUBBLES: Bubble[] = [
  { x: 50, y: 32, size: 32, color: "#4D6EFF", pulse: true, label: "Western Europe" },
  { x: 54, y: 40, size: 24, color: "#FFD000", label: "Central Europe" },
  { x: 58, y: 65, size: 32, color: "#FF0000", pulse: true, label: "East Africa" },
  { x: 18, y: 42, size: 24, color: "#00E5CC", label: "North America" },
  { x: 72, y: 56, size: 24, color: "#00C864", label: "South Asia" },
  { x: 60, y: 50, size: 16, color: "#4D6EFF", label: "Middle East" },
  { x: 84, y: 44, size: 16, color: "#FFD000", label: "East Asia" },
  { x: 50, y: 22, size: 16, color: "#00BFFF", label: "Nordic" },
];

type Story = {
  pillLabel: string;
  pillBg: string;
  pillColor: string;
  meta: string;
  headline: string;
  breaking?: boolean;
};

const STORIES: Story[] = [
  {
    pillLabel: "BREAKING",
    pillBg: "#FF0000",
    pillColor: "#FFFFFF",
    meta: "EAST AFRICA · NOW",
    headline: "Cease-fire collapses; mediators withdraw overnight.",
    breaking: true,
  },
  {
    pillLabel: "POLITICS",
    pillBg: "rgba(77,110,255,0.18)",
    pillColor: "#4D6EFF",
    meta: "EU · 1H AGO",
    headline: "EU digital sovereignty bill fast-tracks past national vetoes.",
  },
  {
    pillLabel: "ECONOMICS",
    pillBg: "#FFD000",
    pillColor: "#111111",
    meta: "GERMANY · 3H AGO",
    headline: "German industrial output contracts for third consecutive quarter.",
  },
  {
    pillLabel: "CLIMATE",
    pillBg: "rgba(0,200,100,0.18)",
    pillColor: "#00C864",
    meta: "SOUTH ASIA · 4H AGO",
    headline: "Monsoon onset arrives ten days early across the subcontinent.",
  },
  {
    pillLabel: "TECHNOLOGY",
    pillBg: "rgba(0,229,204,0.18)",
    pillColor: "#00E5CC",
    meta: "USA · 5H AGO",
    headline: "Open-weights vision model undercuts closed competitors on benchmarks.",
  },
];

type SnapKey = "collapsed" | "default" | "expanded";

function AtlasPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(700);
  const [snap, setSnap] = useState<SnapKey>("collapsed");
  const [dragOffset, setDragOffset] = useState(0); // px delta during drag (negative = up)
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragMoved = useRef(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerH(containerRef.current.clientHeight);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const snapHeights: Record<SnapKey, number> = {
    collapsed: 130,
    default: Math.round(containerH * 0.55),
    expanded: Math.round(containerH * 0.8),
  };

  const baseH = snapHeights[snap];
  // Dragging up (negative offset) increases sheet height.
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
        // Tap → cycle
        setSnap((s) => cycle(s));
        return;
      }

      // Determine snap target based on resulting height and 30% threshold.
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
      // otherwise stay
      void e;
    },
    [dragOffset, snap, snapHeights],
  );

  const topStory = STORIES.find((s) => s.breaking) ?? STORIES[0];

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
      {/* LAYER 1 — Fixed header */}
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
                Country · Denmark · 12 stories in view
              </p>
            </div>
            <button aria-label="Search" style={{ color: "#8E8E93", paddingTop: 6 }}>
              <Search size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* LAYER 2 — Map fills remaining space above sheet */}
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
        {BUBBLES.map((b, i) => (
          <MapBubble key={i} bubble={b} />
        ))}
        <ZoomControl />
      </div>

      {/* LAYER 3 — Draggable bottom sheet (absolute) */}
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
        {/* Drag handle area (captures pointer) */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 12,
            paddingBottom: 8,
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
          <CollapsedPeek story={topStory} />
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
            {STORIES.map((s, i) => (
              <StoryRow key={i} {...s} last={i === STORIES.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsedPeek({ story }: { story: Story }) {
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
        <span
          style={{
            backgroundColor: story.pillBg,
            color: story.pillColor,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "4px 8px",
            borderRadius: 20,
            lineHeight: 1,
            textTransform: "uppercase",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {story.breaking ? "● BREAKING" : story.pillLabel}
        </span>
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
          {story.meta}
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
          {story.headline}
        </h3>
        {/* Fade through middle of second line */}
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

type StoryRowProps = Story & { last?: boolean };

function StoryRow({ pillLabel, pillBg, pillColor, meta, headline, last }: StoryRowProps) {
  return (
    <div
      style={{
        paddingTop: 16,
        paddingBottom: 16,
        borderBottom: last ? "none" : "1px solid #2C2C2E",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            backgroundColor: pillBg,
            color: pillColor,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "4px 8px",
            borderRadius: 20,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {pillLabel}
        </span>
        <span
          style={{
            color: "#8E8E93",
            fontSize: 11,
            letterSpacing: "0.08em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {meta}
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
          {headline}
        </h3>
        <ArrowRight size={20} color="#1A7A5E" style={{ flexShrink: 0, marginBottom: 2 }} />
      </div>
    </div>
  );
}

function MapBubble({ bubble }: { bubble: Bubble }) {
  const { x, y, size, color, pulse, label } = bubble;
  return (
    <div
      aria-label={label}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
      }}
    >
      {pulse && (
        <span
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 999,
            border: "2px solid #FF0000",
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
          border: "2px solid #FFFFFF",
          boxShadow: `0 0 12px ${color}80`,
        }}
      />
    </div>
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
