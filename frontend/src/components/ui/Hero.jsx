import HalftoneSurface from "./HalftoneSurface.jsx";
import Button from "./Button.jsx";
import { SparkleField } from "./Decorations.jsx";

/**
 * Night hero with twinkling sparkles, stacked display shadow headline,
 * soft halftone glow, and CTA.
 */
export default function Hero({
  eyebrow,
  title = "ReachCT",
  accentWord,
  subtitle,
  ctaLabel = "Get started",
  onCta,
  children,
  className = "",
}) {
  return (
    <section className={`gh-hero ${className}`}>
      <SparkleField count={10} className="gh-hero__stars" />
      <div className="gh-hero__glow" aria-hidden="true">
        <HalftoneSurface className="gh-hero__glow-surface" dotSize={5} intensity={0.4} />
      </div>

      <div className="gh-hero__content gh-reveal">
        {eyebrow && <p className="gh-hero__eyebrow">{eyebrow}</p>}
        <h1 className="gh-hero__title gh-display-shadow">
          {title}
          {accentWord && (
            <>
              {" "}
              <span className="gh-accent-word">{accentWord}</span>
            </>
          )}
        </h1>
        {subtitle && <p className="gh-hero__sub">{subtitle}</p>}
        {onCta && (
          <div className="gh-hero__cta">
            <Button variant="halftone" onClick={onCta}>
              {ctaLabel}
            </Button>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
