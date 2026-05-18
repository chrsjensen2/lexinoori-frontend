import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopicTabs } from "@/components/feed/TopicTabs";
import { BreakingNewsCard } from "@/components/feed/BreakingNewsCard";
import { ArticleCard } from "@/components/feed/ArticleCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — lexinoori." },
      { name: "description", content: "Today's news, merged from 213 outlets." },
    ],
  }),
  component: TodayPage,
});

function formatDateTime(d: Date) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function TodayPage() {
  const breaking = true;
  const dateLabel = formatDateTime(new Date());
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
            <span
              style={{
                color: "#8E8E93",
                fontSize: 13,
                letterSpacing: "0.08em",
                paddingTop: 12,
                whiteSpace: "nowrap",
              }}
            >
              {dateLabel}
            </span>
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
