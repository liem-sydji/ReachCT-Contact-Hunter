export default function DotGrid({ className = "", style }) {
  return (
    <div
      className={`y2k-dotgrid ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}
