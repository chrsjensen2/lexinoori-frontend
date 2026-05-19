import { createFileRoute, Link } from "@tanstack/react-router";
import { TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { SerifLogo } from "@/components/SerifLogo";

type DigestCard = {
  id: string;
  topic: Topic;
  headline: string;
  sources: number;
  readMinutes: number;
  bias: string;
  biasColor: string;
  diversity: number;
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
const DARK_TEXT: Topic[] = ["economics", "technology", "health"];

const GROUPS: {
  brief: string;
  date: string;
  opacity?: number;
  cards: DigestCard[];
}[] = [
  {
    brief: "MORNING BRIEF",
    date: "TUE · 19 MAY",
    cards: [
      {
        id: "d1",
        topic: "politics",
        headline:
          "EU finance ministers split over emergency defence spending package.",
        sources: 9,
        readMinutes: 6,
        bias: "Centre-left",
        biasColor: "#00C864",
        diversity: 7.4,
      },
      {
        id: "d2",
        topic: "climate",
        headline:
          "Arctic permafrost thaw accelerating faster than models predicted.",
        sources: 14,
        readMinutes: 4,
        bias: "Centre",
        biasColor: "#00C864",
        diversity: 8.1,
      },
      {
        id: "d3",
        topic: "technology",
        headline:
          "Meta releases open-weights vision model undercutting closed competitors.",
        sources: 18,
        readMinutes: 5,
        bias: "Centre",
        biasColor: "#00C864",
        diversity: 9.2,
      },
    ],
  },
  {
    brief: "EVENING BRIEF",
    date: "MON · 18 MAY",
    opacity: 0.75,
    cards: [
      {
        id: "d4",
        topic: "economics",
        headline:
          "Yen tumbles to 38-year low as Bank of Japan signals reluctance to intervene.",
        sources: 22,
        readMinutes: 5,
        bias: "Centre-right",
        biasColor: "#FFD000",
        diversity: 5.9,
      },
      {
        id: "d5",
        topic: "politics",
        headline:
          "NATO secretary general calls emergency summit following Baltic incident.",
        sources: 31,
        readMinutes: 7,
        bias: "Centre",
        biasColor: "#00C864",
        diversity: 7.8,
      },
      {
        id: "d6",
        topic: "health",
        headline:
          "WHO declares end to mpox emergency as cases fall across three continents.",
        sources: 11,
        readMinutes: 4,
        bias: "Centre",
        biasColor: "#00C864",
        diversity: 8.6,
      },
    ],
  },
  {
    brief: "MORNING BRIEF",
    date: "MON · 18 MAY",
    opacity: 0.75,
    cards: [
      {
        id: "d7",
        topic: "sport",
        headline:
          "Champions League final ends in penalty shootout as Real Madrid claim record title.",
        sources: 28,
        readMinutes: 4,
        bias: "Centre",
        biasColor: "#00C864",
        diversity: 9.4,
      },
      {
        id: "d8",
        topic: "economics",
        headline: "German industrial output contracts for third consecutive quarter.",
        sources: 16,
        readMinutes: 5,
        bias: "Centre-right",
        biasColor: "#FFD000",
        diversity: 6.2,
      },
    ],
  },
];

export const Route = createFileRoute("/digest")({
  head: () => ({ meta: [{ title: "Digest — lexinoori." }] }),
  component: DigestPage,
});

function DigestPage() {
  return (
    <div style={{ fontFamily: "Heebo, system-ui, sans-serif", padding: "16px 16px 24px" }}>
      {/* Header */}
      <h1 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 32, lineHeight: 1.1 }}>
        Digest.
      </h1>
      <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>
        Your personalised daily brief.
      </p>

      {/* Settings row */}
      <div
        style={{
          marginTop: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #2C2C2E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: "#8E8E93",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Delivery · 07:00 · Daily
        </span>
        <button
          style={{
            color: "#1A7A5E",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
            background: "transparent",
          }}
        >
          Change →
        </button>
      </div>

      {/* Groups */}
      <div style={{ paddingTop: 16 }}>
        {GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 4 : 24, opacity: group.opacity ?? 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottom: "1px solid #2C2C2E",
              }}
            >
              <span
                style={{
                  color: "#8E8E93",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {group.brief}
              </span>
              <span
                style={{
                  color: "#8E8E93",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {group.date}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {group.cards.map((c) => (
                <DigestArticleCard key={c.id} card={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DigestArticleCard({ card }: { card: DigestCard }) {
  const topicColor = TOPIC_COLORS[card.topic];
  const labelColor = DARK_TEXT.includes(card.topic) ? "#111111" : "#FFFFFF";
  return (
    <Link
      to="/article/$id"
      params={{ id: card.id }}
      style={{
        backgroundColor: "#1C1C1E",
        border: "1px solid #2C2C2E",
        borderRadius: 12,
        padding: 16,
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      <span
        style={{
          display: "inline-block",
          backgroundColor: topicColor,
          color: labelColor,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.08em",
          padding: "6px 8px",
          borderRadius: 20,
          lineHeight: 1,
        }}
      >
        {TOPIC_LABELS[card.topic]}
      </span>
      <h3
        style={{
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.3,
          marginTop: 8,
        }}
      >
        {card.headline}
      </h3>
      <p style={{ color: "#8E8E93", fontSize: 13, marginTop: 8 }}>
        Merged · {card.sources} sources · {card.readMinutes} min
      </p>
      <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: card.biasColor,
            display: "inline-block",
          }}
        />
        <span style={{ color: "#8E8E93", fontSize: 12 }}>
          {card.bias} · {card.diversity.toFixed(1)} diversity
        </span>
      </div>
    </Link>
  );
}
