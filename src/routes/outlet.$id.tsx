import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/lang";
import { translations, type T } from "@/lib/i18n";
import { getUserLanguage, pickLang, TRANSLATED_COLS } from "@/lib/articleLanguage";

export const Route = createFileRoute("/outlet/$id")({
  head: () => ({ meta: [{ title: "Outlet — lexinoori." }] }),
  component: OutletPage,
});

type SourceRow = {
  id: string;
  name: string;
  url: string | null;
  language: string | null;
  tier: number | null;
  owner: string | null;
  article_count: number | null;
  journalist_count: number | null;
  logo_url: string | null;
};

type OutletStats = {
  totalArticles: number;
  firstDate: string | null;
  latestDate: string | null;
  avgBiasScore: number | null;
  avgLoadedLanguage: number | null;
};

type TopJournalist = {
  id: string;
  name: string;
  count: number;
};

type RecentArticle = {
  id: string;
  headline: string;
  topic: string | null;
  created_at: string;
};

function OutletPage() {
  const router = useRouter();
  const { id } = Route.useParams();
  const lang = useLanguage();
  const t = translations[lang];

  const [source, setSource] = useState<SourceRow | null>(null);
  const [stats, setStats] = useState<OutletStats | null>(null);
  const [topJournalists, setTopJournalists] = useState<TopJournalist[]>([]);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const language = await getUserLanguage();
      const articleCols = "id, topic, created_at, " + TRANSLATED_COLS;

      // Phase 1 — source info + source_articles stats + earliest date in parallel
      const [sourceRes, statsRes, firstRes] = await Promise.all([
        (supabase as any)
          .from("sources")
          .select("id, name, url, language, tier, owner, article_count, journalist_count, logo_url")
          .eq("id", id)
          .maybeSingle(),
        (supabase as any)
          .from("source_articles")
          .select("scraped_at, bias_score, loaded_language, journalist_id, cluster_id", { count: "exact" })
          .eq("source_id", id)
          .order("scraped_at", { ascending: false })
          .limit(200),
        (supabase as any)
          .from("source_articles")
          .select("scraped_at")
          .eq("source_id", id)
          .order("scraped_at", { ascending: true })
          .limit(1),
      ]);

      if (cancelled) return;

      setSource(sourceRes.data ?? null);

      const rows: any[] = statsRes.data ?? [];
      const totalArticles: number = statsRes.count ?? rows.length;
      const latestDate = rows[0]?.scraped_at ?? null;
      const firstDate = firstRes.data?.[0]?.scraped_at ?? null;

      const biasScores = rows.map((r: any) => r.bias_score).filter((v: any) => v != null);
      const avgBiasScore =
        biasScores.length > 0
          ? biasScores.reduce((a: number, b: number) => a + b, 0) / biasScores.length
          : null;

      const langCounts = rows.map((r: any) =>
        Array.isArray(r.loaded_language) ? r.loaded_language.length : 0,
      );
      const avgLoadedLanguage =
        langCounts.length > 0
          ? langCounts.reduce((a: number, b: number) => a + b, 0) / langCounts.length
          : null;

      setStats({ totalArticles, firstDate, latestDate, avgBiasScore, avgLoadedLanguage });

      // Top 5 journalists by article count in this source
      const jIdCounts = new Map<string, number>();
      for (const r of rows) {
        if (r.journalist_id) {
          jIdCounts.set(r.journalist_id, (jIdCounts.get(r.journalist_id) ?? 0) + 1);
        }
      }
      const top5Ids = [...jIdCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([jId]) => jId);

      // Phase 2 — journalist names + recent articles in parallel
      const clusterIds = [
        ...new Set(rows.slice(0, 10).map((r: any) => r.cluster_id).filter(Boolean)),
      ];

      const [journalistRes, articlesRes] = await Promise.all([
        top5Ids.length > 0
          ? (supabase as any)
              .from("journalists")
              .select("id, name")
              .in("id", top5Ids)
              .limit(200)
          : Promise.resolve({ data: [] }),
        clusterIds.length > 0
          ? (supabase as any)
              .from("articles")
              .select(articleCols)
              .in("cluster_id", clusterIds)
              .order("created_at", { ascending: false })
              .limit(10)
          : Promise.resolve({ data: [] }),
      ]);

      if (cancelled) return;

      const journalistMap = new Map<string, string>(
        ((journalistRes.data ?? []) as any[]).map((j: any) => [j.id, j.name]),
      );
      setTopJournalists(
        top5Ids
          .filter((jId) => journalistMap.has(jId))
          .map((jId) => ({ id: jId, name: journalistMap.get(jId)!, count: jIdCounts.get(jId)! })),
      );

      setRecentArticles(
        ((articlesRes.data ?? []) as any[]).map((r: any) => ({
          id: r.id,
          headline: pickLang<string>(r, "headline", language) ?? r.headline ?? "",
          topic: r.topic,
          created_at: r.created_at,
        })),
      );

      setIsLoading(false);
    })();

    return () => { cancelled = true; };
  }, [id]);

  return (
    <div style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: 40 }}>
      {/* Header */}
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
          style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
          aria-label="Back"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </button>
        <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textAlign: "center" }}>
          MEDIE
        </div>
        <div />
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: "#8E8E93", fontSize: 14 }}>{t.loading}</div>
      ) : !source ? (
        <div style={{ padding: 24, color: "#FFFFFF", fontSize: 16 }}>Medie ikke fundet.</div>
      ) : (
        <OutletContent
          source={source}
          stats={stats}
          topJournalists={topJournalists}
          recentArticles={recentArticles}
          lang={lang}
          t={translations[lang]}
        />
      )}
    </div>
  );
}

