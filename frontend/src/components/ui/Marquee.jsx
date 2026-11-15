import { Sparkle } from "./Decorations.jsx";

/**
 * Thin cream announcement strip. One message loops with sparkles between repeats.
 * Pauses on hover; static when prefers-reduced-motion.
 * Screen readers get a single static announcement (aria-hidden on the scroller).
 */
export default function Marquee({
  text = "ReachCT — shared contacts grow with every search ✦",
  className = "",
}) {
  const unit = (
    <>
      <span className="gh-marquee__text">{text}</span>
      <Sparkle size={14} color="var(--coral)" />
    </>
  );

  return (
    <div className={`gh-marquee ${className}`}>
      <p className="gh-sr-only">{text}</p>
      <div className="gh-marquee__track" aria-hidden="true">
        <div className="gh-marquee__group">
          {unit}{unit}{unit}{unit}
        </div>
        <div className="gh-marquee__group">
          {unit}{unit}{unit}{unit}
        </div>
      </div>
    </div>
  );
}
