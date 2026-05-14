import { useRef, useState } from "react";

const TABS = [
  "Today",
  "Politics",
  "Climate",
  "Tech",
  "Economy",
  "Sport",
  "Health",
  "Culture",
  "Local",
];

export function TopicTabs() {
  const [active, setActive] = useState("Today");
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`.lex-tabs::-webkit-scrollbar{display:none}`}</style>
      <div
        className="lex-tabs flex"
        style={{ gap: 16, padding: "0 24px", minWidth: "max-content" }}
      >
        {TABS.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
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
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
