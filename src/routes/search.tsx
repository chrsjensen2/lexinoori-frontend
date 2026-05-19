import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Search as SearchIcon, Clock, X, ChevronRight } from "lucide-react";
import { TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

const TOPICS: { id: Topic; label: string }[] = [
  { id: "politics", label: "POLITICS" },
  { id: "climate", label: "CLIMATE" },
  { id: "technology", label: "TECH" },
  { id: "economics", label: "ECONOMY" },
  { id: "sport", label: "SPORT" },
  { id: "health", label: "HEALTH" },
  { id: "culture", label: "CULTURE" },
  { id: "local", label: "LOCAL" },
];

const DARK_TEXT: Topic[] = ["economics", "technology", "health"];

type Bias = "low" | "medium" | "high";
const BIAS_COLOR: Record<Bias, string> = {
  low: "#00C864",
  medium: "#FFD000",
  high: "#FF4500",
};

interface StoryResult {
  id: string;
  topic: Topic;
  topicLabel: string;
  headline: string;
  sources: number;
  readMinutes: number;
  bias: Bias;
  biasLabel: string;
  diversity: number;
}

const STORY_RESULTS: StoryResult[] = [
  {
    id: "eu-defence",
    topic: "politics",
    topicLabel: "POLITICS",
    headline:
      "EU finance ministers split over emergency defence spending package ahead of summit.",
    sources: 9,
    readMinutes: 6,
    bias: "low",
    biasLabel: "Centre-left",
    diversity: 7.4,
  },
  {
    id: "eu-digital",
    topic: "politics",
    topicLabel: "POLITICS",
    headline:
      "EU digital sovereignty bill fast-tracks past national vetoes after marathon trilogue.",
    sources: 12,
    readMinutes: 5,
    bias: "low",
    biasLabel: "Centre-left",
    diversity: 7.1,
  },
  {
    id: "eu-carbon",
    topic: "economics",
    topicLabel: "ECONOMICS",
    headline:
      "EU carbon border tax faces legal challenge from six member states.",
    sources: 8,
    readMinutes: 4,
    bias: "low",
    biasLabel: "Centre",
    diversity: 7.8,
  },
];

interface JournalistResult {
  id: string;
  initials: string;
  name: string;
  outlet: string;
  bylines: number;
}

const JOURNALIST_RESULTS: JournalistResult[] = [
  { id: "marius", initials: "ML", name: "Marius Lehnert", outlet: "The Wire", bylines: 412 },
  { id: "sophie", initials: "SR", name: "Sophie Randers", outlet: "DR", bylines: 287 },
];

const RECENT_DEFAULT = [
  "EU sanctions",
  "Climate permafrost",
  "Bank of Japan",
  "Marius Lehnert",
];

function TopicPillSmall({ topic, label }: { topic: Topic; label: string }) {
  const bg = TOPIC_COLORS[topic];
  const color = DARK_TEXT.includes(topic) ? "#111111" : "#FFFFFF";
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
      {label}
    </span>
  );
}

function SectionLabel({ children, mt = 16 }: { children: React.ReactNode; mt?: number }) {
  return (
    <div
      style={{
        color: "#8E8E93",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        paddingLeft: 16,
        marginTop: mt,
      }}
    >
      {children}
    </div>
  );
}

function StoryCard({ story }: { story: StoryResult }) {
  return (
    <Link
      to="/article/$id"
      params={{ id: story.id }}
      style={{
        display: "block",
        backgroundColor: "#1C1C1E",
        border: "1px solid #2C2C2E",
        borderRadius: 12,
        padding: 16,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <TopicPillSmall topic={story.topic} label={story.topicLabel} />
      <h3
        style={{
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.3,
          marginTop: 8,
        }}
      >
        {story.headline}
      </h3>
      <div style={{ color: "#8E8E93", fontSize: 13, marginTop: 8 }}>
        Merged · {story.sources} sources · {story.readMinutes} min
      </div>
      <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: BIAS_COLOR[story.bias],
            display: "inline-block",
          }}
        />
        <span style={{ color: "#8E8E93", fontSize: 12 }}>
          {story.biasLabel} · {story.diversity.toFixed(1)} diversity
        </span>
      </div>
    </Link>
  );
}

