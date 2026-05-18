import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bookmark, Share2, MoreHorizontal, ChevronRight } from "lucide-react";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";

export const Route = createFileRoute("/article/$id")({
  head: () => ({ meta: [{ title: "Article — lexinoori." }] }),
  component: ArticleView,
});

const TOPIC: Topic = "politics";
const TOPIC_LABEL = "POLITICS";
const HEADLINE =
  "EU digital sovereignty bill fast-tracks past national vetoes after marathon trilogue.";

const READ_LENGTHS = ["Bullets", "Brief", "Standard", "Deep Dive"] as const;
type ReadLength = (typeof READ_LENGTHS)[number];

function ArticleView() {
  const router = useRouter();
  const topicColor = TOPIC_COLORS[TOPIC];
  const [readLength, setReadLength] = useState<ReadLength>("Standard");

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* HERO */}
      <div style={{ position: "relative", width: "100%", height: 240 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${topicColor} 0%, #111111 100%)`,
          }}
        />
        {/* Bottom darken overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 120,
            background: "linear-gradient(180deg, rgba(17,17,17,0) 0%, #111111 100%)",
          }}
        />

        {/* Top floating controls */}
        <div
          className="flex items-start justify-between"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "16px 16px 0",
            paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          }}
        >
          <button
            onClick={() => router.history.back()}
            aria-label="Back"
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "rgba(17,17,17,0.5)",
              color: "#FFFFFF",
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Right cluster: Aa + ... */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Reading options"
              className="flex items-center justify-center"
              style={{
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                backgroundColor: "rgba(17,17,17,0.5)",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Aa
            </button>
            <button
              aria-label="More"
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: "rgba(17,17,17,0.5)",
                color: "#FFFFFF",
              }}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Bottom overlay content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 16px 16px",
          }}
        >
          <div style={{ display: "inline-block", marginBottom: 8 }}>
            <TopicPill topic={TOPIC} />
          </div>
          <h1
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {HEADLINE}
          </h1>
        </div>
      </div>

      {/* METADATA ROW */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 16, marginTop: 16 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: "#2C2C2E",
              color: "#8E8E93",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            R
          </span>
          <span style={{ color: "#FFFFFF", fontSize: 14 }}>Merged · 9 sources</span>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <button aria-label="Save" style={{ color: "#8E8E93" }}>
            <Bookmark size={24} />
          </button>
          <button aria-label="Share" style={{ color: "#8E8E93" }}>
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* WHAT'S NEW */}
      <section
        style={{
          margin: "12px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "rgba(26,122,94,0.08)",
          border: "1px solid rgba(26,122,94,0.25)",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ color: "#1A7A5E", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            WHAT'S NEW
          </span>
          <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            SINCE YOU LAST READ · 3H AGO
          </span>
        </div>
        <p style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 1.5 }}>
          Council legal service has now formally objected to the 72-hour consultation window. Two
          new sources added.
        </p>
      </section>

      {/* BEFORE YOU READ */}
      <section
        style={{
          margin: "12px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
        }}
      >
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          BEFORE YOU READ
        </div>

        <div className="flex" style={{ gap: 16, marginBottom: 16 }}>
          <div className="flex-1">
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              SOURCES
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              9 outlets
            </div>
          </div>
          <div className="flex-1">
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              READ LENGTH
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              6 min
            </div>
          </div>
        </div>

        {/* Pool lean slider */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              POOL LEAN
            </span>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              CENTRE-LEFT
            </span>
          </div>
          <div style={{ position: "relative", width: "100%", height: 14 }}>
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: "#2C2C2E",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 0,
                width: "38%",
                height: 4,
                backgroundColor: "#1A7A5E",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "calc(38% - 7px)",
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: "#1A7A5E",
              }}
            />
          </div>
        </div>

        {/* Source diversity */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              SOURCE DIVERSITY
            </span>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: "#00C864", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#00C864",
                  display: "inline-block",
                }}
              />
              STRONG
            </span>
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            7.4 / 10
          </div>
          <div style={{ position: "relative", height: 4, backgroundColor: "#2C2C2E", borderRadius: 999 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "74%",
                backgroundColor: "#00C864",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </section>

      {/* READ LENGTH SELECTOR */}
      <div className="flex" style={{ gap: 8, margin: "12px 16px 0" }}>
        {READ_LENGTHS.map((rl) => {
          const active = rl === readLength;
          return (
            <button
              key={rl}
              onClick={() => setReadLength(rl)}
              className="flex-1"
              style={{
                padding: "10px 12px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: active ? "#FFFFFF" : "#1C1C1E",
                color: active ? "#111111" : "rgba(255,255,255,0.5)",
                border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E",
                whiteSpace: "nowrap",
              }}
            >
              {rl}
            </button>
          );
        })}
      </div>

      {/* ARTICLE BODY */}
      <article
        style={{
          padding: "0 16px",
          marginTop: 20,
          color: "#FFFFFF",
          fontSize: 16,
          lineHeight: 1.65,
        }}
      >
        <p style={{ marginBottom: 20 }}>
          Brussels negotiators reached a provisional agreement late on Tuesday, ending months of
          procedural delay over the bloc's flagship digital sovereignty package.{" "}
          <InlineTag kind="fact">
            The text now requires cloud providers serving EU public sector clients to keep
            operational control within member states.
          </InlineTag>{" "}
          Implementing acts will follow within twelve months.
        </p>
        <p style={{ marginBottom: 20 }}>
          Negotiators framed the deal as a turning point for European technological autonomy.{" "}
          <InlineTag kind="opinion">
            Without it, the continent risks ceding the next decade of infrastructure decisions to
            firms outside its legal reach.
          </InlineTag>{" "}
          Industry groups have asked for a longer transition window.
        </p>
        <p style={{ marginBottom: 20 }}>
          Some delegations argued the Council legal service had not been given enough time to weigh
          in.{" "}
          <InlineTag kind="contested">
            Two member states say the 72-hour consultation window violated procedural treaty
            obligations.
          </InlineTag>{" "}
          A Commission spokesperson rejected that reading.
        </p>
      </article>

      {/* AFTER YOU READ */}
      <section
        style={{
          margin: "24px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
        }}
      >
        <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
          AFTER YOU READ
        </div>

        {/* Loaded language */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 12,
            marginBottom: 8,
          }}
        >
          LOADED LANGUAGE
        </div>
        <LoadedRow original="fast-tracks" neutral="accelerates" />
        <LoadedRow original="sovereignty bill" neutral="digital regulation bill" last />

        {/* What's missing */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          WHAT'S MISSING
        </div>
        <div
          style={{
            borderLeft: "2px solid #E8873A",
            paddingLeft: 16,
            color: "#FFFFFF",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          No sources cover the economic impact on smaller EU member states or SMEs.
        </div>

        {/* Sources */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          SOURCES · 9 OUTLETS
        </div>
        <SourceRow initial="R" name="Reuters" bias="#00C864" diversity="9.2" />
        <SourceRow initial="A" name="AP" bias="#00C864" diversity="8.8" />
        <SourceRow initial="B" name="BBC" bias="#00C864" diversity="8.4" />
        <SourceRow initial="D" name="DR" bias="#FFD000" diversity="7.1" />
        <SourceRow initial="T" name="TV2" bias="#FFD000" diversity="6.4" wireCopy last />

        {/* Bottom action */}
        <Link
          to="/timeline/$id"
          params={{ id: "1" }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            color: "#1A7A5E",
            fontSize: 14,
            marginTop: 20,
          }}
        >
          View story timeline →
        </Link>
      </section>

      {/* Share button */}
      <button
        style={{
          display: "block",
          margin: "20px 16px 0",
          width: "calc(100% - 32px)",
          height: 52,
          border: "1px solid #2C2C2E",
          borderRadius: 12,
          background: "transparent",
          appearance: "none",
          WebkitAppearance: "none",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Share
      </button>
    </div>
  );
}

function InlineTag({
  kind,
  children,
}: {
  kind: "fact" | "opinion" | "contested";
  children: React.ReactNode;
}) {
  const config = {
    fact: { bg: "rgba(26,122,94,0.08)", pillBg: "#1A7A5E", label: "FACT" },
    opinion: { bg: "rgba(232,135,58,0.08)", pillBg: "#E8873A", label: "OPINION" },
    contested: { bg: "rgba(255,69,0,0.08)", pillBg: "#FF4500", label: "CONTESTED" },
  }[kind];

  return (
    <span
      style={{
        backgroundColor: config.bg,
        padding: "0 4px",
        borderRadius: 4,
      }}
    >
      {children}
      <span
        style={{
          backgroundColor: config.pillBg,
          color: "#FFFFFF",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "2px 4px",
          borderRadius: 4,
          marginLeft: 4,
          verticalAlign: "middle",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    </span>
  );
}

function LoadedRow({
  original,
  neutral,
  last,
}: {
  original: string;
  neutral: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid #2C2C2E",
        fontSize: 14,
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          textDecoration: "underline",
          textDecorationColor: "#FF4500",
          textDecorationThickness: 2,
          textUnderlineOffset: 3,
        }}
      >
        {original}
      </span>
      <span style={{ color: "#8E8E93" }}>→</span>
      <span style={{ color: "#1A7A5E" }}>{neutral}</span>
    </div>
  );
}

function SourceRow({
  initial,
  name,
  bias,
  diversity,
  wireCopy = false,
  last = false,
}: {
  initial: string;
  name: string;
  bias: string;
  diversity: string;
  wireCopy?: boolean;
  last?: boolean;
}) {
  return (
    <Link
      to="/journalist/$id"
      params={{ id: "1" }}
      className="flex items-center"
      style={{
        height: 44,
        gap: 12,
        borderBottom: last ? "none" : "1px solid #2C2C2E",
        textDecoration: "none",
      }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor: "#2C2C2E",
          color: "#8E8E93",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {initial}
      </span>
      <span style={{ color: "#FFFFFF", fontSize: 14, flex: 1 }}>{name}</span>
      {wireCopy && (
        <span
          style={{
            backgroundColor: "#E8873A",
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "3px 6px",
            borderRadius: 6,
          }}
        >
          WIRE COPY
        </span>
      )}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: bias,
          display: "inline-block",
        }}
      />
      <span
        style={{
          color: "#8E8E93",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        DIV {diversity}
      </span>
      <ChevronRight size={12} style={{ color: "#8E8E93" }} />
    </Link>
  );
}
