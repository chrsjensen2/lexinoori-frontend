import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stories")({
  head: () => ({ meta: [{ title: "Stories — lexinoori." }] }),
  component: () => (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93", fontSize: 15 }}>Stories coming soon</p>
    </div>
  ),
});
