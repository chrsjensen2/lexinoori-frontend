export function SerifLogo({ height = 32, color: _color }: { height?: number; color?: string }) {
  void _color;
  return (
    <img
      src="/logo_white.svg"
      height={height}
      alt="lexinoori."
      style={{ display: "block", height }}
    />
  );
}
