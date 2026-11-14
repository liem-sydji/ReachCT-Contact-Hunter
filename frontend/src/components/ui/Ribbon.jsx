import { useEffect, useRef, useState } from "react";
import { ribbonColors } from "../../theme.js";

const PRESETS = {
  swoop: "M0,40 C120,10 220,70 360,35 S560,5 720,45",
  wave: "M0,50 C80,10 160,90 240,50 S400,10 480,50 S640,90 720,40",
  gentle: "M0,55 C180,20 360,80 540,40 S700,60 720,50",
  dive: "M0,15 C140,20 200,90 360,70 S560,20 720,85",
  flat: "M0,40 L720,40",
};

/**
 * Rainbow ribbon SVG — 5 stripes with thin ink gaps.
 * @param {string} preset - swoop | wave | gentle | dive | flat
 * @param {boolean} animate - stroke-dash draw-in on scroll into view
 */
export default function Ribbon({
  preset = "swoop",
  colors = ribbonColors,
  thickness = 10,
  gap = 2.5,
  width = "100%",
  height = 96,
  animate = false,
  className = "",
  style,
}) {
  const pathD = PRESETS[preset] || PRESETS.swoop;
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(!animate);
  const band = thickness + gap;
  const totalH = colors.length * band + thickness;

  useEffect(() => {
    if (!animate || !ref.current) return;
    const el = ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  return (
    <svg
      ref={ref}
      className={`gh-ribbon ${drawn ? "gh-ribbon--drawn" : ""} ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 720 ${Math.max(100, totalH + 40)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={style}
    >
      {colors.map((c, i) => (
        <path
          key={i}
          className="gh-ribbon__stripe"
          d={pathD}
          fill="none"
          stroke={c}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(0, ${i * band})`}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
      {/* ink gap hints as thin darker lines between stripes */}
      {colors.slice(0, -1).map((_, i) => (
        <path
          key={`gap-${i}`}
          className="gh-ribbon__stripe"
          d={pathD}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={gap}
          strokeLinecap="round"
          opacity="0.55"
          transform={`translate(0, ${i * band + thickness / 2 + gap / 2})`}
        />
      ))}
    </svg>
  );
}
