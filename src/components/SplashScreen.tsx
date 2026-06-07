import { useEffect, useState } from "react";
import { SerifLogo } from "./SerifLogo";
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const lang = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("lex_splash_shown") === "1") {
      setShow(false);
      return;
    }
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const hideTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("lex_splash_shown", "1");
    }, 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#111111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: "opacity 400ms ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <SerifLogo height={48} />
      <p
        style={{
          color: "#8E8E93",
          fontSize: 14,
          fontWeight: 400,
          marginTop: 16,
          fontFamily: "Heebo, sans-serif",
        }}
      >
        {t.tagline}
      </p>
    </div>
  );
}
