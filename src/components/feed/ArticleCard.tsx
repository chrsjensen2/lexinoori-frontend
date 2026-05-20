import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { TopicPill, WhatsNewPill, TOPIC_COLORS, type Topic } from "./TopicPill";
import { useSavedArticles } from "@/hooks/useSavedArticles";

type Bias = "low" | "medium" | "high";

const BIAS_COLOR: Record<Bias, string> = {
  low: "#00C864",
  medium: "#FFD000",
  high: "#FF4500",
};

interface ArticleCardProps {
  id: string;
  topic: Topic;
  timeAgo: string;
  headline: string;
  outletInitial: string;
  sources: number;
  readMinutes: number;
  bias: Bias;
  biasLabel: string;
  whatsNew?: boolean;
  thumbnail?: boolean;
  hideTopic?: boolean;
}

export function ArticleCard({
  id,
  topic,
  timeAgo,
  headline,
  outletInitial,
  sources,
  readMinutes,
  bias,
  biasLabel,
  whatsNew = false,
  thumbnail = false,
  hideTopic = false,
}: ArticleCardProps) {
  const topicColor = TOPIC_COLORS[topic];
  const { isSaved, toggle } = useSavedArticles();
  const saved = isSaved(id);

  return (
    <Link
      to="/article/$id"
      params={{ id }}
      className="block"
      style={{
        backgroundColor: "#1C1C1E",
        border: "1px solid #2C2C2E",
        borderRadius: 12,
        margin: "0 16px",
        padding: 16,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {/* Row 1: pills + timestamp */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!hideTopic && <TopicPill topic={topic} />}
          {whatsNew && <WhatsNewPill />}
        </div>
        <span style={{ color: "#8E8E93", fontSize: 12 }}>{timeAgo}</span>
      </div>

      {/* Headline */}
      <h3
        style={{
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.3,
          marginTop: 8,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {headline}
      </h3>

      {/* Source + read info */}
      <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
        <span
          className="flex items-center justify-center"
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            backgroundColor: "#2C2C2E",
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {outletInitial}
        </span>
        <span style={{ color: "#8E8E93", fontSize: 13 }}>Merged · {sources} sources</span>
        <span style={{ color: "#8E8E93", fontSize: 13, marginLeft: "auto" }}>
          {readMinutes} min
        </span>
      </div>

      {/* Bias row */}
      <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: BIAS_COLOR[bias],
            display: "inline-block",
          }}
        />
        <span style={{ color: "#8E8E93", fontSize: 12 }}>{biasLabel}</span>
        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(id);
          }}
          style={{
            marginLeft: "auto",
            color: saved ? "#1A7A5E" : "#8E8E93",
            background: "transparent",
            display: "inline-flex",
          }}
        >
          <Bookmark size={24} fill={saved ? "#1A7A5E" : "none"} />
        </button>
      </div>

      {/* Thumbnail */}
      {thumbnail && (
        <div
          style={{
            width: "100%",
            height: 180,
            borderRadius: 8,
            marginTop: 8,
            background: `linear-gradient(180deg, ${topicColor} 0%, #111111 100%)`,
          }}
        />
      )}
    </Link>
  );
}
