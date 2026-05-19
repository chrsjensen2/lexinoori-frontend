export function SerifLogo({ height = 32 }: { height?: number }) {
  return (
    <img
      src="/logo_white.svg"
      height={height}
      alt="lexinoori."
      style={{ display: "block", height }}
    />
  );
}
