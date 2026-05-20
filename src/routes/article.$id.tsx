import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Share2, ChevronRight } from "lucide-react";
import { TopicPill, TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/article/$id")({
  head: () => ({ meta: [{ title: "Article — lexinoori." }] }),
  component: ArticleView,
});

const READ_LENGTHS = ["Bullets", "Brief", "Standard", "Deep Dive"] as const;
type ReadLength = (typeof READ_LENGTHS)[number];

const FONT_SIZES = { Small: 14, Medium: 16, Large: 19 } as const;
type FontSizeKey = keyof typeof FONT_SIZES;

type ArticleRow = {
  id: string;
  headline: string;
  body_standard: string | null;
  topic: string | null;
  read_time_minutes: number | null;
  source_count: number | null;
  bias_score: number | null;
  diversity_score: number | null;
  whats_missing: string | null;
};

function toTopic(t: string | null | undefined): Topic {
  const valid: Topic[] = ["politics", "climate", "economics", "sport", "technology", "health", "culture", "local", "breaking"];
  const n = (t ?? "").toLowerCase();
  return (valid.includes(n as Topic) ? (n as Topic) : "politics");
}

function ArticleView() {
  const router = useRouter();
  const { id } = Route.useParams();
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [readLength, setReadLength] = useState<ReadLength>("Standard");
  const [sheet, setSheet] = useState<null | "aa">(null);
  const [savedTop, setSavedTop] = useState(false);
  const [sharedTop, setSharedTop] = useState(false);
  const [fontSize, setFontSize] = useState<FontSizeKey>("Medium");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("articles")
        .select("id, headline, body_standard, topic, read_time_minutes, source_count, bias_score, diversity_score, whats_missing")
        .eq("id", id)
        .maybeSingle();
      console.log("Article fetch:", { data, error });
      if (cancelled) return;
      if (!error && data) setArticle(data as ArticleRow);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const TOPIC = toTopic(article?.topic);
  const topicColor = TOPIC_COLORS[TOPIC];
  const HEADLINE = article?.headline ?? (loading ? "Loading…" : "Article not found");
  const sourceCount = article?.source_count ?? 0;
  const readMinutes = article?.read_time_minutes ?? 0;
  const biasScore = Number(article?.bias_score ?? 0);
  const diversityScore = Number(article?.diversity_score ?? 0);
  const biasPct = Math.max(0, Math.min(100, ((biasScore + 1) / 2) * 100));
  const diversityPct = Math.max(0, Math.min(100, (diversityScore / 10) * 100));
  const body = article?.body_standard ?? "";


  return (
    <div style={{ paddingBottom: 32 }}>
      {/* HERO */}
      <div style={{ position: "relative", width: "100%", height: 240 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${topicColor} 0%, #111111 100%)`,
          }}
        />
        {/* Bottom darken overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 120,
            background: "linear-gradient(180deg, rgba(17,17,17,0) 0%, #111111 100%)",
          }}
        />

        {/* Top floating controls */}
        <div
          className="flex items-start justify-between"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "16px 16px 0",
            paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          }}
        >
          <button
            onClick={() => router.history.back()}
            aria-label="Back"
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "rgba(17,17,17,0.5)",
              color: "#FFFFFF",
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Right cluster: Aa + ... */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Reading options"
              onClick={() => setSheet("aa")}
              className="flex items-center justify-center"
              style={{
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                backgroundColor: "rgba(17,17,17,0.5)",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Aa
            </button>
          </div>

        </div>

        {/* Bottom overlay content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 16px 16px",
          }}
        >
          <div style={{ display: "inline-block", marginBottom: 8 }}>
            <TopicPill topic={TOPIC} />
          </div>
          <h1
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {HEADLINE}
          </h1>
        </div>
      </div>

      {/* METADATA ROW */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 16, marginTop: 16 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: "#2C2C2E",
              color: "#8E8E93",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            R
          </span>
          <span style={{ color: "#FFFFFF", fontSize: 14 }}>Merged · {sourceCount} sources</span>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <button
            aria-label={savedTop ? "Unsave" : "Save"}
            onClick={() => setSavedTop((s) => !s)}
            style={{ color: savedTop ? "#FFFFFF" : "#8E8E93" }}
          >
            <Bookmark size={24} fill={savedTop ? "#FFFFFF" : "none"} />
          </button>
          <button
            aria-label="Share"
            onClick={() => setSharedTop((s) => !s)}
            style={{ color: sharedTop ? "#1A7A5E" : "#8E8E93" }}
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* WHAT'S NEW */}
      <section
        style={{
          margin: "12px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "rgba(26,122,94,0.08)",
          border: "1px solid rgba(26,122,94,0.25)",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ color: "#1A7A5E", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            WHAT'S NEW
          </span>
          <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            SINCE YOU LAST READ · 3H AGO
          </span>
        </div>
        <p style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 1.5 }}>
          Council legal service has now formally objected to the 72-hour consultation window. Two
          new sources added.
        </p>
      </section>

      {/* BEFORE YOU READ */}
      <section
        style={{
          margin: "12px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
        }}
      >
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          BEFORE YOU READ
        </div>

        <div className="flex" style={{ gap: 16, marginBottom: 16 }}>
          <div className="flex-1">
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              SOURCES
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {sourceCount} outlets
            </div>
          </div>
          <div className="flex-1">
            <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              READ LENGTH
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {readMinutes} min
            </div>

          </div>
        </div>

        {/* Pool lean slider */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              POOL LEAN
            </span>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              CENTRE-LEFT
            </span>
          </div>
          <div style={{ position: "relative", width: "100%", height: 14 }}>
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: "#2C2C2E",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 0,
                width: `${biasPct}%`,
                height: 4,
                backgroundColor: "#1A7A5E",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `calc(${biasPct}% - 7px)`,
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: "#1A7A5E",
              }}
            />

          </div>
        </div>

        {/* Source diversity */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
              SOURCE DIVERSITY
            </span>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: "#00C864", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#00C864",
                  display: "inline-block",
                }}
              />
              STRONG
            </span>
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            7.4 / 10
          </div>
          <div style={{ position: "relative", height: 4, backgroundColor: "#2C2C2E", borderRadius: 999 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "74%",
                backgroundColor: "#00C864",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </section>

      {/* READ LENGTH SELECTOR */}
      <div className="flex" style={{ gap: 8, margin: "12px 16px 0" }}>
        {READ_LENGTHS.map((rl) => {
          const active = rl === readLength;
          return (
            <button
              key={rl}
              onClick={() => setReadLength(rl)}
              className="flex-1"
              style={{
                padding: "10px 12px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: active ? "#FFFFFF" : "#1C1C1E",
                color: active ? "#111111" : "rgba(255,255,255,0.5)",
                border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E",
                whiteSpace: "nowrap",
              }}
            >
              {rl}
            </button>
          );
        })}
      </div>

      {/* ARTICLE BODY */}
      <article
        style={{
          padding: "0 16px",
          marginTop: 20,
          color: "#FFFFFF",
          fontSize: FONT_SIZES[fontSize],
          lineHeight: 1.65,
        }}
      >
        {readLength === "Bullets" && (
          <ul style={{ paddingLeft: 20, listStyle: "disc" }}>
            {[
              "EU negotiators reached a provisional agreement ending months of delay",
              "Cloud providers serving EU public sector must keep operational control within member states",
              "Council legal service formally objected to the 72-hour consultation window",
              "Two member states say the process violated procedural treaty obligations",
              "Industry groups have asked for a longer transition window",
              "Implementing acts will follow within twelve months",
            ].map((item) => (
              <li key={item} style={{ marginBottom: 12 }}>
                {item}
              </li>
            ))}
          </ul>
        )}

        {readLength === "Brief" && (
          <p style={{ marginBottom: 20 }}>
            Brussels negotiators reached a provisional agreement on the EU digital sovereignty
            package, ending months of procedural delay. The text requires cloud providers serving
            EU public sector clients to keep operational control within member states. The
            Council's own legal service formally objected to the 72-hour consultation window, with
            two member states claiming the process violated treaty obligations. Industry groups
            have called for a longer transition window. Implementing acts will follow within twelve
            months.
          </p>
        )}

        {(readLength === "Standard" || readLength === "Deep Dive") && (
          <>
            <p style={{ marginBottom: 20 }}>
              Brussels negotiators reached a provisional agreement late on Tuesday, ending months of
              procedural delay over the bloc's flagship digital sovereignty package.{" "}
              <InlineTag kind="fact">
                The text now requires cloud providers serving EU public sector clients to keep
                operational control within member states.
              </InlineTag>{" "}
              Implementing acts will follow within twelve months.
            </p>
            <p style={{ marginBottom: 20 }}>
              Negotiators framed the deal as a turning point for European technological autonomy.{" "}
              <InlineTag kind="opinion">
                Without it, the continent risks ceding the next decade of infrastructure decisions to
                firms outside its legal reach.
              </InlineTag>{" "}
              Industry groups have asked for a longer transition window.
            </p>
            <p style={{ marginBottom: 20 }}>
              Some delegations argued the Council legal service had not been given enough time to weigh
              in.{" "}
              <InlineTag kind="contested">
                Two member states say the 72-hour consultation window violated procedural treaty
                obligations.
              </InlineTag>{" "}
              A Commission spokesperson rejected that reading.
            </p>
          </>
        )}

        {readLength === "Deep Dive" && (
          <>
            <p style={{ marginBottom: 20 }}>
              The sovereignty package has been in negotiation for nearly three years, delayed
              repeatedly by disagreements between member states over the scope of the operational
              control requirement. France and Germany pushed for the strongest possible language,
              while smaller member states with less developed domestic cloud infrastructure argued
              for longer transition periods.
            </p>
            <p style={{ marginBottom: 20 }}>
              The Council legal service objection is significant because it creates a potential
              legal challenge to the entire text. Constitutional lawyers consulted by Le Monde
              suggest the objection could delay implementation by six to eighteen months if any
              member state chooses to pursue it through the European Court of Justice. A Commission
              spokesperson rejected that reading, calling the legal service objection a routine part
              of the legislative process.
            </p>
          </>
        )}
      </article>

      {/* AFTER YOU READ */}
      <section
        style={{
          margin: "24px 16px 0",
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#1C1C1E",
          border: "1px solid #2C2C2E",
        }}
      >
        <div style={{ color: "#8E8E93", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
          AFTER YOU READ
        </div>

        {/* Loaded language */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 12,
            marginBottom: 8,
          }}
        >
          LOADED LANGUAGE
        </div>
        <LoadedRow original="fast-tracks" neutral="accelerates" />
        <LoadedRow original="sovereignty bill" neutral="digital regulation bill" last />

        {/* What's missing */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          WHAT'S MISSING
        </div>
        <div
          style={{
            borderLeft: "2px solid #E8873A",
            paddingLeft: 16,
            color: "#FFFFFF",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          No sources cover the economic impact on smaller EU member states or SMEs.
        </div>

        {/* Sources */}
        <div
          style={{
            color: "#8E8E93",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          SOURCES · 9 OUTLETS
        </div>
        <SourceRow initial="R" name="Reuters" journalist="Jane Morrison" bias="#00C864" diversity="9.2" />
        <SourceRow initial="A" name="AP" journalist="David Chen" bias="#00C864" diversity="8.8" />
        <SourceRow initial="B" name="BBC" journalist="Sarah Williams" bias="#00C864" diversity="8.4" />
        <SourceRow initial="D" name="DR" bias="#FFD000" diversity="7.1" />
        <SourceRow initial="T" name="TV2" bias="#FFD000" diversity="6.4" wireCopy last />

        {/* Bottom action */}
        <Link
          to="/timeline/$id"
          params={{ id: "1" }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            color: "#1A7A5E",
            fontSize: 14,
            marginTop: 20,
          }}
        >
          View story timeline →
        </Link>
      </section>

      {/* Share button */}
      <button
        style={{
          display: "block",
          margin: "20px 16px 0",
          width: "calc(100% - 32px)",
          height: 52,
          border: "1px solid #2C2C2E",
          borderRadius: 12,
          background: "transparent",
          appearance: "none",
          WebkitAppearance: "none",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Share
      </button>

      {/* Bottom sheets */}
      {sheet !== null && (
        <div
          onClick={() => setSheet(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              backgroundColor: "#1C1C1E",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
            }}
          >
            {sheet === "aa" && (
              <>
                <div
                  style={{
                    color: "#8E8E93",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginBottom: 16,
                  }}
                >
                  TEXT SIZE
                </div>
                <div className="flex" style={{ gap: 8 }}>
                  {(Object.keys(FONT_SIZES) as FontSizeKey[]).map((key) => {
                    const active = key === fontSize;
                    return (
                      <button
                        key={key}
                        onClick={() => setFontSize(key)}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 700,
                          backgroundColor: active ? "#FFFFFF" : "#1C1C1E",
                          color: active ? "#111111" : "rgba(255,255,255,0.5)",
                          border: active ? "1px solid #FFFFFF" : "1px solid #2C2C2E",
                        }}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



function InlineTag({
  kind,
  children,
}: {
  kind: "fact" | "opinion" | "contested";
  children: React.ReactNode;
}) {
  const config = {
    fact: { bg: "rgba(26,122,94,0.08)", pillBg: "#1A7A5E", label: "FACT" },
    opinion: { bg: "rgba(232,135,58,0.08)", pillBg: "#E8873A", label: "OPINION" },
    contested: { bg: "rgba(255,69,0,0.08)", pillBg: "#FF4500", label: "CONTESTED" },
  }[kind];

  return (
    <span
      style={{
        backgroundColor: config.bg,
        padding: "0 4px",
        borderRadius: 4,
      }}
    >
      {children}
      <span
        style={{
          backgroundColor: config.pillBg,
          color: "#FFFFFF",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "2px 4px",
          borderRadius: 4,
          marginLeft: 4,
          verticalAlign: "middle",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    </span>
  );
}

function LoadedRow({
  original,
  neutral,
  last,
}: {
  original: string;
  neutral: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid #2C2C2E",
        fontSize: 14,
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          textDecoration: "underline",
          textDecorationColor: "#FF4500",
          textDecorationThickness: 2,
          textUnderlineOffset: 3,
        }}
      >
        {original}
      </span>
      <span style={{ color: "#8E8E93" }}>→</span>
      <span style={{ color: "#1A7A5E" }}>{neutral}</span>
    </div>
  );
}

function SourceRow({
  initial,
  name,
  journalist,
  bias,
  diversity,
  wireCopy = false,
  last = false,
}: {
  initial: string;
  name: string;
  journalist?: string;
  bias: string;
  diversity: string;
  wireCopy?: boolean;
  last?: boolean;
}) {
  const tappable = Boolean(journalist);
  const rowStyle = {
    height: 44,
    gap: 12,
    borderBottom: last ? "none" : "1px solid #2C2C2E",
    textDecoration: "none",
  } as const;

  const inner = (
    <>
      <span
        className="flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor: "#2C2C2E",
          color: "#8E8E93",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {initial}
      </span>
      <span style={{ color: "#FFFFFF", fontSize: 14, flex: 1 }}>
        {journalist ? `${name} · ${journalist}` : name}
      </span>
      {wireCopy && (
        <span
          style={{
            backgroundColor: "#E8873A",
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "3px 6px",
            borderRadius: 6,
          }}
        >
          WIRE COPY
        </span>
      )}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: bias,
          display: "inline-block",
        }}
      />
      <span
        style={{
          color: "#8E8E93",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        DIV {diversity}
      </span>
      {tappable && <ChevronRight size={12} style={{ color: "#8E8E93" }} />}
    </>
  );

  if (tappable) {
    return (
      <Link to="/journalist/$id" params={{ id: "1" }} className="flex items-center" style={rowStyle}>
        {inner}
      </Link>
    );
  }
  return (
    <div className="flex items-center" style={rowStyle}>
      {inner}
    </div>
  );
}
