import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { getUserLanguage, pickLang, TRANSLATED_COLS } from "@/lib/articleLanguage";


type DigestCard = {
  id: string;
  topic: Topic;
  headline: string;
  sources: number;
  readMinutes: number;
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

function todayLabel() {
  const d = new Date();
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]}`;
}

export const Route = createFileRoute("/digest")({
  head: () => ({ meta: [{ title: "Digest — lexinoori." }] }),
  component: DigestPage,
});

function DigestPage() {
  const [cards, setCards] = useState<DigestCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const language = await getUserLanguage();
      const selectCols =
        "id, topic, read_time_minutes, source_count, diversity_score, created_at, " + TRANSLATED_COLS;
      const { data } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .order("created_at", { ascending: false })
        .limit(5);
      if (cancelled) return;
      const valid: Topic[] = ["politics","climate","economics","sport","technology","health","culture","local","breaking"];
      setCards(
        ((data as any[]) || []).map((r) => {
          const t = (r.topic || "").toLowerCase();
          const topic = (valid.includes(t as Topic) ? t : "politics") as Topic;
          return {
            id: r.id,
            topic,
            headline: pickLang<string>(r, "headline", language) ?? "",
            sources: r.source_count ?? 0,
            readMinutes: r.read_time_minutes ?? 5,
            diversity: Number(r.diversity_score ?? 0),
          };
        })
      );
    })();
    return () => { cancelled = true; };
  }, []);

  const groups = [{ brief: "TODAY'S BRIEF", date: todayLabel(), cards }];

  return (
    <div style={{ fontFamily: "Heebo, system-ui, sans-serif", padding: "16px 16px 24px" }}>
      <h1 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 32, lineHeight: 1.1 }}>
        Digest.
      </h1>
      <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>
        Your personalised daily brief.
      </p>

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

      <div style={{ paddingTop: 16 }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 4 : 24 }}>
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
              {group.cards.length === 0 && (
                <p style={{ color: "#8E8E93", fontSize: 13 }}>No articles yet.</p>
              )}
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
