import { Bookmark, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

interface BreakingNewsCardProps {
  headline: string;
  sources: number;
  timeAgo: string;
}

export function BreakingNewsCard({ headline, sources, timeAgo }: BreakingNewsCardProps) {
  const [saved, setSaved] = useState(false);
  return (
    <article
      style={{
        backgroundColor: "#FF0000",
        borderRadius: 12,
        margin: "0 16px",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-start justify-between"
        style={{ padding: "16px 16px 0" }}
      >
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            backgroundColor: "rgba(255,255,255,0.125)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.08em",
            padding: "6px 8px",
            borderRadius: 8,
            lineHeight: 1,
            textTransform: "uppercase",
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
            color: "rgba(255,255,255,0.5)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {timeAgo}
        </span>
      </div>

      <div style={{ padding: 24 }}>
        <h2
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            marginTop: 8,
          }}
        >
          Merged · {sources} sources
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            aria-label={saved ? "Unsave" : "Save"}
            onClick={() => setSaved((s) => !s)}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              color: saved ? "#FFFFFF" : "rgba(255,255,255,0.5)",
            }}
          >
            <Bookmark size={20} fill={saved ? "#FFFFFF" : "none"} />
          </button>
          <Link
            to="/article/$id"
            params={{ id: "1" }}
            aria-label="Open"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.125)",
              color: "#FFFFFF",
            }}
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
