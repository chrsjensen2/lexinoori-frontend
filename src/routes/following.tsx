import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/following")({
  head: () => ({ meta: [{ title: "Following — lexinoori." }] }),
  component: () => (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93", fontSize: 15 }}>Following coming soon</p>
    </div>
  ),
});