function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("EU");
  const [recent, setRecent] = useState(RECENT_DEFAULT);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim();
  const showRecent = trimmed.length === 0;
  const lower = trimmed.toLowerCase();
  const filteredStories = STORY_RESULTS.filter((s) =>
    s.headline.toLowerCase().includes(lower) || s.topicLabel.toLowerCase().includes(lower),
  );
  const filteredJournalists = JOURNALIST_RESULTS.filter((j) =>
    j.name.toLowerCase().includes(lower),
  );
  const hasResults = filteredStories.length > 0 || filteredJournalists.length > 0;

  const removeRecent = (term: string) =>
    setRecent((r) => r.filter((t) => t !== term));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 56,
            backgroundColor: "#1C1C1E",
            border: "1px solid #2C2C2E",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 12,
          }}
        >
          <SearchIcon size={20} color="#8E8E93" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, topics, journalists..."
            style={{
              flex: 1,
              marginLeft: 12,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#FFFFFF",
              caretColor: "#FFFFFF",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
        </div>
        <button
          onClick={() => router.history.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#1A7A5E",
            fontSize: 15,
            fontWeight: 400,
            padding: 0,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      {/* Topic pills */}
      <SectionLabel mt={8}>TOPICS</SectionLabel>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "0 16px 4px",
          scrollbarWidth: "none",
        }}
      >
        {TOPICS.map((t) => {
          const active = activeTopic === t.id;
          const bg = active ? TOPIC_COLORS[t.id] : "#1C1C1E";
          const color = active
            ? DARK_TEXT.includes(t.id)
              ? "#111111"
              : "#FFFFFF"
            : "#8E8E93";
          return (
            <button
              key={t.id}
              onClick={() => setActiveTopic(active ? null : t.id)}
              style={{
                backgroundColor: bg,
                color,
                border: active ? "none" : "1px solid #2C2C2E",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                padding: "6px 8px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {showRecent ? (
        <>
          <SectionLabel>RECENT</SectionLabel>
          <div style={{ marginTop: 8 }}>
            {recent.map((term, idx) => (
              <div
                key={term}
                style={{
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  borderBottom:
                    idx < recent.length - 1 ? "1px solid #2C2C2E" : "none",
                  gap: 12,
                }}
              >
                <Clock size={20} color="#8E8E93" />
                <button
                  onClick={() => {
                    setQuery(term);
                    inputRef.current?.focus();
                  }}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 15,
                    textAlign: "left",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {term}
                </button>
                <button
                  onClick={() => removeRecent(term)}
                  aria-label={`Remove ${term}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#8E8E93",
                    padding: 4,
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : hasResults ? (
        <>
          {filteredStories.length > 0 && (
            <>
              <SectionLabel>STORIES</SectionLabel>
              <div
                style={{
                  marginTop: 12,
                  padding: "0 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {filteredStories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </>
          )}

          {filteredJournalists.length > 0 && (
            <>
              <SectionLabel mt={20}>JOURNALISTS</SectionLabel>
              <div style={{ marginTop: 8 }}>
                {filteredJournalists.map((j, idx) => (
                  <Link
                    key={j.id}
                    to="/journalist/$id"
                    params={{ id: j.id }}
                    style={{
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 16px",
                      borderBottom:
                        idx < filteredJournalists.length - 1
                          ? "1px solid #2C2C2E"
                          : "none",
                      gap: 12,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        backgroundColor: "#1A7A5E",
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {j.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "#FFFFFF",
                          fontSize: 15,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {j.name}
                      </div>
                      <div
                        style={{
                          color: "#8E8E93",
                          fontSize: 13,
                          marginTop: 2,
                        }}
                      >
                        {j.outlet} · {j.bylines} bylines
                      </div>
                    </div>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: "#00C864",
                        display: "inline-block",
                      }}
                    />
                    <ChevronRight size={20} color="#8E8E93" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
            marginTop: "30vh",
          }}
        >
          <div style={{ color: "#8E8E93", fontSize: 16 }}>No results for</div>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {trimmed}
          </div>
          <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 8 }}>
            Try a different keyword or topic.
          </div>
        </div>
      )}
    </div>
  );
}
