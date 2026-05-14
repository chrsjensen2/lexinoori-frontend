import { Link, useLocation } from "@tanstack/react-router";
import { Newspaper, Globe, Bookmark, Clock, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Today", Icon: Newspaper, exact: true },
  { to: "/atlas", label: "Atlas", Icon: Globe },
  { to: "/saved", label: "Saved", Icon: Bookmark },
  { to: "/digest", label: "Digest", Icon: Clock },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 items-stretch">
        {tabs.map(({ to, label, Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          const color = active ? "var(--color-brand)" : "#8E8E93";
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className="flex h-full flex-col items-center justify-center gap-1"
                style={{ color }}
              >
                <Icon size={22} strokeWidth={active ? 2.25 : 2} />
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
