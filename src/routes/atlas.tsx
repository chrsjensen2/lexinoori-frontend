import { createFileRoute } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";

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

function AtlasPage() {
  return (
    <div
      style={{
        // Fill the area inside AppShell main (which reserves bottom nav space).
        height:
          "calc(100dvh - 64px - env(safe-area-inset-bottom) - 16px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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

      {/* LAYER 2 — Fixed map */}
      <div
        style={{
          flexShrink: 0,
          position: "relative",
          width: "100%",
          height: 360,
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

      {/* LAYER 3 — Bottom sheet (only scrollable layer) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: "#1C1C1E",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: -12,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 12,
            paddingBottom: 8,
            flexShrink: 0,
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

        {/* Scrollable inner content */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "8px 20px 24px",
          }}
        >
          <StoryRow
            pillLabel="BREAKING"
            pillBg="#FF0000"
            pillColor="#FFFFFF"
            meta="EAST AFRICA · NOW"
            headline="Cease-fire collapses; mediators withdraw overnight."
          />
          <StoryRow
            pillLabel="POLITICS"
            pillBg="rgba(77,110,255,0.18)"
            pillColor="#4D6EFF"
            meta="EU · 1H AGO"
            headline="EU digital sovereignty bill fast-tracks past national vetoes."
          />
          <StoryRow
            pillLabel="ECONOMICS"
            pillBg="#FFD000"
            pillColor="#111111"
            meta="GERMANY · 3H AGO"
            headline="German industrial output contracts for third consecutive quarter."
          />
          <StoryRow
            pillLabel="CLIMATE"
            pillBg="rgba(0,200,100,0.18)"
            pillColor="#00C864"
            meta="SOUTH ASIA · 4H AGO"
            headline="Monsoon onset arrives ten days early across the subcontinent."
          />
          <StoryRow
            pillLabel="TECHNOLOGY"
            pillBg="rgba(0,229,204,0.18)"
            pillColor="#00E5CC"
            meta="USA · 5H AGO"
            headline="Open-weights vision model undercuts closed competitors on benchmarks."
            last
          />
        </div>
      </div>
    </div>
  );
}

function StoryRow({
  pillLabel,
  pillBg,
  pillColor,
  meta,
  headline,
  last,
}: {
  pillLabel: string;
  pillBg: string;
  pillColor: string;
  meta: string;
  headline: string;
  last?: boolean;
}) {
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
  // Stylised continent silhouettes — abstract, real-world relative proportions.
  // viewBox 390x360. Africa is the largest landmass; Americas extend further left.
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
      {/* North America — wider, extends further left */}
      <path
        d="M 8 80 L 55 60 L 105 70 L 130 95 L 135 135 L 115 175 L 80 195 L 45 180 L 22 150 L 10 115 Z"
        fill={fill}
      />
      {/* Central America bridge */}
      <path d="M 95 195 L 120 195 L 130 215 L 110 225 L 98 215 Z" fill={fill} />
      {/* South America */}
      <path
        d="M 110 225 L 145 225 L 160 270 L 150 320 L 125 345 L 108 325 L 105 280 Z"
        fill={fill}
      />
      {/* Greenland */}
      <path d="M 160 50 L 195 45 L 200 75 L 175 85 L 158 72 Z" fill={fill} />
      {/* Europe */}
      <path
        d="M 195 90 L 230 85 L 245 105 L 240 130 L 215 138 L 195 125 Z"
        fill={fill}
      />
      {/* Africa — largest continent */}
      <path
        d="M 200 145 L 260 140 L 285 175 L 295 225 L 280 280 L 245 320 L 215 320 L 195 285 L 188 235 L 188 185 Z"
        fill={fill}
      />
      {/* Middle East */}
      <path
        d="M 250 145 L 285 140 L 300 165 L 290 185 L 260 180 Z"
        fill={fill}
      />
      {/* Asia — large landmass east of Europe */}
      <path
        d="M 245 90 L 320 75 L 370 95 L 380 135 L 370 175 L 330 195 L 295 185 L 270 160 L 252 130 Z"
        fill={fill}
      />
      {/* India / South Asia */}
      <path
        d="M 295 195 L 325 190 L 332 225 L 312 245 L 298 220 Z"
        fill={fill}
      />
      {/* Southeast Asia islands */}
      <path
        d="M 335 230 L 375 235 L 380 265 L 350 275 L 338 255 Z"
        fill={fill}
      />
      {/* Australia */}
      <path
        d="M 330 290 L 375 285 L 385 315 L 358 335 L 330 325 Z"
        fill={fill}
      />
    </svg>
  );
}
