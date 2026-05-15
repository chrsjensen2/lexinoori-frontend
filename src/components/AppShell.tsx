import { Outlet, useLocation } from "@tanstack/react-router";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isAtlas = pathname === "/atlas";
  const isArticle = pathname.startsWith("/article/");
  const isTimeline = pathname.startsWith("/timeline/");

  const showGlobalHeader = !isToday && !isAtlas && !isArticle && !isTimeline;
  const showBottomNav = !isArticle && !isTimeline;

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
      {showBottomNav && <BottomNav />}
    </div>
  );
}
