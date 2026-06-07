import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, User as UserIcon, ChevronRight } from "lucide-react";
import { SerifLogo } from "@/components/SerifLogo";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, setLang, getLang, type Lang } from "@/lib/lang";
import { translations, type T } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Settings — lexinoori." }] }),
  component: ProfileGate,
});

function ProfileGate() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (isLoggedIn === null) return <div style={{ minHeight: "100vh", background: "#111111" }} />;
  return isLoggedIn ? <SettingsPage /> : <PreAuthScreen />;
}

function PreAuthScreen() {
  const lang = useLanguage();
  const t = translations[lang];
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 342 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SerifLogo height={32} color="#1A7A5E" />
        </div>
        <div style={{ color: "#8E8E93", fontSize: 14, textAlign: "center", marginTop: 8 }}>
          {t.personalProfile}
        </div>

        <div style={{ height: 48 }} />

        <Link
          to="/auth/login"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 56,
            background: "#1A7A5E",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
            borderRadius: 24,
            textDecoration: "none",
          }}
        >
          {t.signInButton}
        </Link>

        <div style={{ height: 12 }} />

        <Link
          to="/auth/signup"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 56,
            background: "transparent",
            border: "1px solid #2C2C2E",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
            borderRadius: 24,
            textDecoration: "none",
          }}
        >
          {t.createAccountButton}
        </Link>

        <div style={{ height: 32 }} />

        <div
          style={{
            color: "#8E8E93",
            fontSize: 13,
            textAlign: "center",
            padding: "0 32px",
            lineHeight: 1.4,
          }}
        >
          {t.guestLimit}
        </div>
      </div>
    </div>
  );
}

function buildReadingStops(t: T) {
  return [
    { key: "kids", label: t.readLevelKidsLabel, title: t.readLevelKidsTitle, desc: t.readLevelKidsDesc },
    { key: "young", label: t.readLevelYoungLabel, title: t.readLevelYoungTitle, desc: t.readLevelYoungDesc },
    { key: "adult", label: t.readLevelAdultLabel, title: t.readLevelAdultTitle, desc: t.readLevelAdultDesc },
    { key: "expert", label: t.readLevelExpertLabel, title: t.readLevelExpertTitle, desc: t.readLevelExpertDesc },
  ] as const;
}

function buildZoomStops(t: T) {
  return [t.zoomWorld, t.zoomContinent, t.zoomCountry, t.zoomLocal] as const;
}

function buildTopics(t: T) {
  return [
    { key: "breaking", label: t.topicBreakingNews, color: "#FF0000" },
    { key: "politics", label: t.topicPoliticsNotify, color: "#4D6EFF" },
    { key: "climate", label: t.topicClimateNotify, color: "#00C864" },
    { key: "economics", label: t.topicEconomicsNotify, color: "#FFD000" },
    { key: "technology", label: t.topicTechNotify, color: "#00E5CC" },
    { key: "health", label: t.topicHealthNotify, color: "#00BFFF" },
    { key: "culture", label: t.topicCultureNotify, color: "#CC44FF" },
    { key: "sport", label: t.topicSportNotify, color: "#FF4500" },
  ] as const;
}

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
        <div style={{ position: "absolute", top: 5, left: 0, right: 0, height: 4, background: "#2C2C2E", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 5, left: 0, width: `${pct}%`, height: 4, background: "#1A7A5E", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 0, left: `calc(${pct}% - 7px)`, width: 14, height: 14, background: "#1A7A5E", borderRadius: "50%" }} />
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

const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "da", label: "Dansk" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
];

