/** Decorative SVGs for Groovy Halftone. Always aria-hidden. */

export function Sparkle({ size = 24, color = "var(--cream)", className = "", style }) {
  return (
    <svg
      className={`gh-sparkle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={style}
    >
      <path d="M12 1.5 L13.8 9.2 L21.5 12 L13.8 14.8 L12 22.5 L10.2 14.8 L2.5 12 L10.2 9.2 Z" />
    </svg>
  );
}

export function StarDot({ size = 6, color = "var(--cream)", className = "", style }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill={color}
      aria-hidden="true"
      style={style}
    >
      <circle cx="4" cy="4" r="3.2" />
    </svg>
  );
}

export function CloudPuff({ width = 80, color = "var(--cream)", stroke = "var(--ink)", className = "" }) {
  return (
    <svg
      className={className}
      width={width}
      height={width * 0.55}
      viewBox="0 0 100 55"
      aria-hidden="true"
    >
      <path
        d="M22 42c-8 0-14-5-14-12s6-12 14-12c1.5-7 8-12 16-12 7 0 13 4 15 10 2-1 4-1.5 6.5-1.5 9 0 16 6 16 14 0 1 0 2-.3 3H86c8 0 14 5 14 11s-6 11-14 11H22z"
        fill={color}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Rounded pipe with a tiny gauge/valve — links content blocks. */
export function PipeLink({ width = 160, height = 48, className = "" }) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 160 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 28 H52 Q60 28 60 20 V12 Q60 4 68 4 H110"
        stroke="var(--ink)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 28 H52 Q60 28 60 20 V12 Q60 4 68 4 H110"
        stroke="var(--coral)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* valve */}
      <circle cx="60" cy="28" r="7" fill="var(--marigold)" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx="60" cy="28" r="2.5" fill="var(--ink)" />
      {/* gauge */}
      <circle cx="128" cy="16" r="12" fill="var(--cream-light)" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M128 16 L134 10" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="128" cy="16" r="2" fill="var(--ink)" />
    </svg>
  );
}

/**
 * Concentric halftone wave ridges for the landing hero —
 * orange → pink → cream fade with a soft undulating hover.
 */
export function LandingWaveField({ className = "" }) {
  const ridges = [
    { rx: 780, ry: 560, cy: 1180, delay: "0s", dur: "9s" },
    { rx: 640, ry: 460, cy: 1120, delay: "0.4s", dur: "8.2s" },
    { rx: 510, ry: 370, cy: 1060, delay: "0.9s", dur: "7.6s" },
    { rx: 390, ry: 290, cy: 1005, delay: "1.3s", dur: "8.8s" },
    { rx: 280, ry: 210, cy: 960, delay: "1.7s", dur: "7.2s" },
    { rx: 180, ry: 140, cy: 925, delay: "2.1s", dur: "9.4s" },
  ];

  return (
    <div className={`landing-waves ${className}`} aria-hidden="true">
      <div className="landing-waves__wash" />
      <svg
        className="landing-waves__svg"
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="landingWaveGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#E47750" />
            <stop offset="28%" stopColor="#EE685E" />
            <stop offset="52%" stopColor="#D63391" />
            <stop offset="78%" stopColor="#B7A6E8" />
            <stop offset="100%" stopColor="#F6EBD9" />
          </linearGradient>
          <radialGradient id="landingWaveCore" cx="50%" cy="92%" r="55%">
            <stop offset="0%" stopColor="#FCC56D" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#E47750" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#D63391" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#391767" stopOpacity="0" />
          </radialGradient>
          <pattern id="landingWaveDots" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.15" fill="rgba(45,43,44,0.42)" />
          </pattern>
        </defs>

        <rect width="800" height="1000" fill="url(#landingWaveCore)" opacity="0.9" />

        {ridges.map((r, i) => (
          <ellipse
            key={i}
            className={`landing-waves__ridge landing-waves__ridge--${i + 1}`}
            cx="400"
            cy={r.cy}
            rx={r.rx}
            ry={r.ry}
            fill="none"
            stroke="url(#landingWaveGrad)"
            strokeWidth={72 - i * 6}
            style={{ animationDelay: r.delay, animationDuration: r.dur }}
          />
        ))}

        <rect
          className="landing-waves__dots"
          width="800"
          height="1000"
          fill="url(#landingWaveDots)"
          opacity="0.55"
          style={{ mixBlendMode: "multiply" }}
        />
      </svg>
    </div>
  );
}

/** Twinkling field for night heroes — fewer on mobile via CSS. */
export function SparkleField({ count = 12, className = "" }) {
  const items = Array.from({ length: count }, (_, i) => {
    const left = ((i * 37) % 93) + 3;
    const top = ((i * 53) % 78) + 6;
    const size = 8 + (i % 4) * 4;
    const delay = (i % 6) * 0.35;
    const kind = i % 3 === 0 ? "sparkle" : "dot";
    return { left, top, size, delay, kind, key: i };
  });

  return (
    <div className={`gh-sparkle-field ${className}`} aria-hidden="true">
      {items.map((s) =>
        s.kind === "sparkle" ? (
          <Sparkle
            key={s.key}
            size={s.size}
            className="gh-twinkle"
            style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
          />
        ) : (
          <StarDot
            key={s.key}
            size={Math.max(3, s.size / 3)}
            className="gh-twinkle"
            style={{
              position: "absolute",
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
            }}
          />
        )
      )}
    </div>
  );
}
