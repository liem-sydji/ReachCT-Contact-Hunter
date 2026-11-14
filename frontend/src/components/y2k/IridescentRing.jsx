import { useEffect, useId, useState } from "react";

/**
 * Dual-layer iridescent ring. Place inside a positioned parent.
 * `scrollDrift` nudges the wrap on scroll (transform only).
 */
export default function IridescentRing({
  className = "",
  scrollDrift = true,
  size,
}) {
  const uid = useId().replace(/:/g, "");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!scrollDrift) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    const onScroll = () => setOffset(window.scrollY * 0.08);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDrift]);

  const style = {
    ...(size ? { width: size, height: size } : null),
    transform: `translateY(${offset}px)`,
  };

  const gradId = `y2kRingGrad-${uid}`;
  const hiId = `y2kRingHi-${uid}`;

  const ringSvg = (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--ring-coral)" />
          <stop offset="45%" stopColor="var(--ring-pink)" />
          <stop offset="100%" stopColor="var(--ring-yellow)" />
        </linearGradient>
        <linearGradient id={hiId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="18"
      />
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={`url(#${hiId})`}
        strokeWidth="3"
        strokeDasharray="40 220"
        transform="rotate(-30 100 100)"
      />
    </svg>
  );

  return (
    <div className={`y2k-hero__ring-wrap ${className}`.trim()} style={style} aria-hidden="true">
      <div className="y2k-ring y2k-ring--back">{ringSvg}</div>
      <div className="y2k-ring y2k-ring--front" style={{ position: "absolute", inset: 0 }}>
        {ringSvg}
      </div>
    </div>
  );
}
