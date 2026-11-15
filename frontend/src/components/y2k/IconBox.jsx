import Sparkle from "./Sparkle.jsx";

function GlobeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </svg>
  );
}

function RingsGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="10.5" />
    </svg>
  );
}

const GLYPHS = {
  sparkle: () => <Sparkle size={14} />,
  globe: GlobeGlyph,
  rings: RingsGlyph,
};

export default function IconBox({ glyph = "sparkle", className = "" }) {
  const Glyph = GLYPHS[glyph] || GLYPHS.sparkle;
  return (
    <span className={`y2k-iconbox ${className}`.trim()} aria-hidden="true">
      <Glyph />
    </span>
  );
}

export function IconBoxStack({ glyphs = ["sparkle", "globe", "rings"], className = "" }) {
  return (
    <div className={`y2k-iconbox-stack ${className}`.trim()} aria-hidden="true">
      {glyphs.map((g) => (
        <IconBox key={g} glyph={g} />
      ))}
    </div>
  );
}
