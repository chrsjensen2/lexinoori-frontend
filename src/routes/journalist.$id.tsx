import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export const Route = createFileRoute("/journalist/$id")({
  head: () => ({ meta: [{ title: "Journalist — lexinoori." }] }),
  component: JournalistPage,
});

type JournalistRow = {
  id: string;
  name: string;
current_source_id: string | null;
  article_count: number | null;
  loaded_language_score: number | null;
  source_diversity_score: number | null;
  bias_score: number | null;
  confidence_level: string | null;
  created_at: string | null;
  sources: { name: string | null } | null;
};

function JournalistPage() {
  const router = useRouter();
  const { id } = Route.useParams();
  const lang = useLanguage();
  const t = translations[lang];

  const { data, isLoading } = useQuery({
    queryKey: ["journalist", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journalists")
        .select(
       "id, name, current_source_id, article_count, loaded_language_score, bias_score, confidence_level, created_at, sources:current_source_id(name)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as JournalistRow | null;
    },
  });

  return (
    <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div
        style={{
          height: 52,
          display: "grid",
          gridTemplateColumns: "52px 1fr 52px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => router.history.back()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Back"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </button>
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          JOURNALIST
        </div>
        <div />
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: "#8E8E93", fontSize: 14 }}>{t.loading}</div>
      ) : !data ? (
        <div style={{ padding: 24, color: "#FFFFFF", fontSize: 16 }}>{t.journalistNotFound}</div>
      ) : (
        <JournalistContent j={data} />
      )}
    </div>
  );
}

function JournalistContent({ j }: { j: JournalistRow }) {
  const lang = useLanguage();
  const t = translations[lang];

  const articleCount = j.article_count ?? 0;
  const outlet = j.sources?.name ?? t.independent;

  const derivedConfidence: "LOW" | "MODERATE" | "HIGH" =
    articleCount >= 500 ? "HIGH" : articleCount >= 100 ? "MODERATE" : "LOW";
  const confidence =
    (j.confidence_level?.toUpperCase() as "LOW" | "MODERATE" | "HIGH" | undefined) ??
    derivedConfidence;

  const confidenceLabel =
    confidence === "LOW" ? t.confidenceLow
    : confidence === "HIGH" ? t.confidenceHigh
    : t.confidenceModerate;

  const isInsufficient = confidence === "LOW" || articleCount < 100;
  const needed = Math.max(0, 100 - articleCount);

  const confidenceColor =
    confidence === "LOW" ? "#E8873A" : confidence === "HIGH" ? "#00C864" : "#8E8E93";

  return (
    <>
      <div
        style={{
          margin: "20px 16px 0",
          backgroundColor: "#1A7A5E",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 28, lineHeight: 1.1 }}>
          {j.name}
        </div>
        <div style={{ color: "#FFFFFFCC", fontSize: 14, marginTop: 6 }}>{outlet}</div>
        <div style={{ color: "#FFFFFF99", fontSize: 13, marginTop: 4 }}>
          {articleCount} {articleCount === 1 ? t.article : t.articles} {t.analysed}
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              backgroundColor: confidenceColor,
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            {confidenceLabel} {t.confidenceSuffix}
          </span>
        </div>
      </div>

      {isInsufficient && (
        <div
          style={{
            margin: "12px 16px 0",
            backgroundColor: "#1C1C1E",
            border: "1px solid #2C2C2E",
            borderRadius: 12,
            padding: 16,
            color: "#E8873A",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {t.insufficientDataMsg} {needed}{" "}
          {needed === 1 ? t.moreArticleNeeded : t.moreArticlesNeeded}
        </div>
      )}

      {articleCount >= 100 && (
        <div
          style={{
            margin: "16px 16px 0",
            backgroundColor: "#1C1C1E",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #2C2C2E",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <ScoreBar
            label={t.loadedLanguageBar}
            value={Number(j.loaded_language_score ?? 0)}
            max={1}
            tone="inverse"
          />
          <ScoreBar
            label={t.sourceDiversityBar}
            value={Number(j.source_diversity_score ?? 0)}
            max={10}
          />
          <ScoreBar
            label={t.biasScoreBar}
            value={Number(j.bias_score ?? 0)}
            max={1}
            signed
          />
        </div>
      )}

      <div style={{ height: 24 }} />
    </>
  );
}

function ScoreBar({
  label,
  value,
  max,
  tone,
  signed,
}: {
  label: string;
  value: number;
  max: number;
  tone?: "inverse";
  signed?: boolean;
}) {
  const pct = signed
    ? Math.min(100, Math.max(0, ((value + max) / (max * 2)) * 100))
    : Math.min(100, Math.max(0, (value / max) * 100));
  const good = tone === "inverse" ? pct < 30 : pct > 60;
  const color = good ? "#00C864" : pct > 80 || pct < 20 ? "#E8873A" : "#1A7A5E";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>
          {signed && value > 0 ? "+" : ""}
          {value.toFixed(2)}
          <span style={{ color: "#8E8E93", fontWeight: 400 }}>
            {" "}/ {signed ? `±${max}` : max}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 6,
          backgroundColor: "#2C2C2E",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
