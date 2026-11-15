/** Magenta / indigo / orange halftone plasma wash (reference texture). */
export default function PlasmaWash({
  className = "",
  intensity = "full",
  veil = false,
  position = "center",
  style,
}) {
  return (
    <div
      className={`y2k-plasma y2k-plasma--${intensity} ${veil ? "y2k-plasma--veil" : ""} ${className}`.trim()}
      style={{
        ...style,
        ["--y2k-plasma-pos"]: position,
      }}
      aria-hidden="true"
    />
  );
}
