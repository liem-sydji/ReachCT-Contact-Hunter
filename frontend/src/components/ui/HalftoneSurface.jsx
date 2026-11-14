/**
 * Halftone gradient surface — radial blobs + crisp dot pattern.
 * Use for hero glow, featured cards, CTA bands, footer.
 */
export default function HalftoneSurface({
  children,
  className = "",
  style,
  as: Tag = "div",
  dotSize = 5,
  intensity = 0.35,
  rounded = false,
  ...rest
}) {
  return (
    <Tag
      className={`gh-halftone ${rounded ? "gh-halftone--rounded" : ""} ${className}`}
      style={{
        "--gh-dot-size": `${dotSize}px`,
        "--gh-dot-intensity": intensity,
        ...style,
      }}
      {...rest}
    >
      <span className="gh-halftone__blobs" aria-hidden="true" />
      <span className="gh-halftone__dots" aria-hidden="true" />
      <div className="gh-halftone__content">{children}</div>
    </Tag>
  );
}
