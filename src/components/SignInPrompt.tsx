import { Link } from "@tanstack/react-router";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export function SignInPrompt() {
  const { promptOpen, closePrompt } = useSavedArticles();
  const lang = useLanguage();
  const t = translations[lang];
  if (!promptOpen) return null;
  return (
    <div
      onClick={closePrompt}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 390,
          background: "#1C1C1E",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: "24px 24px calc(24px + env(safe-area-inset-bottom))",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 700 }}>
          {t.signInToSave}
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Link
            to="/auth/login"
            onClick={closePrompt}
            style={{
              color: "#1A7A5E",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              padding: "12px 0",
            }}
          >
            {t.signInLink}
          </Link>
          <button
            onClick={closePrompt}
            style={{
              color: "#8E8E93",
              background: "transparent",
              border: "none",
              fontSize: 14,
              padding: "8px 0",
            }}
          >
            {t.cancelButton}
          </button>
        </div>
      </div>
    </div>
  );
}
