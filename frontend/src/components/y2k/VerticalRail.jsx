export default function VerticalRail({ children, side = "left", className = "" }) {
  return (
    <div
      className={`y2k-rail y2k-rail--${side} ${className}`.trim()}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
