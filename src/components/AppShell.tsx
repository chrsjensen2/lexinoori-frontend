import { Outlet, useLocation } from "@tanstack/react-router";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isAtlas = pathname === "/atlas";
  const isStories = pathname === "/stories" || pathname.startsWith("/stories/");
  const isArticle = pathname.startsWith("/article/");
  const isTimeline = pathname.startsWith("/timeline/");
  const isJournalist = pathname.startsWith("/journalist/");
  const isProfile = pathname === "/profile";
  const isAuth = pathname.startsWith("/auth");

  const showGlobalHeader =
    !isToday && !isAtlas && !isStories && !isArticle && !isTimeline && !isJournalist && !isProfile && !isAuth;
  const showBottomNav = !isArticle && !isTimeline && !isAuth && !isStories;

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
