import { Outlet, useLocation } from "@tanstack/react-router";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isArticle = pathname.startsWith("/article/");

  const showGlobalHeader = !isToday && !isArticle;
  const showBottomNav = !isArticle;

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
