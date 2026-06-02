import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/timeline/$id")({
  head: () => ({ meta: [{ title: "Story Timeline — lexinoori." }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const router = useRouter();

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* HEADER */}
      <div
        className="flex items-center"
        style={{
          position: "relative",
          padding: "16px",
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          height: 56,
        }}
      >
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          style={{ color: "#FFFFFF", display: "flex", alignItems: "center" }}
        >
          <ArrowLeft size={24} />
        </button>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            pointerEvents: "none",
          }}
        >
          STORY TIMELINE
        </div>
      </div>

      {/* IDENTITY BLOCK */}
      <div style={{ padding: "20px 16px 0" }}>
        <div
          style={{
            color: "#4D6EFF",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          POLITICS · BRUSSELS
        </div>
        <h1
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.2,
            marginTop: 8,
          }}
        >
          Brussels fast-tracks digital sovereignty bill
        </h1>

        {/* STATUS ROW */}
        <div
          className="flex"
          style={{
            marginTop: 12,
            backgroundColor: "#1C1C1E",
            border: "1px solid #2C2C2E",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <StatusCol label="STATUS" value="ACTIVE" valueColor="#00C864" />
          <StatusCol label="UPDATES" value="4" />
          <StatusCol label="SOURCES" value="9" />
          <StatusCol label="LIFESPAN" value="48H" />
        </div>
      </div>

      {/* REVISIONS HEADER */}
      <div
        style={{
          color: "#8E8E93",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          marginTop: 16,
          padding: "0 16px",
        }}
      >
        REVISIONS · NEWEST FIRST
      </div>

      {/* TIMELINE */}
      <div style={{ position: "relative", padding: "16px" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 16 + 5, // align under dot center (dot 12px → center 6px, line 2px → -1)
            top: 16,
            bottom: 16,
            width: 2,
            backgroundColor: "#2C2C2E",
          }}
        />

        <Entry
          dotFill="#1A7A5E"
          dotBorder="#FFFFFF"
          cardBorder="#1A7A5E40"
          pillBg="#1A7A5E"
          pillColor="#FFFFFF"
          pillLabel="WHAT'S NEW"
          time="3H AGO"
          title="Council legal service objects to 72-hour window"
          body="A formal objection from the Council's own legal service now appears in the article. Two new sources added (Le Monde, NOS)."
          footer="+2 SOURCES · FRAMING TIGHTENED"
        />
        <Entry
          dotFill="#2C2C2E"
          dotBorder="#FFFFFF"
          cardBorder="#2C2C2E"
          pillBg="#2C2C2E"
          pillColor="#8E8E93"
          pillLabel="UPDATE"
          time="YESTERDAY · 18:40"
          title="Israeli foreign minister responds, calling sanctions unacceptable"
          body="Two new perspectives added to the source pool."
          footer="+3 SOURCES · ADDED ISRAELI RESPONSE SECTION"
        />
        <Entry
          dotFill="#E8873A40"
          dotBorder="#E8873A"
          cardBorder="#E8873A40"
          pillBg="#E8873A20"
          pillColor="#E8873A"
          pillLabel="WIRE COPY"
          time="YESTERDAY · 09:12"
          title="Ritzau wire rewire detected; TV2 + BT collapsed to one source"
          body="Two new sources arrived but both >70% Ritzau wire. Counted as one in diversity score."
          footer="DIVERSITY SCORE PROTECTED"
        />
        <Entry
          dotFill="#2C2C2E"
          dotBorder="#8E8E93"
          cardBorder="#2C2C2E"
          pillBg="#2C2C2E"
          pillColor="#8E8E93"
          pillLabel="ORIGINAL"
          time="2 DAYS AGO · 14:30"
          title="Story created from 4 sources"
          body="Initial merge from Reuters, AP, BBC, DR. Diversity 6.8."
          footer="4 SOURCES · STORY OPENED"
          last
        />
      </div>
    </div>
  );
}

function StatusCol({
  label,
  value,
  valueColor = "#FFFFFF",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex-1">
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
          color: valueColor,
          fontSize: 16,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Entry({
  dotFill,
  dotBorder,
  cardBorder,
  pillBg,
  pillColor,
  pillLabel,
  time,
  title,
  body,
  footer,
  last = false,
}: {
  dotFill: string;
  dotBorder: string;
  cardBorder: string;
  pillBg: string;
  pillColor: string;
  pillLabel: string;
  time: string;
  title: string;
  body: string;
  footer: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: 28,
        marginBottom: last ? 0 : 16,
      }}
    >
      {/* Dot */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: dotFill,
          border: `2px solid ${dotBorder}`,
          boxSizing: "border-box",
          zIndex: 1,
        }}
      />
      <div
        style={{
          backgroundColor: "#1C1C1E",
          border: `1px solid ${cardBorder}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              backgroundColor: pillBg,
              color: pillColor,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            {pillLabel}
          </span>
          <span
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {time}
          </span>
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 15,
            marginTop: 8,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#8E8E93",
            fontSize: 14,
            lineHeight: 1.5,
            marginTop: 8,
          }}
        >
          {body}
        </div>
        <div
          style={{
            color: "#8E8E93",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 8,
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
