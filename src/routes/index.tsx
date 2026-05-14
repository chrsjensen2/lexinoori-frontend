import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — lexinoori." },
      { name: "description", content: "Your daily news, distilled." },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93", fontSize: 16 }}>Today's feed loads here</p>
    </div>
  );
}
