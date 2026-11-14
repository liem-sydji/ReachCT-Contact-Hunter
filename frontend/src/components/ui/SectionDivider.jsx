/**
 * Wavy hilly edge between night and paper sections.
 * @param {"night-to-paper"|"paper-to-night"} variant
 */
export default function SectionDivider({
  variant = "night-to-paper",
  className = "",
  flip = false,
}) {
  const fromNight = variant === "night-to-paper";
  const top = fromNight ? "var(--ink)" : "var(--cream)";
  const bottom = fromNight ? "var(--cream)" : "var(--ink)";

  return (
    <div
      className={`gh-divider ${className}`}
      style={{ background: bottom }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`gh-divider__svg ${flip ? "gh-divider__svg--flip" : ""}`}
      >
        <path
          fill={top}
          d="M0,48 C120,80 240,8 360,32 C480,56 600,72 720,40 C840,8 960,0 1080,28 C1200,56 1320,64 1440,24 L1440,0 L0,0 Z"
        />
      </svg>
    </div>
  );
}
