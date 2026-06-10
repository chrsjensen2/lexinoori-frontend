import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/lang";
import { translations, type T } from "@/lib/i18n";

export const Route = createFileRoute("/timeline/$id")({
  head: () => ({ meta: [{ title: "Story Timeline — lexinoori." }] }),
  component: TimelinePage,
});

type TimelineEntry = {
  timestamp: string;
  delta_en: string | null;
  delta_da: string | null;
  delta_de: string | null;
  delta_es: string | null;
  source_count: number | null;
};

type ClusterRow = {
  headline: string | null;
  topic: string | null;
  status: string | null;
  source_count: number | null;
  update_count: number | null;
  created_at: string;
  last_updated_at: string | null;
  timeline: TimelineEntry[] | null;
};

const TOPIC_COLORS: Record<string, string> = {
  politics: "#4D6EFF",
  world: "#6B7280",
  climate: "#00C864",
  economics: "#FFD000",
  sport: "#FF6B35",
  technology: "#A78BFA",
  health: "#F472B6",
  culture: "#FB923C",
  local: "#34D399",
  breaking: "#EF4444",
};

function relTime(iso: string, t: T): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}${t.minAgo.split(" ")[0]}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t.hrAgo.split(" ")[0]}`;
  return `${Math.floor(hrs / 24)}${t.dayAgo.split(" ")[0]}`;
}

function lifespanLabel(createdAt: string): string {
  const hrs = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
  return hrs < 24 ? `${hrs}T` : `${Math.floor(hrs / 24)}D`;
}

function pickDelta(entry: TimelineEntry, lang: string): string {
  if (lang === "da" && entry.delta_da) return entry.delta_da;
  if (lang === "de" && entry.delta_de) return entry.delta_de;
  if (lang === "es" && entry.delta_es) return entry.delta_es;
  return entry.delta_en ?? "";
}

function TimelinePage() {
  const router = useRouter();
  const { id } = Route.useParams();
  const lang = useLanguage();
  const t = translations[lang];
  const [cluster, setCluster] = useState<ClusterRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    supabase
      .from("story_clusters" as any)
      .select("headline, topic, status, source_count, update_count, created_at, last_updated_at, timeline")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setCluster(data as ClusterRow | null);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  const topicColor = TOPIC_COLORS[cluster?.topic?.toLowerCase() ?? ""] ?? "#8E8E93";
  const entries: TimelineEntry[] = cluster?.timeline
    ? [...cluster.timeline].reverse()
    : [];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "16px",
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          height: "calc(56px + env(safe-area-inset-top))",
        }}
      >
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          style={{ color: "#FFFFFF", display: "flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={24} />
        </button>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            pointerEvents: "none",
          }}
        >
          {t.timelineHeader}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: "24px 16px", color: "#8E8E93", fontSize: 14 }}>{t.loading}</div>
      ) : !cluster ? (
        <div style={{ padding: "24px 16px", color: "#FFFFFF", fontSize: 16 }}>Historik ikke fundet.</div>
      ) : (
        <>
          {/* IDENTITY BLOCK */}
          <div style={{ padding: "20px 16px 0" }}>
            {cluster.topic && (
              <div style={{ color: topicColor, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
                {cluster.topic.toUpperCase()}
              </div>
            )}
            <h1 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 22, lineHeight: 1.2, marginTop: 8 }}>
              {cluster.headline}
            </h1>

            {/* STATUS ROW */}
            <div
              style={{
                marginTop: 12,
                backgroundColor: "#1C1C1E",
                border: "1px solid #2C2C2E",
                borderRadius: 12,
                padding: 16,
                display: "flex",
              }}
            >
              <StatusCol
                label="STATUS"
                value={cluster.status?.toUpperCase() === "ACTIVE" ? "AKTIV" : (cluster.status?.toUpperCase() ?? "AKTIV")}
                valueColor="#00C864"
              />
              <StatusCol label="OPDATERINGER" value={String(entries.length)} />
              <StatusCol label="KILDER" value={String(cluster.source_count ?? 0)} />
              <StatusCol label="LEVETID" value={lifespanLabel(cluster.created_at)} />
            </div>
          </div>

          {/* REVISIONS HEADER */}
          <div
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginTop: 16,
              padding: "0 16px",
            }}
          >
            {t.revisionsLabel}
          </div>

          {/* TIMELINE */}
          <div style={{ position: "relative", padding: "16px" }}>
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: 16 + 5,
                top: 16,
                bottom: 16,
                width: 2,
                backgroundColor: "#2C2C2E",
              }}
            />

            {entries.map((entry, i) => (
              <Entry
                key={entry.timestamp}
                dotFill={i === 0 ? "#1A7A5E" : "#2C2C2E"}
                dotBorder={i === 0 ? "#FFFFFF" : "#FFFFFF"}
                cardBorder={i === 0 ? "#1A7A5E40" : "#2C2C2E"}
                pillBg={i === 0 ? "#1A7A5E" : "#2C2C2E"}
                pillColor={i === 0 ? "#FFFFFF" : "#8E8E93"}
                pillLabel={lang === "da" ? "OPDATERING" : "UPDATE"}
                time={relTime(entry.timestamp, t)}
                body={pickDelta(entry, lang)}
                footer={entry.source_count ? `+${entry.source_count} ${lang === "da" ? "KILDER" : "SOURCES"}` : ""}
              />
            ))}

            {/* Original creation entry */}
            <Entry
              dotFill="#2C2C2E"
              dotBorder="#8E8E93"
              cardBorder="#2C2C2E"
              pillBg="#2C2C2E"
              pillColor="#8E8E93"
              pillLabel="ORIGINAL"
              time={relTime(cluster.created_at, t)}
              body={lang === "da"
                ? `Artikel oprettet fra ${cluster.source_count ?? 0} kilder`
                : `Article created from ${cluster.source_count ?? 0} sources`}
              footer=""
              last
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatusCol({
  label,
  value,
  valueColor = "#FFFFFF",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: "#8E8E93", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ color: valueColor, fontSize: 16, fontWeight: 700, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

function Entry({
  dotFill,
  dotBorder,
  cardBorder,
  pillBg,
  pillColor,
  pillLabel,
  time,
  body,
  footer,
  last = false,
}: {
  dotFill: string;
  dotBorder: string;
  cardBorder: string;
  pillBg: string;
  pillColor: string;
  pillLabel: string;
  time: string;
  body: string;
  footer: string;
  last?: boolean;
}) {
  return (
    <div style={{ position: "relative", paddingLeft: 28, marginBottom: last ? 0 : 16 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: dotFill,
          border: `2px solid ${dotBorder}`,
          boxSizing: "border-box",
          zIndex: 1,
        }}
      />
      <div
        style={{
          backgroundColor: "#1C1C1E",
          border: `1px solid ${cardBorder}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              backgroundColor: pillBg,
              color: pillColor,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            {pillLabel}
          </span>
          <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
            {time}
          </span>
        </div>
        {body && (
          <div style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
            {body}
          </div>
        )}
        {footer && (
          <div style={{ color: "#8E8E93", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginTop: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
