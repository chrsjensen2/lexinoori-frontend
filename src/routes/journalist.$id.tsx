import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/journalist/$id")({
  head: () => ({ meta: [{ title: "Journalist — lexinoori." }] }),
  component: JournalistPage,
});

function JournalistPage() {
  const router = useRouter();

  return (
    <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Header */}
      <div
        style={{
          height: 52,
          display: "grid",
          gridTemplateColumns: "52px 1fr 52px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => router.history.back()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Back"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </button>
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          JOURNALIST
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#1A7A5E",
              fontWeight: 700,
              fontSize: 14,
              padding: 0,
            }}
          >
            Follow
          </button>
        </div>
      </div>

      {/* Identity card */}
      <div
        style={{
          margin: "20px 16px 0",
          backgroundColor: "#1A7A5E",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.08em",
          }}
        >
          POLITICS · BRUSSELS
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 28,
            marginTop: 8,
            lineHeight: 1.1,
          }}
        >
          Marius Lehnert
        </div>
        <div style={{ color: "#FFFFFF80", fontSize: 14, marginTop: 4 }}>
          Senior Correspondent · The Wire
        </div>
        <div style={{ color: "#FFFFFF60", fontSize: 13, marginTop: 4 }}>
          412 bylines analysed
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1A7A5E",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 12,
              padding: "0 12px",
              height: 36,
              border: "none",
              cursor: "pointer",
            }}
          >
            Follow byline
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          margin: "12px 16px 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        <StatCol label="LOADED LANGUAGE" value="0.18/1" tag="LOW" tagColor="#00C864" />
        <StatCol label="SOURCE DIVERSITY" value="7.4/10" tag="GOOD" tagColor="#00C864" />
        <StatCol label="BIAS · NOW" value="L · 4" tag="CENTRE-LEFT" tagColor="#8E8E93" />
      </div>

      {/* Bias trend chart */}
      <div
        style={{
          margin: "16px 16px 0",
          backgroundColor: "#1C1C1E",
          borderRadius: 12,
          padding: 16,
          border: "1px solid #2C2C2E",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            BIAS TREND · 12 QUARTERS
          </span>
          <span
            style={{
              color: "#E8873A",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            ↗ LEFTWARD
          </span>
        </div>
        <BiasChart />
      </div>

      {/* Career timeline */}
      <div
        style={{
          margin: "16px 16px 0",
          backgroundColor: "#1C1C1E",
          borderRadius: 12,
          padding: 16,
          border: "1px solid #2C2C2E",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            CAREER · OUTLET MOVES
          </span>
          <span
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            4 EMPLOYERS · 11 YR
          </span>
        </div>
        <CareerTimeline />
        <div
          style={{
            marginTop: 8,
            color: "#8E8E93",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: "#00C864",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          Bias drifted 0.6 points leftward on the move to The Wire. Loaded language stayed flat. We disclose this on every byline.
        </div>
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
}

function StatCol({
  label,
  value,
  tag,
  tagColor,
}: {
  label: string;
  value: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#1C1C1E",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #2C2C2E",
      }}
    >
      <div
        style={{
          color: "#8E8E93",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 20,
          marginTop: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: tagColor,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          marginTop: 4,
        }}
      >
        {tag}
      </div>
    </div>
  );
}

function BiasChart() {
  // 12 quarters, value 0 = centre, +20 = right, -20 = left (px from centre)
  // Drift gradually leftward (negative)
  const values = [2, 1, -1, 0, -2, -4, -5, -8, -10, -13, -15, -18];
  const w = 320;
  const h = 100;
  const padL = 24;
  const padR = 8;
  const chartW = w - padL - padR;
  const cx = (i: number) => padL + (chartW * i) / (values.length - 1);
  const cy = (v: number) => h / 2 - v * 1.8;

  const pts = values.map((v, i) => [cx(i), cy(v)] as const);
  const path = pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = pts[i - 1];
      const mx = (prev[0] + p[0]) / 2;
      return `Q ${prev[0]} ${prev[1]} ${mx} ${(prev[1] + p[1]) / 2} T ${p[0]} ${p[1]}`;
    })
    .join(" ");
  const area = `${path} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;

  return (
    <div style={{ position: "relative", height: 120, marginTop: 8 }}>
      <svg
        width="100%"
        height="120"
        viewBox={`0 0 ${w} ${h + 20}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Y axis labels */}
        <text x={4} y={12} fill="#8E8E93" fontSize="10">
          R 40
        </text>
        <text x={4} y={h - 2} fill="#8E8E93" fontSize="10">
          L 40
        </text>
        {/* Centre dashed line */}
        <line
          x1={padL}
          x2={w - padR}
          y1={h / 2}
          y2={h / 2}
          stroke="#2C2C2E"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {/* Area fill */}
        <path d={area} fill="#1A7A5E" fillOpacity={0.08} />
        {/* Trend line */}
        <path d={path} fill="none" stroke="#1A7A5E" strokeWidth={2} />
        {/* Points */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return isLast ? (
            <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#1A7A5E" stroke="#FFFFFF" strokeWidth={2} />
          ) : (
            <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#1A7A5E" />
          );
        })}
      </svg>
    </div>
  );
}

function CareerTimeline() {
  const items = [
    { year: "2014", outlet: "Local Daily" },
    { year: "2017", outlet: "Wire Service" },
    { year: "2020", outlet: "National" },
    { year: "2024", outlet: "The Wire" },
  ];
  return (
    <div style={{ marginTop: 16, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 4,
          right: 4,
          top: 3,
          height: 2,
          backgroundColor: "#2C2C2E",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          position: "relative",
        }}
      >
        {items.map((it, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <div key={it.year} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: isCurrent ? "#1A7A5E" : "#2C2C2E",
                }}
              />
              <div style={{ color: "#8E8E93", fontSize: 10, marginTop: 8 }}>{it.year}</div>
              <div style={{ color: isCurrent ? "#FFFFFF" : "#8E8E93", fontSize: 11, marginTop: 2 }}>{it.outlet}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
