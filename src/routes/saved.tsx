import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved — lexinoori." }] }),
  component: () => (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93" }}>Saved</p>
    </div>
  ),
});
