import { createFileRoute } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

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

// Bubble positions in % of map area (W: 390, H: 420)
type Bubble = {
  x: number; // %
  y: number; // %
  size: number;
  color: string;
  pulse?: boolean;
  label: string;
};

const BUBBLES: Bubble[] = [
  { x: 50, y: 36, size: 32, color: "#4D6EFF", pulse: true, label: "Western Europe" }, // Denmark
  { x: 53, y: 42, size: 24, color: "#FFD000", label: "Central Europe" },
  { x: 60, y: 62, size: 32, color: "#FF0000", pulse: true, label: "East Africa" },
  { x: 22, y: 42, size: 24, color: "#00E5CC", label: "North America" },
  { x: 70, y: 56, size: 24, color: "#00C864", label: "South Asia" },
  { x: 60, y: 50, size: 16, color: "#4D6EFF", label: "Middle East" },
  { x: 82, y: 44, size: 16, color: "#FFD000", label: "East Asia" },
  { x: 51, y: 28, size: 16, color: "#00BFFF", label: "Nordic" },
];

function AtlasPage() {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const startY = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    if (dy < -30) setSheetExpanded(true);
    else if (dy > 30) setSheetExpanded(false);
    startY.current = null;
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ paddingTop: "env(safe-area-inset-top)" }}>
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
            <button
              aria-label="Search"
              style={{ color: "#8E8E93", paddingTop: 6 }}
            >
              <Search size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Map area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 420,
          backgroundColor: "#0A0A0F",
          overflow: "hidden",
        }}
      >
        <WorldMap />

        {/* Bubbles */}
        {BUBBLES.map((b, i) => (
          <MapBubble key={i} bubble={b} />
        ))}

        {/* Zoom control */}
        <ZoomControl />
      </div>

      {/* Spacer so content below sheet doesn't shift; sheet is absolutely placed */}
      <div style={{ height: sheetExpanded ? 420 : 280 }} />

      {/* Bottom sheet */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "calc(64px + env(safe-area-inset-bottom))",
          width: "100%",
          maxWidth: 390,
          backgroundColor: "#1C1C1E",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: sheetExpanded ? 420 : 280,
          transition: "height 280ms ease",
          zIndex: 20,
          boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 12,
            paddingBottom: 12,
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

        <div style={{ padding: "4px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Breaking story */}
          <StoryRow
            pillLabel="BREAKING"
            pillBg="#FF0000"
            pillColor="#FFFFFF"
            meta="EAST AFRICA · NOW"
            headline="Cease-fire collapses; mediators withdraw overnight."
          />

          <Divider />

          <StoryRow
            pillLabel="POLITICS"
            pillBg="rgba(77,110,255,0.15)"
            pillColor="#4D6EFF"
            meta="EU · 1H AGO"
            headline="EU digital sovereignty bill fast-tracks past national vetoes."
          />

          <Divider />

          <StoryRow
            pillLabel="ECONOMICS"
            pillBg="rgba(255,208,0,0.15)"
            pillColor="#FFD000"
            meta="GERMANY · 3H AGO"
            headline="German industrial output contracts for third consecutive quarter."
          />
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: "#2C2C2E" }} />;
}

function StoryRow({
  pillLabel,
  pillBg,
  pillColor,
  meta,
  headline,
}: {
  pillLabel: string;
  pillBg: string;
  pillColor: string;
  meta: string;
  headline: string;
}) {
  return (
    <div>
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
      {/* Track */}
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
      {/* Handle at COUNTRY (lower third = 80px) */}
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
      {/* Labels to the left of track */}
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
  // Stylised continent silhouettes — abstract polygons on dark background
  const fill = "#1A1A2A";
  return (
    <svg
      viewBox="0 0 390 420"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{ display: "block" }}
      aria-hidden
    >
      {/* North America */}
      <path
        d={`M 30 120 L 70 105 L 110 115 L 120 150 L 105 195 L 80 215 L 55 200 L 40 170 Z`}
        fill={fill}
      />
      {/* South America */}
      <path
        d={`M 95 235 L 120 230 L 130 270 L 120 320 L 100 345 L 88 325 L 92 280 Z`}
        fill={fill}
      />
      {/* Europe */}
      <path
        d={`M 180 115 L 215 110 L 230 130 L 225 160 L 200 165 L 180 150 Z`}
        fill={fill}
      />
      {/* Africa */}
      <path
        d={`M 195 180 L 240 175 L 260 220 L 255 280 L 230 320 L 210 310 L 195 270 L 188 220 Z`}
        fill={fill}
      />
      {/* Middle East / Western Asia */}
      <path
        d={`M 235 165 L 270 160 L 285 185 L 275 205 L 250 200 Z`}
        fill={fill}
      />
      {/* Asia */}
      <path
        d={`M 245 130 L 320 115 L 360 140 L 355 180 L 320 200 L 285 195 L 260 170 Z`}
        fill={fill}
      />
      {/* India / South Asia */}
      <path
        d={`M 275 200 L 305 195 L 310 230 L 290 245 L 278 225 Z`}
        fill={fill}
      />
      {/* Southeast Asia / Oceania */}
      <path
        d={`M 320 240 L 360 245 L 365 275 L 335 285 L 322 265 Z`}
        fill={fill}
      />
      {/* Australia */}
      <path
        d={`M 320 305 L 360 300 L 370 325 L 345 345 L 320 335 Z`}
        fill={fill}
      />
      {/* Greenland */}
      <path d={`M 145 75 L 175 70 L 180 95 L 160 105 L 145 95 Z`} fill={fill} />
    </svg>
  );
}
