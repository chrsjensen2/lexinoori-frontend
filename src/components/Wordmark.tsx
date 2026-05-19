import { SerifLogo } from "./SerifLogo";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center" }}>
      <SerifLogo height={32} color="#FFFFFF" />
    </span>
  );
}
