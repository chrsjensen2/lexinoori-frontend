import { Bookmark, ArrowUpRight } from "lucide-react";

interface BreakingNewsCardProps {
  headline: string;
  sources: number;
  timeAgo: string;
}

export function BreakingNewsCard({ headline, sources, timeAgo }: BreakingNewsCardProps) {
  return (
    <article
      style={{
        backgroundColor: "#FF0000",
        borderRadius: 12,
        margin: "0 16px",
        overflow: "hidden",
      }}
    >
      <div className="flex items-start justify-between" style={{ padding: "16px 16px 0" }}>
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "6px 8px",
            borderRadius: 8,
            lineHeight: 1,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: "#FFFFFF",
              display: "inline-block",
              animation: "lex-pulse 1.6s ease-in-out infinite",
            }}
          />
          LIVE
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {timeAgo}
        </span>
      </div>

      <div style={{ padding: 24 }}>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 8 }}>
          Merged · {sources} sources
        </p>
        <h2
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {headline}
        </h2>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            aria-label="Save"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <Bookmark size={20} />
          </button>
          <button
            aria-label="Open"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#FFFFFF",
            }}
          >
            <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}
