import { useRef } from "react";
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";
import type { Topic } from "./TopicPill";

export type TabKey = "today" | Topic;

const TAB_KEYS: TabKey[] = [
  "today", "politics", "world", "climate", "technology",
  "economics", "sport", "health", "culture", "local",
];

export function TopicTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lang = useLanguage();
  const t = translations[lang];

  const LABELS: Record<TabKey, string> = {
    today: t.tabToday,
    politics: t.tabPolitics,
    world: t.tabWorld,
    climate: t.tabClimate,
    technology: t.tabTech,
    economics: t.tabEconomics,
    sport: t.tabSport,
    health: t.tabHealth,
    culture: t.tabCulture,
    local: t.tabLocal,
    breaking: t.pillBreaking,
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.lex-tabs::-webkit-scrollbar{display:none}`}</style>
        <div
          className="lex-tabs flex"
          style={{ gap: 16, padding: "0 24px", minWidth: "max-content" }}
        >
          {TAB_KEYS.map((key) => {
            const isActive = key === active;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                className="relative whitespace-nowrap"
                style={{
                  color: isActive ? "#FFFFFF" : "#8E8E93",
                  fontSize: 15,
                  fontWeight: 400,
                  paddingBottom: 10,
                  paddingTop: 4,
                  borderBottom: isActive ? "2px solid #1A7A5E" : "2px solid transparent",
                  transition: "color 200ms ease",
                }}
              >
                {LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 40,
          pointerEvents: "none",
          background: "linear-gradient(90deg, rgba(17,17,17,0) 0%, #111111 100%)",
        }}
      />
    </div>
  );
}
