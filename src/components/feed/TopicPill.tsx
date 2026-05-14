type Topic =
  | "politics"
  | "climate"
  | "economics"
  | "sport"
  | "technology"
  | "health"
  | "culture"
  | "local"
  | "breaking";

const TOPIC_COLORS: Record<Topic, string> = {
  politics: "#4D6EFF",
  climate: "#00C864",
  economics: "#FFD000",
  sport: "#FF4500",
  technology: "#00E5CC",
  health: "#00BFFF",
  culture: "#CC44FF",
  local: "#FF8C00",
  breaking: "#FF0000",
};

const TOPIC_LABELS: Record<Topic, string> = {
  politics: "POLITICS",
  climate: "CLIMATE",
  economics: "ECONOMICS",
  sport: "SPORT",
  technology: "TECHNOLOGY",
  health: "HEALTH",
  culture: "CULTURE",
  local: "LOCAL",
  breaking: "BREAKING",
};

// Topics with light backgrounds need dark text for contrast
const DARK_TEXT_TOPICS: Topic[] = ["economics", "technology", "health"];

export function TopicPill({ topic }: { topic: Topic }) {
  const bg = TOPIC_COLORS[topic];
  const color = DARK_TEXT_TOPICS.includes(topic) ? "#111111" : "#FFFFFF";
  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.08em",
        padding: "6px 8px",
        borderRadius: 20,
        lineHeight: 1,
      }}
    >
      {TOPIC_LABELS[topic]}
    </span>
  );
}

export function WhatsNewPill() {
  return (
    <span
      style={{
        backgroundColor: "#1A7A5E",
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.08em",
        padding: "6px 8px",
        borderRadius: 20,
        lineHeight: 1,
      }}
    >
      WHAT'S NEW
    </span>
  );
}

export { TOPIC_COLORS };
export type { Topic };
