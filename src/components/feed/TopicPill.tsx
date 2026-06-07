import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

type Topic =
  | "politics"
  | "world"
  | "climate"
  | "economics"
  | "sport"
  | "technology"
  | "health"
  | "culture"
  | "local"
  | "breaking";

const TOPIC_COLORS: Record<Topic, string> = {
  politics: "#4D6EFF",
  world: "#6B7280",
  climate: "#00C864",
  economics: "#FFD000",
  sport: "#FF4500",
  technology: "#00E5CC",
  health: "#00BFFF",
  culture: "#CC44FF",
  local: "#FF8C00",
  breaking: "#FF0000",
};

export function TopicPill({ topic }: { topic: Topic }) {
  const lang = useLanguage();
  const t = translations[lang];
  const LABELS: Record<Topic, string> = {
    politics: t.pillPolitics,
    world: t.pillWorld,
    climate: t.pillClimate,
    economics: t.pillEconomics,
    sport: t.pillSport,
    technology: t.pillTech,
    health: t.pillHealth,
    culture: t.pillCulture,
    local: t.pillLocal,
    breaking: t.pillBreaking,
  };
  const bg = TOPIC_COLORS[topic];
  return (
    <span
      style={{
        backgroundColor: `${bg}1F`,
        border: `1px solid ${bg}`,
        color: bg,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.08em",
        padding: "6px 8px",
        borderRadius: 20,
        lineHeight: 1,
      }}
    >
      {LABELS[topic]}
    </span>
  );
}

export function WhatsNewPill() {
  const lang = useLanguage();
  const t = translations[lang];
  return (
    <span
      style={{
        backgroundColor: "#1A7A5E",
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.08em",
        padding: "6px 8px",
        borderRadius: 20,
        lineHeight: 1,
      }}
    >
      {t.pillNew}
    </span>
  );
}

export { TOPIC_COLORS };
export type { Topic };