function LanguagePicker({
  title,
  value,
  options,
  onSelect,
  onClose,
}: {
  title: string;
  value: string;
  options: { code: string; label: string }[];
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{ background: "#1C1C1E", borderRadius: "16px 16px 0 0", padding: "20px 0 32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: 700,
            padding: "0 20px 16px",
            borderBottom: "1px solid #2C2C2E",
          }}
        >
          {title}
        </div>
        {options.map((opt) => (
          <button
            key={opt.code}
            onClick={() => onSelect(opt.code)}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #2C2C2E",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "#FFFFFF", fontSize: 16 }}>{opt.label}</span>
            {value === opt.code && (
              <span style={{ color: "#1A7A5E", fontSize: 16, fontWeight: 700 }}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const lang = useLanguage();
  const t = translations[lang];
  const READING_STOPS = buildReadingStops(t);
  const ZOOM_STOPS = buildZoomStops(t);
  const TOPICS = buildTopics(t);

  const [readingIdx, setReadingIdx] = useState(2);
  const [zoomIdx, setZoomIdx] = useState(2);
  const [user, setUser] = useState<{ email: string | null; createdAt: string | null }>({
    email: null,
    createdAt: null,
  });
  const [primaryLanguage, setPrimaryLanguage] = useState<string>(() => getLang());
  const [secondaryLanguage, setSecondaryLanguage] = useState("en");
  const [languagePicker, setLanguagePicker] = useState<"primary" | "secondary" | null>(null);
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? null, createdAt: data.user.created_at ?? null });
        supabase
          .from("profiles")
          .select("primary_language")
          .eq("id", data.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile?.primary_language) {
              setPrimaryLanguage(profile.primary_language);
              if (profile.primary_language === "en" || profile.primary_language === "da") {
                setLang(profile.primary_language as Lang);
              }
            }
          });
      }
    });
  }, []);

  const saveLanguage = async (field: "primary_language" | "secondary_language", code: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      // Guest: only update local store
      if (field === "primary_language" && (code === "en" || code === "da")) {
        setLang(code as Lang);
        setPrimaryLanguage(code);
        window.dispatchEvent(new CustomEvent("lex:language-changed", { detail: { code } }));
      }
      setLanguagePicker(null);
      return;
    }
    const payload: { id: string; primary_language?: string; secondary_language?: string } = {
      id: userData.user.id,
      [field]: code,
    };
    const { error } = await supabase
      .from("profiles")
      .upsert(payload as never, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error) {
      if (field === "primary_language") {
        setPrimaryLanguage(code);
        if (code === "en" || code === "da") setLang(code as Lang);
        window.dispatchEvent(new CustomEvent("lex:language-changed", { detail: { code } }));
      } else {
        setSecondaryLanguage(code);
      }
    }
    setLanguagePicker(null);
  };

  const langLabel = (code: string) => LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? code;
  const current = READING_STOPS[readingIdx];
  const memberSince = user.createdAt
    ? `${t.memberSince} ${new Date(user.createdAt).toLocaleDateString(lang === "da" ? "da-DK" : "en-US", { month: "long", year: "numeric" })}`
    : "";

  return (
    <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 0" }}>
        <h1 style={{ color: "#FFFFFF", fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          {t.profileHeading}
        </h1>
        {user.email && (
          <div style={{ color: "#FFFFFF", fontSize: 15, marginTop: 12 }}>{user.email}</div>
        )}
        {memberSince && (
          <div style={{ color: "#8E8E93", fontSize: 13, marginTop: 4 }}>{memberSince}</div>
        )}
      </div>

      {/* Account */}
      <SectionHeader top={24}>{t.accountSection}</SectionHeader>
      <div style={{ background: "#1C1C1E" }}>
        <AccountRow to="/saved" Icon={Bookmark} label={t.savedArticlesRow} />
        <AccountRow to="/following" Icon={UserIcon} label={t.followingRow} />
        <button
          onClick={async () => { await supabase.auth.signOut(); }}
          style={{
            width: "100%",
            height: 44,
            padding: "0 16px",
            borderTop: "1px solid #2C2C2E",
            background: "transparent",
            border: "none",
            borderTopWidth: 1,
            borderTopStyle: "solid",
            borderTopColor: "#2C2C2E",
            color: "#FF3B30",
            fontSize: 15,
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {t.signOut}
        </button>
      </div>

      {/* Reading level card */}
      <SectionHeader top={24}>{t.readingLevelSection}</SectionHeader>
      <div
        style={{
          margin: "0 16px",
          background: "#1C1C1E",
          border: "1px solid #2C2C2E",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginTop: 4 }}>
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
      <SectionHeader>{t.regionSection}</SectionHeader>
      <div style={{ background: "#1C1C1E" }}>
        <button
          onClick={() => setLanguagePicker("primary")}
          style={{
            width: "100%",
            height: 56,
            padding: "0 16px",
            borderBottom: "1px solid #2C2C2E",
            background: "transparent",
            border: "none",
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: "#2C2C2E",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <span style={{ color: "#FFFFFF", fontSize: 15 }}>{t.readingLanguage}</span>
          <span style={{ color: "#8E8E93", fontSize: 15 }}>{langLabel(primaryLanguage)} ›</span>
        </button>

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
            <div style={{ color: "#FFFFFF", fontSize: 15 }}>{t.geographicZoom}</div>
            <div style={{ color: "#8E8E93", fontSize: 13, marginTop: 2 }}>{t.geographicZoomDesc}</div>
          </div>
          <div style={{ color: "#1A7A5E", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>
            {ZOOM_STOPS[zoomIdx]}
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        <StopSlider stops={ZOOM_STOPS} activeIndex={zoomIdx} onChange={setZoomIdx} />
      </div>

      {/* Breaking news */}
      <SectionHeader>{t.breakingSection}</SectionHeader>
      <div style={{ background: "#1C1C1E" }}>
        {TOPICS.map((topic) => (
          <div
            key={topic.key}
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
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: topic.color, flexShrink: 0 }} />
              <span style={{ color: "#FFFFFF", fontSize: 15 }}>{topic.label}</span>
            </div>
            <Toggle
              on={topics[topic.key]}
              onChange={(v) => setTopics((p) => ({ ...p, [topic.key]: v }))}
            />
          </div>
        ))}
      </div>

      {languagePicker && (
        <LanguagePicker
          title={languagePicker === "primary" ? t.languagePickerTitle : t.secondaryLanguageTitle}
          value={languagePicker === "primary" ? primaryLanguage : secondaryLanguage}
          options={LANGUAGE_OPTIONS}
          onSelect={(code) =>
            saveLanguage(
              languagePicker === "primary" ? "primary_language" : "secondary_language",
              code
            )
          }
          onClose={() => setLanguagePicker(null)}
        />
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

function AccountRow({
  to,
  Icon,
  label,
}: {
  to: string;
  Icon: typeof Bookmark;
  label: string;
}) {
  return (
    <Link
      to={to}
      style={{
        height: 44,
        padding: "0 16px",
        borderBottom: "1px solid #2C2C2E",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        textDecoration: "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Icon size={18} color="#8E8E93" />
        <span style={{ color: "#FFFFFF", fontSize: 15 }}>{label}</span>
      </span>
      <ChevronRight size={18} color="#8E8E93" />
    </Link>
  );
}
