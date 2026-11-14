import { useState } from "react";
import { tokens, ribbonColors } from "../theme.js";
import {
  Button,
  Badge,
  Card,
  HalftoneSurface,
  Ribbon,
  SectionDivider,
  Marquee,
  Navbar,
  Hero,
  Footer,
  TextInput,
  SelectInput,
  Checkbox,
  Toggle,
  LoadingState,
  EmptyState,
  ErrorState,
  Skeleton,
  Sparkle,
  CloudPuff,
  PipeLink,
  Reveal,
  PageTransition,
  ParallaxDriver,
} from "../components/ui/index.js";

const SWATCHES = [
  ["ink", tokens.ink],
  ["ink-soft", tokens.inkSoft],
  ["cream", tokens.cream],
  ["cream-light", tokens.creamLight],
  ["sand", tokens.sand],
  ["marigold", tokens.marigold],
  ["peach", tokens.peach],
  ["coral", tokens.coral],
  ["lavender", tokens.lavender],
  ["periwinkle", tokens.periwinkle],
  ["indigo", tokens.indigo],
  ["violet", tokens.violet],
  ["magenta", tokens.magenta],
  ["hot-pink", tokens.hotPink],
  ["orange", tokens.orange],
  ["success", tokens.success],
  ["warning", tokens.warning],
  ["error", tokens.error],
];

