import { Outlet } from "@tanstack/react-router";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalHeader />
      <main
        className="mx-auto w-full"
        style={{
          maxWidth: 390,
          paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 16px)",
        }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
