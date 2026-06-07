import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopicPill, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";
import { getUserLanguage, pickLang, TRANSLATED_COLS } from "@/lib/articleLanguage";
import { useLanguage } from "@/lib/lang";
import { translations, type T } from "@/lib/i18n";

type DigestCard = {
  id: string;
  topic: Topic;
  headline: string;
  sources: number;
  readMinutes: number;
  diversity: number;
};

type Depth = "Bullets" | "Brief" | "Standard" | "Deep Dive";

function getDepth(): Depth {
  if (typeof window === "undefined") return "Standard";
  const v = window.localStorage.getItem("lex:depth");
  return v === "Bullets" || v === "Brief" || v === "Deep Dive" ? v : "Standard";
}

function depthMinutes(depth: Depth, minutes: number): number {
  if (depth === "Bullets") return 1;
  if (depth === "Brief") return 2;
  if (depth === "Deep Dive") return minutes * 3;
  return Math.max(2, minutes);
}

function todayLabel(t: T) {
  const d = new Date();
  const days = [t.daySun, t.dayMon, t.dayTue, t.dayWed, t.dayThu, t.dayFri, t.daySat];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]}`;
}

export const Route = createFileRoute("/digest")({
  head: () => ({ meta: [{ title: "Digest — lexinoori." }] }),
  component: DigestPage,
});

function DigestPage() {
  const lang = useLanguage();
  const t = translations[lang];
  const [cards, setCards] = useState<DigestCard[]>([]);
  const [depth, setDepth] = useState<Depth>(getDepth());

  useEffect(() => {
    const onDepth = () => setDepth(getDepth());
    window.addEventListener("lex:depth-changed", onDepth);
    window.addEventListener("storage", onDepth);
    return () => {
      window.removeEventListener("lex:depth-changed", onDepth);
      window.removeEventListener("storage", onDepth);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const language = await getUserLanguage();
      const selectCols =
        "id, topic, read_time_minutes, source_count, diversity_score, created_at, " + TRANSLATED_COLS;
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5);
      if (cancelled) return;
      const valid: Topic[] = ["politics", "world", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
      setCards(
        ((data as any[]) || []).map((r) => {
          const topicStr = (r.topic || "").toLowerCase();
          const topic = (valid.includes(topicStr as Topic) ? topicStr : "politics") as Topic;
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
  }, [lang]);

  const dateStr = todayLabel(t);
  const groups = [
    { brief: t.morningBriefing, date: dateStr, cards: cards.slice(0, 3) },
    { brief: t.eveningBriefing, date: dateStr, cards: cards.slice(3, 5) },
  ];

  return (
    <div style={{ fontFamily: "Heebo, system-ui, sans-serif", padding: "16px 16px 24px" }}>
      <h1 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 32, lineHeight: 1.1 }}>
        {t.digestHeading}
      </h1>
      <p style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>
        {t.digestSubtitle}
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
          {t.deliverySchedule}
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
          {t.changeDelivery}
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
                <DigestArticleCard key={c.id} card={c} depth={depth} />
              ))}
              {group.cards.length === 0 && (
                <p style={{ color: "#8E8E93", fontSize: 13 }}>{t.noArticlesYet}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DigestArticleCard({ card, depth }: { card: DigestCard; depth: Depth }) {
  const lang = useLanguage();
  const t = translations[lang];
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
      <TopicPill topic={card.topic} />

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
        {t.merged} · {card.sources} {card.sources === 1 ? t.source : t.sources} · {depthMinutes(depth, card.readMinutes)} {t.min}
      </p>
      <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: "#1A7A5E",
            display: "inline-block",
          }}
        />
        <span style={{ color: "#8E8E93", fontSize: 12 }}>
          {card.diversity.toFixed(1)} {t.diversity}
        </span>
      </div>
    </Link>
  );
}