function Swatch({ name, hex }) {
  return (
    <div className="sg-swatch">
      <div className="sg-swatch__chip" style={{ background: hex }} />
      <div className="sg-swatch__meta">
        <span className="sg-swatch__name">{name}</span>
        <span className="sg-swatch__hex">{hex}</span>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  const [on, setOn] = useState(true);

  return (
    <PageTransition>
      <ParallaxDriver />
      <div className="sg-page">
        <Marquee text="Groovy Halftone style guide ✦ review tokens, components & motion before page rollout" />
        <Navbar
          title="Style guide"
          showBack
          links={[
            { to: "/style-guide", label: "Tokens" },
            { to: "/", label: "App home" },
          ]}
        />

        <Hero
          eyebrow="ReachCT visual system"
          title="Groovy"
          accentWord="Halftone"
          subtitle="Night sky, cream paper, rainbow ribbons, and a printed gradient glow — playful, readable, motion-aware."
          ctaLabel="Primary CTA"
          onCta={() => window.scrollTo({ top: 600, behavior: "smooth" })}
        />

        <SectionDivider variant="night-to-paper" />

        {/* Tokens */}
        <section className="sg-section" id="tokens">
          <Reveal>
            <h2 className="sg-h2">Color tokens</h2>
            <p className="sg-lead">
              Defined once as CSS custom properties (<code>:root</code>) and mirrored in{" "}
              <code>theme.js</code>. Components use tokens — never raw hex.
            </p>
            <div className="sg-grid">
              {SWATCHES.map(([name, hex]) => (
                <Swatch key={name} name={name} hex={hex} />
              ))}
            </div>
          </Reveal>
        </section>

        <section className="sg-section" style={{ paddingTop: 0 }}>
          <Reveal>
            <h2 className="sg-h2">Typography</h2>
            <p className="sg-lead">Fraunces Soft+Wonk for display, Poppins for UI, Shrikhand for accent words.</p>
            <p className="gh-display" style={{ fontSize: 48, color: "var(--ink)", marginBottom: 12 }}>
              Soft chunky headlines
            </p>
            <p className="gh-display-shadow" style={{ fontSize: 42, display: "inline-block", marginBottom: 16, background: "var(--ink)", padding: "12px 16px", borderRadius: 12 }}>
              Ribbon <span className="gh-accent-word">shadow</span>
            </p>
            <p style={{ fontSize: 16, maxWidth: 480, lineHeight: 1.6 }}>
              Body copy in Poppins at 400/500/600. Forms, nav, and buttons share this face so the UI stays clear next to the display serif.
            </p>
          </Reveal>
        </section>

        <SectionDivider variant="paper-to-night" />

        {/* Night surface demos */}
        <section className="sg-section--night">
          <div className="sg-inner">
            <Reveal>
              <h2 className="sg-h2" style={{ color: "var(--cream)" }}>On night</h2>
              <p className="sg-lead">Ghost buttons, cream text, drifting decorations.</p>
              <div className="sg-row">
                <Button variant="ghost-on-dark">Ghost on dark</Button>
                <Button variant="halftone">Halftone CTA</Button>
                <Badge tone="marigold">Marigold</Badge>
                <CloudPuff className="gh-drift" width={90} />
              </div>
              <div className="gh-parallax" data-speed="0.18" style={{ marginTop: 24 }}>
                <Ribbon preset="wave" animate colors={ribbonColors} height={90} thickness={9} />
              </div>
            </Reveal>
          </div>
        </section>

        <SectionDivider variant="night-to-paper" />

        {/* Components on paper */}
        <section className="sg-section">
          <Reveal>
            <h2 className="sg-h2">Buttons</h2>
            <p className="sg-lead">Pill shape, 2.5px ink border, hard offset shadow. Hover lifts; press sinks.</p>
            <div className="sg-row">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="halftone">Halftone</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="sg-h2" style={{ marginTop: 40 }}>Cards & badges</h2>
            <div className="sg-pair" style={{ marginTop: 16 }}>
              <Card band="coral" title="Paper card">
                Cream-light surface, chunky border, hard shadow. Hover tilts ~1° and lifts.
              </Card>
              <Card featured title="Featured card">
                Halftone gradient with cream text for featured moments.
              </Card>
            </div>
            <div className="sg-row" style={{ marginTop: 16 }}>
              <Badge tone="coral">Coral</Badge>
              <Badge tone="lavender">Lavender</Badge>
              <Badge tone="periwinkle">Periwinkle</Badge>
              <Badge tone="peach">Peach</Badge>
              <Badge tone="sand">Sand</Badge>
            </div>
            <div style={{ marginTop: 20 }}>
              <PipeLink />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="sg-h2" style={{ marginTop: 40 }}>Form controls</h2>
            <div className="sg-pair" style={{ marginTop: 16 }}>
              <TextInput label="Company" name="company" placeholder="Piktalent" />
              <SelectInput label="Type" name="type" defaultValue="">
                <option value="" disabled>Pick one</option>
                <option>Agency</option>
                <option>Startup</option>
              </SelectInput>
              <Checkbox label="Verified email" name="verified" defaultChecked />
              <Toggle label="Gauge toggle" checked={on} onChange={(e) => setOn(e.target.checked)} />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="sg-h2" style={{ marginTop: 40 }}>Halftone surface</h2>
            <p className="sg-lead">Soft radial blobs + crisp 5px dots (multiply). Configurable size & intensity.</p>
            <HalftoneSurface
              rounded
              style={{ padding: 32, minHeight: 140 }}
              dotSize={5}
              intensity={0.4}
            >
              <p className="gh-display" style={{ fontSize: 32, marginBottom: 8 }}>Printed glow</p>
              <p style={{ opacity: 0.9, maxWidth: 400 }}>
                Hero glow, featured cards, CTA bands, and the footer all share this surface.
              </p>
            </HalftoneSurface>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="sg-h2" style={{ marginTop: 40 }}>Loading / empty / error</h2>
            <div className="sg-pair">
              <LoadingState message="Fetching contacts…" />
              <EmptyState />
            </div>
            <div style={{ marginTop: 16 }}>
              <ErrorState message="Could not reach the API. Try again in a moment." />
            </div>
            <div className="sg-row" style={{ marginTop: 16 }}>
              <Skeleton width={120} height={20} />
              <Skeleton width={80} height={20} />
              <Sparkle size={22} color="var(--coral)" />
            </div>
          </Reveal>
        </section>

        {/* Motion demos */}
        <section className="sg-section" style={{ paddingTop: 0 }}>
          <Reveal>
            <h2 className="sg-h2">Motion patterns</h2>
            <p className="sg-lead">
              Page enter on route change, scroll reveals, ribbon draw-in, soft parallax on decorations,
              button bounce. All non-essential motion respects <code>prefers-reduced-motion</code>.
            </p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.7, fontSize: 14, color: "#5a524c", marginBottom: 20 }}>
              <li><strong>PageTransition</strong> — soft rise/fade when the route key changes</li>
              <li><strong>Reveal</strong> — sections pop in once when scrolled into view</li>
              <li><strong>ParallaxDriver</strong> — <code>.gh-parallax</code> layers drift against scroll</li>
              <li><strong>Ribbon animate</strong> — stroke-dash draw once on intersect</li>
              <li><strong>Buttons</strong> — hover lift 2px, press sink to zero shadow</li>
            </ul>
            <Ribbon preset="dive" animate height={100} thickness={10} />
          </Reveal>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
