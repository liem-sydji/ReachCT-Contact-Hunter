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
 * Grainy heatmap field for the landing hero —
 * soft orange → pink → cream heat lobes with dense stipple grain and a slow wave hover.
 */
export function LandingWaveField({ className = "" }) {
  const lobes = [
    { rx: 760, ry: 540, cy: 1120, delay: "0s", dur: "11s", opacity: 0.42 },
    { rx: 600, ry: 430, cy: 1060, delay: "0.6s", dur: "9.5s", opacity: 0.5 },
    { rx: 460, ry: 340, cy: 1005, delay: "1.2s", dur: "10.2s", opacity: 0.58 },
    { rx: 330, ry: 250, cy: 960, delay: "1.8s", dur: "8.8s", opacity: 0.66 },
    { rx: 210, ry: 165, cy: 925, delay: "2.3s", dur: "9.8s", opacity: 0.75 },
  ];

  return (
    <div className={`landing-waves ${className}`} aria-hidden="true">
      <div className="landing-waves__heat landing-waves__heat--base" />
      <div className="landing-waves__heat landing-waves__heat--hot" />
      <div className="landing-waves__heat landing-waves__heat--core" />

      <svg
        className="landing-waves__svg"
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <radialGradient id="landingHeatGrad" cx="50%" cy="88%" r="68%">
            <stop offset="0%" stopColor="#FCC56D" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#E47750" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#EE685E" stopOpacity="0.75" />
            <stop offset="62%" stopColor="#D63391" stopOpacity="0.55" />
            <stop offset="82%" stopColor="#B7A6E8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#F6EBD9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="landingLobeFill" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#F6EBD9" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#D63391" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#E47750" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E47750" stopOpacity="0" />
          </radialGradient>
          <filter id="landingHeatGrain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.12
                      0 0 0 0 0.06
                      0 0 0 0 0.1
                      0 0 0 0.7 0"
              result="grain"
            />
            <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
          </filter>
          <pattern id="landingHeatDots" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="0.9" cy="0.9" r="0.85" fill="rgba(45,43,44,0.55)" />
          </pattern>
          <pattern id="landingHeatDotsFine" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="0.7" cy="0.7" r="0.55" fill="rgba(246,235,217,0.35)" />
          </pattern>
        </defs>

        <g className="landing-waves__heatmap" filter="url(#landingHeatGrain)">
          <ellipse
            className="landing-waves__ridge landing-waves__ridge--core"
            cx="400"
            cy="980"
            rx="520"
            ry="420"
            fill="url(#landingHeatGrad)"
            style={{ animationDelay: "0.2s", animationDuration: "10s" }}
          />
          {lobes.map((l, i) => (
            <ellipse
              key={i}
              className={`landing-waves__ridge landing-waves__ridge--${i + 1}`}
              cx="400"
              cy={l.cy}
              rx={l.rx}
              ry={l.ry}
              fill="url(#landingLobeFill)"
              opacity={l.opacity}
              style={{ animationDelay: l.delay, animationDuration: l.dur }}
            />
          ))}
        </g>

        <rect
          className="landing-waves__dots"
          width="800"
          height="1000"
          fill="url(#landingHeatDots)"
          opacity="0.72"
          style={{ mixBlendMode: "multiply" }}
        />
        <rect
          className="landing-waves__dots landing-waves__dots--fine"
          width="800"
          height="1000"
          fill="url(#landingHeatDotsFine)"
          opacity="0.45"
          style={{ mixBlendMode: "soft-light" }}
        />
      </svg>

      <div className="landing-waves__grain" />
    </div>
  );
}

/**
 * Light paper heatmap — full-bleed cream / marigold / peach / lavender wash + grain.
 * For empty/home surfaces that must stay readable (not night).
 */
export function PaperHeatmapField({ className = "" }) {
  return (
    <div className={`paper-heat ${className}`} aria-hidden="true">
      <div className="paper-heat__wash" />
      <div className="paper-heat__blob paper-heat__blob--a" />
      <div className="paper-heat__blob paper-heat__blob--b" />
      <div className="paper-heat__blob paper-heat__blob--c" />
      <div className="paper-heat__blob paper-heat__blob--d" />
      <div className="paper-heat__blob paper-heat__blob--e" />
      <div className="paper-heat__blob paper-heat__blob--f" />

      <svg
        className="paper-heat__waves"
        viewBox="0 0 800 600"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="paperWaveGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FCC56D" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#F7A77C" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#B7A6E8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#F6EBD9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            className={`paper-heat__ridge paper-heat__ridge--${i + 1}`}
            cx="400"
            cy={520 - i * 55}
            rx={420 + i * 55}
            ry={160 + i * 28}
            fill="none"
            stroke="url(#paperWaveGrad)"
            strokeWidth={70 - i * 6}
            opacity={0.55 - i * 0.05}
            style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${10 + i * 0.7}s` }}
          />
        ))}
      </svg>

      <svg className="paper-heat__noise" width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <filter id="paperHeatNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.18
                      0 0 0 0 0.14
                      0 0 0 0 0.1
                      0 0 0 0.28 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#paperHeatNoise)" opacity="0.55" />
      </svg>
      <div className="paper-heat__dots" />
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
