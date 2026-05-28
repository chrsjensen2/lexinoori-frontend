import { useRef } from "react";

const TABS = [
  "Today",
  "Politics",
  "World",
  "Climate",
  "Tech",
  "Economy",
  "Sport",
  "Health",
  "Culture",
  "Local",
];


export function TopicTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative" }}>
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
                onClick={() => onChange(tab)}
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
