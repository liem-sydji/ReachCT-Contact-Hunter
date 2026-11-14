import { useEffect, useState } from "react";
import {
  getPreferredY2kTheme,
  persistY2kTheme,
  y2kTokens,
  y2kTokensDark,
} from "../themeY2k.js";
import {
  Button,
  PillLabel,
  BracketLabel,
  DisplayHeading,
  ChromeText,
  VerticalRail,
  Sparkle,
  IconBox,
  IconBoxStack,
  Rule,
  IridescentRing,
  StarfieldPanel,
  HalftoneImage,
  DotGrid,
  MetaStrip,
  Navbar,
  Hero,
  PosterCard,
  Section,
  Footer,
  StickerBadge,
  MonoTicker,
  CursorSparkle,
} from "../components/y2k/index.js";

const LIGHT_SWATCHES = [
  ["paper", y2kTokens.paper],
  ["cream", y2kTokens.cream],
  ["fog", y2kTokens.fog],
  ["ink", y2kTokens.ink],
  ["ink-deep", y2kTokens.inkDeep],
  ["pink", y2kTokens.pink],
  ["pink-deep", y2kTokens.pinkDeep],
  ["orange", y2kTokens.orange],
  ["cobalt", y2kTokens.cobalt],
  ["mint", y2kTokens.mint],
  ["ring-coral", y2kTokens.ringCoral],
  ["ring-pink", y2kTokens.ringPink],
  ["ring-yellow", y2kTokens.ringYellow],
];

const DARK_SWATCHES = [
  ["paper → ink-deep", y2kTokensDark.paper],
  ["cream", y2kTokensDark.cream],
  ["fog", y2kTokensDark.fog],
  ["ink → paper", y2kTokensDark.ink],
  ["ink-deep → void", y2kTokensDark.inkDeep],
  ["pink", y2kTokensDark.pink],
  ["pink-deep", y2kTokensDark.pinkDeep],
  ["orange", y2kTokensDark.orange],
  ["cobalt (AA lift)", y2kTokensDark.cobalt],
  ["mint (AA lift)", y2kTokensDark.mint],
  ["ring-coral", y2kTokensDark.ringCoral],
  ["ring-pink", y2kTokensDark.ringPink],
  ["ring-yellow", y2kTokensDark.ringYellow],
];

function Swatch({ name, hex }) {
  return (
    <div className="y2k-sg__swatch">
      <div className="y2k-sg__chip" style={{ background: hex }} />
      <div className="y2k-sg__meta">
        <span className="y2k-sg__name">{name}</span>
        <span className="y2k-sg__hex">{hex}</span>
      </div>
    </div>
  );
}

