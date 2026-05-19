import { Outlet, useLocation, Link } from "@tanstack/react-router";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isAtlas = pathname === "/atlas";
  const isArticle = pathname.startsWith("/article/");
  const isTimeline = pathname.startsWith("/timeline/");
  const isJournalist = pathname.startsWith("/journalist/");
  const isProfile = pathname === "/profile";
  const isAuth = pathname.startsWith("/auth");

  const showGlobalHeader =
    !isToday && !isAtlas && !isArticle && !isTimeline && !isJournalist && !isProfile && !isAuth;
  const showBottomNav = !isArticle && !isTimeline && !isAuth;
  const showSignInEntry = !isAuth;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showGlobalHeader && <GlobalHeader />}
      <main
        className="mx-auto w-full"
        style={{
          maxWidth: 390,
          paddingBottom: showBottomNav
            ? "calc(64px + env(safe-area-inset-bottom) + 16px)"
            : 0,
        }}
      >
        <Outlet />
      </main>
      {showSignInEntry && (
        <Link
          to="/auth/login"
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top) + 12px)",
            right: 16,
            zIndex: 50,
            background: "#1A7A5E",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 14px",
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      )}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
