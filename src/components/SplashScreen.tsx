import { useEffect, useState } from "react";
import { SerifLogo } from "./SerifLogo";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem("lex_splash_shown") === "1";
    } catch {
      // sessionStorage can throw on iOS Safari in private mode or when
      // storage is blocked. Treat as "not shown yet" and continue.
    }
    if (alreadyShown) {
      setShow(false);
      return;
    }
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const hideTimer = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem("lex_splash_shown", "1");
      } catch {
        // Ignore storage write failures — splash hiding must still proceed.
      }
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
        Every angle. One story.
      </p>
    </div>
  );
}
