import BracketLabel from "./BracketLabel.jsx";
import Button from "./Button.jsx";
import DisplayHeading from "./DisplayHeading.jsx";
import IridescentRing from "./IridescentRing.jsx";
import VerticalRail from "./VerticalRail.jsx";

export default function Hero({
  tagline = "PRINT POSTER × Y2K",
  title = "FUTURE",
  titleLine2 = "INK",
  subtitle,
  primaryCta = { label: "Primary CTA", onClick: undefined },
  secondaryCta = { label: "Ghost CTA", onClick: undefined },
  leftRail = "REACHCT / VISUAL SYSTEM",
  rightRail = "41.3874° N  ·  2.1686° E",
  showRing = true,
}) {
  return (
    <section className="y2k-hero">
      <VerticalRail side="left">{leftRail}</VerticalRail>
      <VerticalRail side="right">{rightRail}</VerticalRail>

      {showRing && <IridescentRing />}

      <div className="y2k-hero__content">
        <BracketLabel>{tagline}</BracketLabel>
        <div style={{ marginTop: 16 }}>
          <DisplayHeading size="xl" bleed>
            {title}
          </DisplayHeading>
          {titleLine2 ? (
            <DisplayHeading size="xl" bleed outline style={{ marginTop: 4 }}>
              {titleLine2}
            </DisplayHeading>
          ) : null}
        </div>
        {subtitle ? (
          <p style={{ marginTop: 20, maxWidth: 48 * 8, lineHeight: 1.55, fontSize: 16 }}>
            {subtitle}
          </p>
        ) : null}
        <div className="y2k-hero__cta" style={{ marginTop: 28 }}>
          {primaryCta && (
            <Button variant="solid" onClick={primaryCta.onClick}>
              {primaryCta.label}
            </Button>
          )}
          {secondaryCta && (
            <Button variant="ghost" onClick={secondaryCta.onClick}>
              {secondaryCta.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
