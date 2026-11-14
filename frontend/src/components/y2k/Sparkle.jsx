/** Four-point star glyph. */
export default function Sparkle({ size = 16, className = "", style }) {
  return (
    <svg
      className={`y2k-sparkle ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={style}
    >
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
  );
}
