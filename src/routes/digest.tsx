import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/digest")({
  head: () => ({ meta: [{ title: "Digest — lexinoori." }] }),
  component: () => (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93" }}>Digest</p>
    </div>
  ),
});
