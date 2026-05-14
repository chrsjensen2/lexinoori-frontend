import { Wordmark } from "./Wordmark";

interface GlobalHeaderProps {
  actions?: React.ReactNode;
}

export function GlobalHeader({ actions }: GlobalHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center justify-between" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <Wordmark />
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
