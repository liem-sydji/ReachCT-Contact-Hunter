/** Small ink-outline pill with accent fill. */
export default function Badge({
  children,
  tone = "coral",
  className = "",
}) {
  return (
    <span className={`gh-badge gh-badge--${tone} ${className}`}>
      {children}
    </span>
  );
}