export default function StyleGuideY2kPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(getPreferredY2kTheme());
  }, []);

  const setAndPersist = (next) => {
    setTheme(next);
    persistY2kTheme(next);
  };

  const swatches = theme === "dark" ? DARK_SWATCHES : LIGHT_SWATCHES;

  return (
    <div className="y2k-root y2k-sg" data-theme={theme}>
      <CursorSparkle />
      <MonoTicker />
      <Navbar
        centerLabel="Y2K POSTER"
        theme={theme}
        onThemeChange={setAndPersist}
        links={[
          { to: "/style-guide-y2k", label: "Tokens" },
          { to: "/", label: "App home" },
        ]}
      />

      <Hero
        tagline="VISUAL IDENTITY // REVIEW"
        title="PRINT"
        titleLine2="POSTER"
        subtitle="Grainy paper, navy ink blocks, chrome accents, and one iridescent ring — a print object, not a SaaS template. Style guide only; sitewide rollout paused."
        primaryCta={{
          label: "Jump to tokens",
          onClick: () =>
            document.getElementById("tokens")?.scrollIntoView({ behavior: "smooth" }),
        }}
        secondaryCta={{
          label: "Components",
          onClick: () =>
            document.getElementById("primitives")?.scrollIntoView({ behavior: "smooth" }),
        }}
      />

      <Section tone="cream" number={1} rail="01 / TOKENS" id="tokens">
        <h2 className="y2k-sg__h2">Color tokens</h2>
        <p className="y2k-sg__lead">
          CSS custom properties on <code>.y2k-root</code>, mirrored in{" "}
          <code>themeY2k.js</code>. Pink and orange are decoration / big type only.
          Dark mode: <code>data-theme=&quot;dark&quot;</code> → ink-deep ground, paper text;
          accents stay (cobalt/mint lift slightly for AA on dark).
        </p>
        <div className="y2k-sg__row" style={{ marginBottom: 16 }}>
          <PillLabel filled={theme === "dark"}>{theme === "dark" ? "Dark mode" : "Light mode"}</PillLabel>
          <BracketLabel>TOGGLE IN NAV</BracketLabel>
        </div>
        <div className="y2k-sg__grid">
          {swatches.map(([name, hex]) => (
            <Swatch key={name} name={name} hex={hex} />
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <div className="y2k-sg__type-label">Chrome gradient</div>
          <div
            style={{
              height: 48,
              border: "1.5px solid var(--ink)",
              background: y2kTokens.chrome,
            }}
            aria-hidden="true"
          />
        </div>
      </Section>

      <Section tone="paper" number={2} rail="02 / TYPE">
        <h2 className="y2k-sg__h2">Type</h2>
        <p className="y2k-sg__lead">
          Unbounded display, Anton condensed, Big Shoulders Stencil sparingly, Space Mono for
          labels. Body stays DM Sans.
        </p>
        <div className="y2k-sg__type-sample">
          <div className="y2k-sg__type-label">Display — Unbounded</div>
          <DisplayHeading size="md" as="p">
            Contact Intelligence
          </DisplayHeading>
        </div>
        <div className="y2k-sg__type-sample">
          <div className="y2k-sg__type-label">Condensed — Anton</div>
          <p
            style={{
              fontFamily: "var(--y2k-font-condensed)",
              fontSize: "clamp(3rem, 8vw, 5rem)",
              lineHeight: 0.9,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            2026 / 41°
          </p>
        </div>
        <div className="y2k-sg__type-sample">
          <div className="y2k-sg__type-label">Stencil — Big Shoulders</div>
          <p
            style={{
              fontFamily: "var(--y2k-font-stencil)",
              fontWeight: 800,
              fontSize: 28,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Unit header
          </p>
        </div>
        <div className="y2k-sg__type-sample">
          <div className="y2k-sg__type-label">Mono — Space Mono</div>
          <BracketLabel>BRACKETED METADATA</BracketLabel>
        </div>
      </Section>

      <Section tone="ink" number={3} rail="03 / PRIMITIVES" id="primitives">
        <h2 className="y2k-sg__h2" style={{ color: "var(--paper)" }}>
          Primitives
        </h2>
        <p className="y2k-sg__lead" style={{ color: "var(--paper)" }}>
          Buttons, pills, brackets, display cuts, chrome, rails, sparkles, rules.
        </p>

        <div
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "1.5px solid var(--paper)",
            padding: 24,
          }}
        >
          <div className="y2k-sg__type-label">Button</div>
          <div className="y2k-sg__row">
            <Button variant="solid">Solid</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="solid" disabled>
              Disabled
            </Button>
          </div>

          <div className="y2k-sg__type-label">PillLabel</div>
          <div className="y2k-sg__row">
            <PillLabel>Outlined</PillLabel>
            <PillLabel filled>Filled</PillLabel>
            <PillLabel filled tone="pink">
              Pink
            </PillLabel>
            <PillLabel filled tone="orange">
              Orange
            </PillLabel>
          </div>

          <div className="y2k-sg__type-label">BracketLabel</div>
          <div className="y2k-sg__row">
            <BracketLabel>SPEC SHEET</BracketLabel>
            <BracketLabel>EDITION 01</BracketLabel>
          </div>

          <Rule variant="labelled" label="DisplayHeading" />
          <div className="y2k-sg__stack">
            <DisplayHeading size="md" as="p">
              Solid fill
            </DisplayHeading>
            <DisplayHeading size="md" outline as="p">
              Outline stroke
            </DisplayHeading>
            <DisplayHeading size="md" cut cutTone="pink" as="p">
              Cut through
            </DisplayHeading>
            <DisplayHeading size="md" bleed pink as="p">
              Bleed edge
            </DisplayHeading>
          </div>

          <Rule variant="labelled" label="ChromeText" />
          <ChromeText style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}>
            Liquid metal
          </ChromeText>

          <Rule variant="labelled" label="Sparkle / IconBox" />
          <div className="y2k-sg__row">
            <Sparkle size={28} />
            <IconBox glyph="sparkle" />
            <IconBox glyph="globe" />
            <IconBox glyph="rings" />
            <IconBoxStack />
          </div>

          <Rule variant="labelled" label="Rule variants" />
          <Rule variant="single" />
          <Rule variant="double" />
          <Rule variant="labelled" label="Section break" />
          <Rule variant="zigzag" />

          <div style={{ position: "relative", minHeight: 80, marginTop: 24 }}>
            <VerticalRail side="left">LEFT RAIL SAMPLE</VerticalRail>
            <VerticalRail side="right">RIGHT RAIL SAMPLE</VerticalRail>
            <p className="y2k-sg__note" style={{ textAlign: "center" }}>
              Vertical rails visible ≥768px
            </p>
          </div>
        </div>
      </Section>

      <Section tone="paper" number={4} rail="04 / SIGNATURE" id="signature">
        <h2 className="y2k-sg__h2">Decorative / signature</h2>
        <p className="y2k-sg__lead">
          One signature moment per page in production. Here every variant is shown for review.
        </p>

        <div className="y2k-sg__type-label">IridescentRing (standalone)</div>
        <div
          style={{
            position: "relative",
            height: 280,
            border: "1.5px solid var(--ink)",
            background: "var(--cream)",
            overflow: "hidden",
            marginBottom: 28,
          }}
        >
          <IridescentRing scrollDrift={false} />
          <DisplayHeading
            size="lg"
            as="p"
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              zIndex: 2,
              maxWidth: "70%",
            }}
          >
            Ring cut
          </DisplayHeading>
        </div>

        <div className="y2k-sg__type-label">StarfieldPanel</div>
        <StarfieldPanel>
          <BracketLabel>STARFIELD // WIREFRAME FLOOR</BracketLabel>
          <DisplayHeading size="sm" as="p" style={{ color: "var(--paper)", marginTop: 16 }}>
            Ink-deep night
          </DisplayHeading>
        </StarfieldPanel>

        <div className="y2k-sg__type-label" style={{ marginTop: 28 }}>
          HalftoneImage
        </div>
        <div className="y2k-sg__cards">
          <HalftoneImage
            duotone="cobalt"
            style={{ height: 180 }}
            alt=""
          />
          <HalftoneImage
            duotone="ink"
            torn
            style={{ height: 180 }}
            alt=""
          />
        </div>
        <p className="y2k-sg__note">Placeholder panels — swap for real photos at rollout.</p>

        <div className="y2k-sg__type-label" style={{ marginTop: 28 }}>
          DotGrid
        </div>
        <DotGrid />

        <div className="y2k-sg__type-label" style={{ marginTop: 28 }}>
          MetaStrip
        </div>
        <MetaStrip />
      </Section>

      <Section tone="cream" number={5} rail="05 / LAYOUT">
        <h2 className="y2k-sg__h2">Layout</h2>
        <p className="y2k-sg__lead">
          Navbar and Hero are live above. PosterCard, Section tones, Footer below.
        </p>

        <div className="y2k-sg__type-label">PosterCard</div>
        <div className="y2k-sg__cards">
          <PosterCard header="Unit Alpha" meta={["REF A", "COBALT", "A3"]} />
          <PosterCard
            header="Pink strip"
            pinkHeader
            duotone="ink"
            meta={["REF B", "INK/PINK", "A2"]}
          />
        </div>

        <div className="y2k-sg__type-label" style={{ marginTop: 28 }}>
          Section tones + window radius
        </div>
        <div className="y2k-sg__cards">
          <div className="y2k-sg__window" style={{ background: "var(--paper)", padding: 20 }}>
            <BracketLabel>PAPER</BracketLabel>
          </div>
          <div className="y2k-sg__window" style={{ background: "var(--cream)", padding: 20 }}>
            <BracketLabel>CREAM</BracketLabel>
          </div>
          <div
            className="y2k-sg__window"
            style={{ background: "var(--ink)", color: "var(--paper)", padding: 20 }}
          >
            <BracketLabel>INK</BracketLabel>
          </div>
          <div
            className="y2k-sg__window"
            style={{ background: "var(--pink)", color: "var(--paper)", padding: 20 }}
          >
            <BracketLabel>PINK</BracketLabel>
          </div>
        </div>

        <div className="y2k-sg__type-label" style={{ marginTop: 28 }}>
          StickerBadge (creative)
        </div>
        <div className="y2k-sg__row">
          <StickerBadge>Limited run</StickerBadge>
          <StickerBadge>Proof A</StickerBadge>
        </div>
      </Section>

      <Section tone="pink" number={6} rail="06 / NOTES">
        <h2 className="y2k-sg__h2">Pause point</h2>
        <p className="y2k-sg__lead">
          Step 3 sitewide restyle is held until this identity wins the comparison against Groovy
          Halftone. No app pages were restyled in this pass.
        </p>
        <div className="y2k-sg__row">
          <Button
            variant="solid"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top
          </Button>
          <Button variant="ghost" onClick={() => { window.location.href = "/"; }}>
            App home
          </Button>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
