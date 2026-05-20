import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { TopicTabs } from "@/components/feed/TopicTabs";
import { BreakingNewsCard } from "@/components/feed/BreakingNewsCard";
import { ArticleCard } from "@/components/feed/ArticleCard";
import type { Topic } from "@/components/feed/TopicPill";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — lexinoori." },
      { name: "description", content: "Today's news, merged from 213 outlets." },
    ],
  }),
  component: TodayPage,
});

type Article = {
  id: string;
  topic: Topic;
  timeAgo: string;
  headline: string;
  outletInitial: string;
  sources: number;
  readMinutes: number;
  bias: "low" | "medium" | "high";
  biasLabel: string;
  whatsNew?: boolean;
  thumbnail?: boolean;
};

const TODAY_ARTICLES: Article[] = [
  { id: "1", topic: "politics", timeAgo: "3H AGO", headline: "EU finance ministers split over emergency defence spending package ahead of summit.", outletInitial: "R", sources: 9, readMinutes: 6, bias: "low", biasLabel: "Centre-left · 7.4 diversity", thumbnail: true },
  { id: "2", topic: "climate", timeAgo: "5H AGO", headline: "Atlantic hurricane season opens with two named storms in single week, NOAA warns.", outletInitial: "N", sources: 14, readMinutes: 4, bias: "low", biasLabel: "Centre · 8.1 diversity" },
  { id: "3", topic: "economics", timeAgo: "6H AGO", headline: "Yen tumbles to 38-year low as Bank of Japan signals reluctance to intervene.", outletInitial: "F", sources: 22, readMinutes: 5, bias: "medium", biasLabel: "Centre-right · 5.9 diversity" },
  { id: "4", topic: "technology", timeAgo: "2H AGO", headline: "Meta releases open-weights vision model, undercutting closed competitors on benchmarks.", outletInitial: "V", sources: 11, readMinutes: 7, bias: "low", biasLabel: "Centre · 6.8 diversity", whatsNew: true },
];

const POLITICS_ARTICLES: Article[] = [
  { id: "p1", topic: "politics", timeAgo: "3H AGO", headline: "EU finance ministers split over emergency defence spending package ahead of summit.", outletInitial: "R", sources: 9, readMinutes: 6, bias: "low", biasLabel: "Centre-left · 7.4 diversity" },
  { id: "p2", topic: "politics", timeAgo: "5H AGO", headline: "French parliament votes to extend state of emergency by 90 days.", outletInitial: "L", sources: 12, readMinutes: 5, bias: "low", biasLabel: "Centre · 7.8 diversity" },
  { id: "p3", topic: "politics", timeAgo: "8H AGO", headline: "NATO secretary general calls emergency summit following Baltic incident.", outletInitial: "A", sources: 18, readMinutes: 4, bias: "low", biasLabel: "Centre · 8.2 diversity" },
];

const CLIMATE_ARTICLES: Article[] = [
  { id: "c1", topic: "climate", timeAgo: "5H AGO", headline: "Atlantic hurricane season opens with two named storms in single week, NOAA warns.", outletInitial: "N", sources: 14, readMinutes: 4, bias: "low", biasLabel: "Centre · 8.1 diversity" },
  { id: "c2", topic: "climate", timeAgo: "9H AGO", headline: "Arctic permafrost thaw accelerating faster than models predicted, study finds.", outletInitial: "G", sources: 8, readMinutes: 6, bias: "low", biasLabel: "Centre-left · 7.6 diversity" },
  { id: "c3", topic: "climate", timeAgo: "12H AGO", headline: "EU carbon border tax faces legal challenge from six member states.", outletInitial: "P", sources: 11, readMinutes: 5, bias: "medium", biasLabel: "Centre · 6.9 diversity" },
];

const TECH_ARTICLES: Article[] = [
  { id: "t1", topic: "technology", timeAgo: "2H AGO", headline: "Meta releases open-weights vision model, undercutting closed competitors on benchmarks.", outletInitial: "V", sources: 11, readMinutes: 7, bias: "low", biasLabel: "Centre · 6.8 diversity" },
  { id: "t2", topic: "technology", timeAgo: "4H AGO", headline: "Apple delays AI feature rollout in Europe citing regulatory uncertainty.", outletInitial: "B", sources: 16, readMinutes: 5, bias: "low", biasLabel: "Centre · 7.4 diversity" },
  { id: "t3", topic: "technology", timeAgo: "7H AGO", headline: "OpenAI announces GPT-5 with extended context window and reasoning improvements.", outletInitial: "T", sources: 22, readMinutes: 6, bias: "low", biasLabel: "Centre · 7.1 diversity" },
];

