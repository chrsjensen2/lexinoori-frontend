import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — lexinoori." }] }),
  component: () => (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93" }}>Profile</p>
    </div>
  ),
});
