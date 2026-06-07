import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export const Route = createFileRoute("/following")({
  head: () => ({ meta: [{ title: "Following — lexinoori." }] }),
  component: FollowingPage,
});

function FollowingPage() {
  const lang = useLanguage();
  const t = translations[lang];
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <p style={{ color: "#8E8E93", fontSize: 15 }}>{t.followingComingSoon}</p>
    </div>
  );
}
