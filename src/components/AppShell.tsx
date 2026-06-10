import { Outlet, useLocation } from "@tanstack/react-router";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";
import { SplashScreen } from "./SplashScreen";
import { SignInPrompt } from "./SignInPrompt";

export function AppShell() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isAtlas = pathname === "/atlas";
  const isStories = pathname === "/stories" || pathname.startsWith("/stories/");
  const isArticle = pathname.startsWith("/article/");
  const isTimeline = pathname.startsWith("/timeline/");
  const isJournalist = pathname.startsWith("/journalist/");
  const isOutlet = pathname.startsWith("/outlet/");
  const isProfile = pathname === "/profile";
  const isAuth = pathname.startsWith("/auth");
  const isSearch = pathname === "/search";
  const isDigest = pathname === "/digest";

  const isSaved = pathname === "/saved";
  const isFollowing = pathname === "/following";

  const showGlobalHeader =
    !isToday && !isAtlas && !isStories && !isArticle && !isTimeline && !isJournalist && !isOutlet && !isProfile && !isAuth && !isSearch && !isDigest && !isSaved && !isFollowing;
  const showBottomNav = !isArticle && !isTimeline && !isAuth && !isStories && !isSearch;

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
      <SplashScreen />
      <SignInPrompt />
    </div>
  );
}