const ECONOMY_ARTICLES: Article[] = [
  { id: "e1", topic: "economics", timeAgo: "6H AGO", headline: "Yen tumbles to 38-year low as Bank of Japan signals reluctance to intervene.", outletInitial: "F", sources: 22, readMinutes: 5, bias: "medium", biasLabel: "Centre-right · 5.9 diversity" },
  { id: "e2", topic: "economics", timeAgo: "10H AGO", headline: "German industrial output contracts for third consecutive quarter.", outletInitial: "H", sources: 9, readMinutes: 4, bias: "low", biasLabel: "Centre · 7.2 diversity" },
  { id: "e3", topic: "economics", timeAgo: "1D AGO", headline: "IMF revises global growth forecast downward citing trade fragmentation.", outletInitial: "I", sources: 19, readMinutes: 6, bias: "low", biasLabel: "Centre · 8.0 diversity" },
];

const SPORT_ARTICLES: Article[] = [
  { id: "s1", topic: "sport", timeAgo: "1H AGO", headline: "Champions League final ends in penalty shootout as Real Madrid claim record title.", outletInitial: "M", sources: 28, readMinutes: 5, bias: "low", biasLabel: "Centre · 8.4 diversity" },
  { id: "s2", topic: "sport", timeAgo: "5H AGO", headline: "Tour de France route unveiled with three summit finishes in final week.", outletInitial: "L", sources: 12, readMinutes: 4, bias: "low", biasLabel: "Centre · 7.6 diversity" },
  { id: "s3", topic: "sport", timeAgo: "9H AGO", headline: "ICC announces expanded World Cup format from 2027 with 16 teams.", outletInitial: "C", sources: 14, readMinutes: 4, bias: "low", biasLabel: "Centre · 7.3 diversity" },
];

const ARTICLES_BY_TAB: Record<string, Article[]> = {
  Today: TODAY_ARTICLES,
  Politics: POLITICS_ARTICLES,
  Climate: CLIMATE_ARTICLES,
  Tech: TECH_ARTICLES,
  Economy: ECONOMY_ARTICLES,
  Sport: SPORT_ARTICLES,
  Health: [],
  Culture: [],
  Local: [],
};

function formatDateTime(d: Date) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function TodayPage() {
  const breaking = true;
  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => { setDateLabel(formatDateTime(new Date())); }, []);
  const [activeTab, setActiveTab] = useState("Today");
  const hideTopic = activeTab !== "Today";

  return (
    <div>
      {/* Header */}
      <header
        className="sticky top-0 z-30 bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div style={{ padding: "16px 24px 12px" }}>
          <div className="flex items-start justify-between gap-3">
            <h1
              className="flex items-center"
              style={{
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Today{!breaking && "."}
              {breaking && (
                <span
                  aria-label="Breaking news live"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: "#00C864",
                    marginLeft: 4,
                    marginBottom: 6,
                    alignSelf: "flex-end",
                    animation: "lex-pulse 1.6s ease-in-out infinite",
                  }}
                />
              )}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12 }}>
              <span
                style={{
                  color: "#8E8E93",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {dateLabel}
              </span>
              <Link
                to="/search"
                aria-label="Search"
                style={{ color: "#8E8E93", display: "inline-flex" }}
              >
                <Search size={24} />
              </Link>
            </div>
          </div>

          <p style={{ color: "#8E8E93", fontSize: 13, marginTop: 8 }}>
            18 stories merged from 213 outlets across 27 countries.
          </p>
        </div>

        <div style={{ paddingBottom: 4 }}>
          <TopicTabs active={activeTab} onChange={setActiveTab} />
        </div>
        <div style={{ height: 1, backgroundColor: "#2C2C2E" }} />
      </header>

      {/* Breaking news */}
      <div style={{ marginTop: 16 }}>
        <BreakingNewsCard
          headline="Cease-fire collapses in Sahel as mediators withdraw overnight."
          sources={47}
          timeAgo="7M AGO"
        />
      </div>

      {/* For you */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 24px", marginTop: 20, marginBottom: 12 }}
      >
        <span style={{ color: "#8E8E93", fontSize: 11, letterSpacing: "0.08em", fontWeight: 700 }}>
          FOR YOU · 14 STORIES
        </span>
        <button
          style={{
            color: "#1A7A5E",
            fontSize: 11,
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          EDIT →
        </button>
      </div>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {ARTICLES_BY_TAB[activeTab].map((a) => (
          <ArticleCard key={a.id} {...a} hideTopic={hideTopic} />
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
