export function SerifLogo({ height = 32, color = "#FFFFFF" }: { height?: number; color?: string }) {
  // Aspect-ratio approx 4.2:1 for the wordmark
  const width = Math.round(height * 4.2);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 100"
      width={width}
      height={height}
      aria-label="lexinoori"
      role="img"
    >
      <text
        x="0"
        y="78"
        fill={color}
        style={{
          fontFamily: '"Instrument Serif", "Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif',
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 92,
          letterSpacing: "-2px",
        }}
      >
        lexinoori.
      </text>
    </svg>
  );
}