function OutletContent({
  source,
  stats,
  topJournalists,
  recentArticles,
  lang,
  t,
}: {
  source: SourceRow;
  stats: OutletStats | null;
  topJournalists: TopJournalist[];
  recentArticles: RecentArticle[];
  lang: string;
  t: T;
}) {
  const biasLabel =
    stats?.avgBiasScore == null ? null
    : stats.avgBiasScore <= -0.6 ? t.biasLeft
    : stats.avgBiasScore <= -0.2 ? t.biasCenterLeft
    : stats.avgBiasScore <= 0.1 ? t.biasCenter
    : stats.avgBiasScore <= 0.5 ? t.biasCenterRight
    : t.biasRight;

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${Math.max(m, 1)}${t.minAgo.split(" ")[0]}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t.hrAgo.split(" ")[0]}`;
    return `${Math.floor(h / 24)}${t.dayAgo.split(" ")[0]}`;
  }

  return (
    <>
      {/* Source header card */}
      <div
        style={{
          margin: "20px 16px 0",
          backgroundColor: "#1E3A5F",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 28, lineHeight: 1.1 }}>
            {source.name}
          </div>
          {source.logo_url && (
            <img
              src={source.logo_url}
              alt={source.name}
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: "contain", flexShrink: 0 }}
            />
          )}
        </div>
        {source.owner && (
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 6 }}>
            {source.owner}
          </div>
        )}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
          >
            {source.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            <ExternalLink size={11} />
          </a>
        )}
        {source.language && (
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                backgroundColor: "#2C2C2E",
                color: "#8E8E93",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              {source.language.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      {stats && (
        <div
          style={{
            margin: "12px 16px 0",
            backgroundColor: "#1C1C1E",
            border: "1px solid #2C2C2E",
            borderRadius: 12,
            padding: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <StatCell label={lang === "da" ? "ARTIKLER" : "ARTICLES"} value={String(stats.totalArticles)} />
          <StatCell
            label={lang === "da" ? "JOURNALISTER" : "JOURNALISTS"}
            value={String(source.journalist_count ?? topJournalists.length)}
          />
          {stats.firstDate && (
            <StatCell label={lang === "da" ? "FØRSTE ARTIKEL" : "FIRST ARTICLE"} value={formatDate(stats.firstDate)} />
          )}
          {stats.latestDate && (
            <StatCell label={lang === "da" ? "SENESTE ARTIKEL" : "LATEST ARTICLE"} value={timeAgo(stats.latestDate)} />
          )}
          {biasLabel && (
            <StatCell label={lang === "da" ? "GENNEMSNITLIG BIAS" : "AVG BIAS"} value={biasLabel} />
          )}
          {stats.avgLoadedLanguage != null && stats.avgLoadedLanguage > 0 && (
            <StatCell
              label={lang === "da" ? "LADEDE VENDINGER / ART." : "LOADED PHRASES / ART."}
              value={stats.avgLoadedLanguage.toFixed(1)}
            />
          )}
        </div>
      )}

      {/* Top journalists */}
      {topJournalists.length > 0 && (
        <>
          <div
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginTop: 20,
              padding: "0 16px",
            }}
          >
            {lang === "da" ? "JOURNALISTER" : "JOURNALISTS"}
          </div>
          <div
            style={{
              margin: "8px 16px 0",
              backgroundColor: "#1C1C1E",
              border: "1px solid #2C2C2E",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {topJournalists.map((j, i) => (
              <Link
                key={j.id}
                to="/journalist/$id"
                params={{ id: j.id }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderTop: i > 0 ? "1px solid #2C2C2E" : "none",
                  textDecoration: "none",
                }}
              >
                <span style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 600 }}>{j.name}</span>
                <span style={{ color: "#8E8E93", fontSize: 13 }}>
                  {j.count} {j.count === 1 ? t.article : t.articles}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Recent articles */}
      {recentArticles.length > 0 && (
        <>
          <div
            style={{
              color: "#8E8E93",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginTop: 20,
              padding: "0 16px",
            }}
          >
            {lang === "da" ? "SENESTE ARTIKLER" : "RECENT ARTICLES"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 16px 0" }}>
            {recentArticles.map((a) => (
              <Link
                key={a.id}
                to="/article/$id"
                params={{ id: a.id }}
                style={{
                  display: "block",
                  backgroundColor: "#1C1C1E",
                  border: "1px solid #2C2C2E",
                  borderRadius: 12,
                  padding: 14,
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  {a.topic && (
                    <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                      {a.topic.toUpperCase()}
                    </span>
                  )}
                  <span style={{ color: "#8E8E93", fontSize: 12, marginLeft: "auto" }}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>
                <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
                  {a.headline}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#8E8E93", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 700, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}
