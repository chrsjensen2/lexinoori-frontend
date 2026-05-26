import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { SerifLogo } from "@/components/SerifLogo";
import { supabase } from "@/integrations/supabase/client";
import { getUserLanguage, pickLang, TRANSLATED_COLS } from "@/lib/articleLanguage";
import { TOPIC_COLORS, type Topic } from "@/components/feed/TopicPill";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Stories — lexinoori." },
      {
        name: "description",
        content: "Swipeable full-screen story cards from lexinoori.",
      },
    ],
  }),
  component: StoriesPage,
});

type Story = {
  id: string;
  topic: string;
  topicColor: string;
  gradientFrom: string;
  timestamp: string;
  headline: string;
  sources: string;
  bias: string;
  biasDotColor: string;
  variant?: "default" | "breaking";
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "JUST NOW";
  if (m < 60) return `${m} MIN AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
}

const STORY_DURATION_MS = 6000;


function StoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const movedRef = useRef(false);
  const END_INDEX = stories.length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const language = await getUserLanguage();
      const selectCols =
        "id, topic, source_count, created_at, is_breaking, diversity_score, " + TRANSLATED_COLS;
      const since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from("articles")
        .select(selectCols)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10);
      if (cancelled) return;
      const mapped: Story[] = ((data as any[]) || []).map((r) => {
        const topicKey = (r.topic || "").toLowerCase() as Topic;
        const color = (TOPIC_COLORS as any)[topicKey] || "#1A7A5E";
        const isBreaking = !!r.is_breaking;
        return {
          id: r.id,
          topic: (r.topic || "").toUpperCase(),
          topicColor: color,
          gradientFrom: isBreaking ? "#FF0000" : color,
          timestamp: timeAgo(r.created_at),
          headline: pickLang<string>(r, "headline", language) ?? "",
          sources: r.source_count ? `Merged · ${r.source_count} sources` : "Merged",
          bias: r.diversity_score ? `${Number(r.diversity_score).toFixed(1)} diversity` : "",
          biasDotColor: "#1A7A5E",
          variant: isBreaking ? "breaking" : "default",
        };
      });
      setStories(mapped);
    })();
    return () => { cancelled = true; };
  }, []);


  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, END_INDEX));
  }, [END_INDEX]);
  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const close = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  // Auto-advance
  useEffect(() => {
    if (paused || index >= END_INDEX) return;
    const t = window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, END_INDEX));
    }, STORY_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [index, paused]);

  const onPointerDown = (e: React.PointerEvent) => {
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    movedRef.current = false;
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) movedRef.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = startRef.current;
    startRef.current = null;
    setPaused(false);
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Swipe down → close
    if (dy > 80 && absY > absX) {
      close();
      return;
    }
    // Horizontal swipe
    if (absX > 50 && absX > absY) {
      if (dx < 0) goNext();
      else goPrev();
      return;
    }

    // Tap: left half = previous, right half = next
    if (!movedRef.current) {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      if (relX < rect.width / 2) goPrev();
      else goNext();
    }
  };

  // End-state card
  if (index >= END_INDEX) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#111111",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top) + 16px)",
            right: 16,
            color: "#FFFFFF",
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center" }}>
          <SerifLogo height={32} color="#1A7A5E" />
        </div>
        <h2
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 22,
            marginTop: 24,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          You're all caught up.
        </h2>
        <button
          onClick={close}
          style={{
            marginTop: 32,
            backgroundColor: "#1A7A5E",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 16,
            height: 56,
            borderRadius: 24,
            border: "none",
            width: "calc(100% - 48px)",
            maxWidth: 342,
            cursor: "pointer",
          }}
        >
          Back to Today
        </button>
      </div>
    );
  }

  const story = stories[index];
  if (!story) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#111111", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", color: "#8E8E93", fontSize: 14 }}>
        Loading…
      </div>
    );
  }
  const isBreaking = story.variant === "breaking";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        startRef.current = null;
        setPaused(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#111111",
        overflow: "hidden",
        touchAction: "pan-y",
        userSelect: "none",
        zIndex: 50,
      }}
    >
      <style>{`
        @keyframes lex-progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isBreaking
            ? "#FF0000"
            : `linear-gradient(to bottom, ${story.gradientFrom} 0%, #111111 100%)`,
        }}
      />

      {/* Gradient overlay for readability */}
      {!isBreaking && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(17,17,17,0) 0%, rgba(17,17,17,0) 33%, rgba(17,17,17,0.8) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Progress indicators */}
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 12px)",
          left: 16,
          right: 16,
          display: "flex",
          gap: 8,
          zIndex: 2,
        }}
      >
        {stories.map((_s: Story, i: number) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              key={`${i}-${index}-${paused ? "p" : "r"}`}
              style={{
                height: "100%",
                backgroundColor: "#1A7A5E",
                width: i < index ? "100%" : i === index ? "0%" : "0%",
                animation:
                  i === index
                    ? `lex-progress-fill ${STORY_DURATION_MS}ms linear forwards`
                    : undefined,
                animationPlayState: paused && i === index ? "paused" : "running",
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        aria-label="Close stories"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: 16,
          color: "#FFFFFF",
          background: "transparent",
          border: "none",
          padding: 4,
          zIndex: 3,
          cursor: "pointer",
        }}
      >
        <X size={20} />
      </button>

      {/* Top-left header */}
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 12px + 4px + 16px)",
          left: 16,
          right: 56,
          zIndex: 2,
        }}
      >
        <SerifLogo height={28} color="#FFFFFF" />
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: isBreaking
                ? "rgba(255,255,255,0.20)"
                : `${story.topicColor}1F`,
              border: isBreaking ? "none" : `1px solid ${story.topicColor}`,
              color: isBreaking ? "#FFFFFF" : story.topicColor,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              padding: "5px 10px",
              borderRadius: 20,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {isBreaking && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: "#FFFFFF",
                  display: "inline-block",
                  animation: "lex-pulse 1.4s ease-in-out infinite",
                }}
              />
            )}
            {story.topic}
          </span>

        </div>
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: "calc(env(safe-area-inset-bottom) + 24px)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {story.timestamp}
        </div>
        <h2
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: isBreaking ? 32 : 28,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginTop: 8,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {story.headline}
        </h2>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            marginTop: 8,
          }}
        >
          {story.sources}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: story.biasDotColor,
              display: "inline-block",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            {story.bias}
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/article/$id", params: { id: story.id } });
            }}
            style={{
              backgroundColor: "#FFFFFF",
              color: "#111111",
              fontWeight: 700,
              fontSize: 14,
              height: 32,
              padding: "0 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              width: "fit-content",
            }}
          >
            Read full article →
          </button>
        </div>
      </div>
    </div>
  );
}
