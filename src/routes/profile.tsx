import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, User as UserIcon, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Settings — lexinoori." }] }),
  component: SettingsPage,
});

const READING_STOPS = [
  {
    key: "beginner",
    label: "BEGINNER",
    title: "Beginner",
    desc: "~200 words. Simple language, no jargon, key facts only.",
  },
  {
    key: "standard",
    label: "STANDARD",
    title: "Standard",
    desc: "~600 words per article. We assume context and define jargon.",
  },
  {
    key: "expert",
    label: "EXPERT",
    title: "Expert",
    desc: "~1200 words. Full context, multiple angles, data included.",
  },
  {
    key: "deepdive",
    label: "DEEP DIVE",
    title: "Deep Dive",
    desc: "~2500 words. Everything. Pull quotes, subheadings, full source list.",
  },
] as const;

const ZOOM_STOPS = ["WORLD", "CONTINENT", "COUNTRY", "LOCAL"] as const;

const TOPICS = [
  { key: "breaking", label: "Breaking news", color: "#FF0000" },
  { key: "politics", label: "Politics", color: "#4D6EFF" },
  { key: "climate", label: "Climate", color: "#00C864" },
  { key: "economics", label: "Economics", color: "#FFD000" },
  { key: "technology", label: "Technology", color: "#00E5CC" },
  { key: "health", label: "Health", color: "#00BFFF" },
  { key: "culture", label: "Culture", color: "#CC44FF" },
  { key: "sport", label: "Sport", color: "#FF4500" },
] as const;

function StopSlider({
  stops,
  activeIndex,
  onChange,
}: {
  stops: readonly string[];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  const pct = stops.length > 1 ? (activeIndex / (stops.length - 1)) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {stops.map((s, i) => (
          <button
            key={s}
            onClick={() => onChange(i)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: i === activeIndex ? "#FFFFFF" : "#8E8E93",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ position: "relative", height: 14, marginTop: 12 }}>
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 0,
            right: 0,
            height: 4,
            background: "#2C2C2E",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 0,
            width: `${pct}%`,
            height: 4,
            background: "#1A7A5E",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${pct}% - 7px)`,
            width: 14,
            height: 14,
            background: "#1A7A5E",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? "#1A7A5E" : "#2C2C2E",
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 150ms",
        padding: 0,
        flexShrink: 0,
      }}
      aria-pressed={on}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#FFFFFF",
          transition: "left 150ms",
        }}
      />
    </button>
  );
}

function SectionHeader({ children, top = 20 }: { children: React.ReactNode; top?: number }) {
  return (
    <div
      style={{
        color: "#8E8E93",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "0 16px",
        marginTop: top,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function SettingsPage() {
  const [readingIdx, setReadingIdx] = useState(1);
  const [zoomIdx, setZoomIdx] = useState(2);
  const [topics, setTopics] = useState<Record<string, boolean>>({
    breaking: true,
    politics: true,
    climate: true,
    economics: false,
    technology: true,
    health: false,
    culture: false,
    sport: false,
  });

  const current = READING_STOPS[readingIdx];

  return (
    <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 0" }}>
        <h1
          style={{
            color: "#FFFFFF",
            fontSize: 32,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Settings.
        </h1>
      </div>

      {/* Account */}
      <SectionHeader top={24}>ACCOUNT</SectionHeader>
      <div style={{ background: "#1C1C1E" }}>
        <AccountRow to="/saved" Icon={Bookmark} label="Saved articles" />
        <AccountRow to="/following" Icon={UserIcon} label="Following" />
      </div>

      {/* Reading level card */}
      <SectionHeader top={24}>READING LEVEL · APPLIES EVERYWHERE</SectionHeader>
      <div
        style={{
          margin: "0 16px",
          background: "#1C1C1E",
          border: "1px solid #2C2C2E",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 4,
          }}
        >
          {current.title}
        </div>
        <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 4, lineHeight: 1.4 }}>
          {current.desc}
        </div>
        <div style={{ marginTop: 16 }}>
          <StopSlider
            stops={READING_STOPS.map((s) => s.label)}
            activeIndex={readingIdx}
            onChange={setReadingIdx}
          />
        </div>
      </div>

      {/* Region section */}
      <SectionHeader>REGION · LANGUAGE · GEOGRAPHY</SectionHeader>
      <div style={{ background: "#1C1C1E" }}>
        <SettingRow label="Reading language" value="English ›" />
        <SettingRow label="Secondary language" value="Dansk ›" />
        <div
          style={{
            minHeight: 56,
            padding: "10px 16px",
            borderBottom: "1px solid #2C2C2E",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: "#FFFFFF", fontSize: 15 }}>Geographic zoom · default</div>
            <div style={{ color: "#8E8E93", fontSize: 13, marginTop: 2 }}>
              How far to zoom in by default
            </div>
          </div>
          <div
            style={{
              color: "#1A7A5E",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {ZOOM_STOPS[zoomIdx]}
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        <StopSlider stops={ZOOM_STOPS} activeIndex={zoomIdx} onChange={setZoomIdx} />
      </div>

      {/* Breaking news */}
      <SectionHeader>BREAKING NEWS · NOTIFY ME FOR</SectionHeader>
      <div style={{ background: "#1C1C1E" }}>
        {TOPICS.map((t) => (
          <div
            key={t.key}
            style={{
              height: 52,
              padding: "0 16px",
              borderBottom: "1px solid #2C2C2E",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: t.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#FFFFFF", fontSize: 15 }}>{t.label}</span>
            </div>
            <Toggle
              on={topics[t.key]}
              onChange={(v) => setTopics((p) => ({ ...p, [t.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        height: 56,
        padding: "0 16px",
        borderBottom: "1px solid #2C2C2E",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ color: "#FFFFFF", fontSize: 15 }}>{label}</span>
      <span style={{ color: "#8E8E93", fontSize: 15 }}>{value}</span>
    </div>
  );
}
