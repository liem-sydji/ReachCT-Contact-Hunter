/**
 * Print poster × Y2K — tokens + component styles.
 * Scoped under .y2k-root so the live app stays untouched until Step 3.
 */
export const y2kCss = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=Big+Shoulders+Stencil+Display:wght@800&family=Space+Mono:wght@400;700&family=Unbounded:wght@800;900&display=swap');

  .y2k-root {
    /* Locked palette — do not remap these */
    --palette-paper: #EDEAE2;
    --palette-cream: #EEE6CF;
    --palette-fog: #D6D7DB;
    --palette-ink: #2E2F3D;
    --palette-ink-deep: #0A0F1F;
    --palette-ink-void: #05070F;

    /* Semantic surfaces (light default) */
    --paper: var(--palette-paper);
    --cream: var(--palette-cream);
    --fog: var(--palette-fog);
    --ink: var(--palette-ink);
    --ink-deep: var(--palette-ink-deep);
    --pink: #E12963;
    --pink-deep: #C21E55;
    --orange: #E85018;
    --cobalt: #1B4C95;
    --mint: #A4D7CE;
    --ring-coral: #F96346;
    --ring-pink: #F94E60;
    --ring-yellow: #F9CB53;
    --chrome: linear-gradient(105deg, #FFFFFF 0%, #B9C0C9 28%, #5D6670 52%, #F4F6F8 76%, #8A929C 100%);

    --y2k-font-display: 'Unbounded', system-ui, sans-serif;
    --y2k-font-condensed: 'Anton', Impact, sans-serif;
    --y2k-font-stencil: 'Big Shoulders Stencil Display', Impact, sans-serif;
    --y2k-font-mono: 'Space Mono', ui-monospace, monospace;
    --y2k-font-body: 'DM Sans', system-ui, sans-serif;

    --y2k-border: 1.5px solid var(--ink);
    --y2k-shadow: 4px 4px 0 var(--ink);
    --y2k-radius-pill: 999px;
    --y2k-radius-window: 28px;
    --y2k-grain-opacity: 0.07;
    --y2k-grain-blend: multiply;

    position: relative;
    min-height: 100vh;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--y2k-font-body);
    overflow-x: clip;
    -webkit-font-smoothing: antialiased;
    color-scheme: light;
  }

  /* Dark mode: ink-deep ground, paper text, accents unchanged */
  .y2k-root[data-theme="dark"] {
    --paper: var(--palette-ink-deep);
    --cream: #12182A;
    --fog: #1A2238;
    --ink: var(--palette-paper);
    --ink-deep: var(--palette-ink-void);
    --cobalt: #6B9AE8;
    --mint: #B8E6DD;
    --y2k-grain-opacity: 0.12;
    --y2k-grain-blend: soft-light;
    color-scheme: dark;
  }

  /* Paper grain overlay */
  .y2k-root::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9998;
    opacity: var(--y2k-grain-opacity);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    mix-blend-mode: var(--y2k-grain-blend);
  }

  .y2k-root *,
  .y2k-root *::before,
  .y2k-root *::after {
    box-sizing: border-box;
  }

  .y2k-root a { color: inherit; text-decoration: none; }

  /* Halftone utility */
  .y2k-halftone {
    background-image: radial-gradient(circle, var(--ink) 1px, transparent 1.2px);
    background-size: 6px 6px;
  }

  /* ── Button ── */
  .y2k-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--y2k-font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: var(--y2k-border);
    border-radius: 0;
    padding: 12px 20px;
    cursor: pointer;
    box-shadow: var(--y2k-shadow);
    transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, color 120ms ease;
    position: relative;
    line-height: 1;
  }
  .y2k-btn:focus-visible {
    outline: 2px solid var(--pink);
    outline-offset: 2px;
  }
  .y2k-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--ink);
  }
  .y2k-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .y2k-btn--solid {
    background: var(--ink);
    color: var(--paper);
  }
  .y2k-btn--solid:hover:not(:disabled) {
    background: var(--paper);
    color: var(--ink);
  }
  .y2k-btn--accent {
    background: var(--pink-deep);
    color: var(--paper);
  }
  .y2k-btn--accent:hover:not(:disabled) {
    background: var(--ink);
    color: var(--paper);
  }
  .y2k-btn--ghost {
    background: transparent;
    color: var(--ink);
    border-radius: var(--y2k-radius-pill);
    box-shadow: none;
  }
  .y2k-btn--ghost:hover:not(:disabled) {
    background: var(--ink);
    color: var(--paper);
  }
  .y2k-btn--ghost:active:not(:disabled) {
    transform: none;
  }

  /* ── PillLabel ── */
  .y2k-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: var(--y2k-border);
    border-radius: var(--y2k-radius-pill);
    padding: 6px 14px;
    background: transparent;
    color: var(--ink);
    line-height: 1;
    white-space: nowrap;
  }
  .y2k-pill--filled {
    background: var(--ink);
    color: var(--paper);
  }
  .y2k-pill--pink {
    background: var(--pink-deep);
    color: var(--paper);
    border-color: var(--pink-deep);
  }
  .y2k-pill--orange {
    background: var(--orange);
    color: var(--ink-deep);
    border-color: var(--orange);
  }

  /* ── BracketLabel ── */
  .y2k-bracket {
    font-family: var(--y2k-font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink);
  }

  /* ── DisplayHeading ── */
  .y2k-display {
    font-family: var(--y2k-font-display);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.88;
    color: var(--ink);
    margin: 0;
  }
  .y2k-display--sm { font-size: clamp(2rem, 6vw, 3.5rem); }
  .y2k-display--md { font-size: clamp(2.75rem, 9vw, 6rem); }
  .y2k-display--lg { font-size: clamp(3.5rem, 12vw, 10rem); }
  .y2k-display--xl { font-size: clamp(4.5rem, 14vw, 12rem); }
  .y2k-display--bleed {
    width: 110%;
    margin-left: -5%;
    overflow: hidden;
  }
  .y2k-display--outline {
    color: transparent;
    -webkit-text-stroke: 1.5px var(--ink);
    text-stroke: 1.5px var(--ink);
  }
  .y2k-display--pink { color: var(--pink); }
  .y2k-display--cut {
    position: relative;
    display: inline-block;
  }
  .y2k-display__cut {
    position: absolute;
    left: 18%;
    top: 38%;
    width: 64%;
    height: 28%;
    background: var(--paper);
    border: var(--y2k-border);
    z-index: 1;
    pointer-events: none;
  }
  .y2k-display__cut--ink { background: var(--ink); border-color: var(--ink); }
  .y2k-display__cut--pink { background: var(--pink); border-color: var(--pink); }
  .y2k-display__cut--img {
    background-size: cover;
    background-position: center;
  }

  /* ── ChromeText ── */
  .y2k-chrome {
    display: inline-block;
    font-family: var(--y2k-font-display);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.9;
    background: var(--chrome);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    position: relative;
  }
  .y2k-chrome::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.65) 50%, transparent 65%);
    background-size: 200% 100%;
    background-position: 120% 0;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease;
  }
  .y2k-chrome:hover::after {
    opacity: 1;
    animation: y2k-sheen 1.1s ease forwards;
  }
  @keyframes y2k-sheen {
    from { background-position: 120% 0; }
    to { background-position: -20% 0; }
  }

  /* ── VerticalRail ── */
  .y2k-rail {
    position: absolute;
    top: 50%;
    writing-mode: vertical-rl;
    transform: translateY(-50%) rotate(180deg);
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    white-space: nowrap;
    pointer-events: none;
    z-index: 2;
  }
  .y2k-rail--left { left: 12px; }
  .y2k-rail--right { right: 12px; transform: translateY(-50%); }
  @media (max-width: 767px) {
    .y2k-rail { display: none; }
  }

  /* ── Sparkle + IconBox ── */
  .y2k-sparkle {
    display: inline-block;
    width: 1em;
    height: 1em;
    color: var(--ink);
    flex-shrink: 0;
  }
  .y2k-iconbox {
    width: 36px;
    height: 36px;
    border: var(--y2k-border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--paper);
    color: var(--ink);
    flex-shrink: 0;
  }
  .y2k-iconbox-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* ── Rule ── */
  .y2k-rule {
    border: 0;
    height: 1.5px;
    background: var(--ink);
    margin: 16px 0;
    width: 100%;
  }
  .y2k-rule--double {
    height: 5px;
    background:
      linear-gradient(var(--ink), var(--ink)) 0 0 / 100% 1px no-repeat,
      linear-gradient(var(--ink), var(--ink)) 0 100% / 100% 1px no-repeat;
  }
  .y2k-rule--labelled {
    display: flex;
    align-items: center;
    gap: 12px;
    height: auto;
    background: none;
    margin: 20px 0;
  }
  .y2k-rule--labelled::before,
  .y2k-rule--labelled::after {
    content: '';
    flex: 1;
    height: 1.5px;
    background: var(--ink);
  }
  .y2k-rule__label {
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .y2k-rule--zigzag {
    height: 10px;
    background: none;
    border: 0;
    background-image: repeating-linear-gradient(
      135deg,
      var(--ink) 0 2px,
      transparent 2px 8px
    );
    background-size: 12px 10px;
    background-repeat: repeat-x;
  }

  /* ── IridescentRing ── */
  .y2k-ring {
    position: absolute;
    width: min(42vw, 340px);
    height: min(42vw, 340px);
    pointer-events: none;
    z-index: 3;
    transform-style: preserve-3d;
    animation: y2k-ring-spin 18s linear infinite;
  }
  .y2k-ring--back { z-index: 0; }
  .y2k-ring--front { z-index: 4; clip-path: inset(50% 0 0 0); }
  .y2k-ring svg { width: 100%; height: 100%; display: block; }
  @keyframes y2k-ring-spin {
    from { transform: rotateX(58deg) rotateZ(0deg); }
    to { transform: rotateX(58deg) rotateZ(360deg); }
  }

  /* ── StarfieldPanel ── */
  .y2k-starfield {
    position: relative;
    background: var(--palette-ink-deep);
    color: var(--palette-paper);
    overflow: hidden;
    border: var(--y2k-border);
    min-height: 220px;
    padding: 32px;
  }
  .y2k-root[data-theme="dark"] .y2k-starfield {
    background: var(--palette-ink-void);
  }
  .y2k-starfield__star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: var(--palette-paper);
    border-radius: 50%;
    opacity: 0.55;
    animation: y2k-twinkle 2.4s ease-in-out infinite;
  }
  .y2k-starfield__grid {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 45%;
    background:
      linear-gradient(to top, transparent 0%, rgba(237,234,226,0.08) 100%),
      repeating-linear-gradient(90deg, rgba(237,234,226,0.18) 0 1px, transparent 1px 48px),
      repeating-linear-gradient(0deg, rgba(237,234,226,0.18) 0 1px, transparent 1px 28px);
    transform: perspective(420px) rotateX(58deg);
    transform-origin: bottom center;
    pointer-events: none;
  }
  @keyframes y2k-twinkle {
    0%, 100% { opacity: 0.25; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.6); }
  }

  /* ── HalftoneImage ── */
  .y2k-ht-img {
    position: relative;
    overflow: hidden;
    border: var(--y2k-border);
    background: var(--fog);
  }
  .y2k-ht-img img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1) contrast(1.15);
    mix-blend-mode: multiply;
  }
  .y2k-ht-img__duotone {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: color;
  }
  .y2k-ht-img__duotone--cobalt {
    background: linear-gradient(135deg, var(--cobalt), var(--orange));
  }
  .y2k-ht-img__duotone--ink {
    background: linear-gradient(135deg, var(--ink), var(--pink));
  }
  .y2k-ht-img__dots {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(10,15,31,0.45) 0.9px, transparent 1.1px);
    background-size: 5px 5px;
    mix-blend-mode: multiply;
    opacity: 0.55;
  }
  .y2k-ht-img--torn {
    clip-path: polygon(0% 4%, 3% 0%, 12% 3%, 22% 0%, 35% 4%, 48% 1%, 60% 3%, 72% 0%, 85% 3%, 97% 0%, 100% 5%, 100% 96%, 97% 100%, 85% 97%, 72% 100%, 60% 97%, 48% 100%, 35% 96%, 22% 100%, 12% 97%, 3% 100%, 0% 96%);
  }

  /* ── DotGrid ── */
  .y2k-dotgrid {
    width: 100%;
    height: 80px;
    background-image: radial-gradient(circle, var(--ink) 1.1px, transparent 1.2px);
    background-size: 10px 10px;
    -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 40%, transparent 100%);
    mask-image: linear-gradient(90deg, #000 0%, #000 40%, transparent 100%);
    opacity: 0.55;
    pointer-events: none;
  }

  /* ── MetaStrip ── */
  .y2k-meta {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: var(--y2k-border);
    border-bottom: var(--y2k-border);
    background: var(--paper);
  }
  .y2k-meta__cell {
    padding: 12px 14px;
    border-right: var(--y2k-border);
    min-height: 72px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }
  .y2k-meta__cell:last-child { border-right: 0; }
  .y2k-meta__barcode {
    display: flex;
    align-items: stretch;
    gap: 1px;
    height: 36px;
  }
  .y2k-meta__barcode span {
    display: block;
    background: var(--ink);
    height: 100%;
  }
  .y2k-meta__swatches {
    display: flex;
    gap: 4px;
  }
  .y2k-meta__swatches i {
    width: 16px;
    height: 16px;
    border: 1px solid var(--ink);
    display: block;
  }
  .y2k-meta__caps {
    font-family: var(--y2k-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: 1.4;
    color: var(--ink);
  }
  .y2k-meta__arrows {
    font-family: var(--y2k-font-mono);
    font-size: 14px;
    letter-spacing: 0.2em;
    color: var(--ink);
  }
  .y2k-meta__year {
    font-family: var(--y2k-font-condensed);
    font-size: 28px;
    line-height: 1;
    color: var(--ink);
  }
  @media (max-width: 900px) {
    .y2k-meta { grid-template-columns: 1fr 1fr; }
    .y2k-meta__cell:nth-child(2n) { border-right: 0; }
    .y2k-meta__cell { border-bottom: var(--y2k-border); }
  }

  /* ── Navbar ── */
  .y2k-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--paper);
  }
  .y2k-nav__bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    padding: 14px 24px;
  }
  .y2k-nav__logo {
    font-family: var(--y2k-font-display);
    font-weight: 900;
    font-size: 18px;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--ink);
    justify-self: start;
  }
  .y2k-nav__logo span { color: var(--pink-deep); }
  .y2k-nav__center { justify-self: center; }
  .y2k-nav__year {
    justify-self: end;
    font-family: var(--y2k-font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  .y2k-nav__menu-btn {
    display: none;
    background: none;
    border: var(--y2k-border);
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    justify-self: end;
  }
  .y2k-nav__overlay {
    position: fixed;
    inset: 0;
    background: var(--palette-ink-deep);
    color: var(--palette-paper);
    z-index: 200;
    display: flex;
    flex-direction: column;
    padding: 28px;
    gap: 28px;
  }
  .y2k-nav__overlay a,
  .y2k-nav__overlay button.y2k-nav__link {
    font-family: var(--y2k-font-display);
    font-size: clamp(2.5rem, 12vw, 4.5rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.9;
    background: none;
    border: 0;
    color: var(--palette-paper);
    text-align: left;
    cursor: pointer;
    padding: 0;
  }
  .y2k-nav__close {
    align-self: flex-end;
    font-family: var(--y2k-font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: none;
    border: 1.5px solid var(--palette-paper);
    color: var(--palette-paper);
    padding: 10px 14px;
    cursor: pointer;
  }
  .y2k-nav__actions {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .y2k-theme-toggle {
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: transparent;
    color: var(--ink);
    border: var(--y2k-border);
    border-radius: var(--y2k-radius-pill);
    padding: 6px 12px;
    cursor: pointer;
    line-height: 1;
  }
  .y2k-theme-toggle:focus-visible {
    outline: 2px solid var(--pink);
    outline-offset: 2px;
  }
  .y2k-theme-toggle:hover {
    background: var(--ink);
    color: var(--paper);
  }
  @media (max-width: 767px) {
    .y2k-nav__center,
    .y2k-nav__year { display: none; }
    .y2k-nav__menu-btn { display: inline-flex; align-items: center; justify-content: center; }
    .y2k-nav__bar { grid-template-columns: 1fr auto auto; }
    .y2k-nav__actions { gap: 8px; }
  }

  /* ── Plasma / halftone color wash (reference texture) ── */
  .y2k-plasma {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-color: #1a0a2e;
    background-image:
      radial-gradient(circle, rgba(10,15,31,0.35) 0.7px, transparent 1px),
      url('/y2k-halftone-plasma.jpg'),
      radial-gradient(120% 80% at 20% 30%, #E12963 0%, transparent 55%),
      radial-gradient(90% 70% at 80% 20%, #1B1448 0%, transparent 50%),
      radial-gradient(100% 80% at 60% 85%, #E85018 0%, transparent 55%),
      linear-gradient(145deg, #E12963 0%, #6B1F6E 35%, #1B1448 55%, #E85018 100%);
    background-size:
      5px 5px,
      cover,
      cover,
      cover,
      cover,
      cover;
    background-position:
      center,
      var(--y2k-plasma-pos, center),
      center,
      center,
      center,
      center;
    background-blend-mode: multiply, normal, soft-light, soft-light, soft-light, normal;
  }
  .y2k-plasma--soft { opacity: 0.55; }
  .y2k-plasma--full { opacity: 1; }
  .y2k-plasma--punch { opacity: 1; filter: saturate(1.15) contrast(1.05); }
  .y2k-plasma--veil::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      rgba(10, 15, 31, 0.72) 0%,
      rgba(10, 15, 31, 0.35) 42%,
      rgba(10, 15, 31, 0.15) 100%
    );
  }
  .y2k-root:not([data-theme="dark"]) .y2k-plasma--veil::after {
    background: linear-gradient(
      105deg,
      rgba(237, 234, 226, 0.88) 0%,
      rgba(237, 234, 226, 0.45) 48%,
      rgba(237, 234, 226, 0.12) 100%
    );
  }
  .y2k-plasma-panel {
    position: relative;
    overflow: hidden;
    border: var(--y2k-border);
    min-height: 180px;
    color: var(--palette-paper);
  }
  .y2k-plasma-panel > *:not(.y2k-plasma) {
    position: relative;
    z-index: 1;
  }
  .y2k-btn--plasma {
    background-image: url('/y2k-halftone-plasma.jpg');
    background-size: 220% 220%;
    background-position: 30% 40%;
    color: var(--palette-paper);
    text-shadow: 0 1px 0 rgba(10,15,31,0.45);
    border-color: var(--ink);
  }
  .y2k-btn--plasma:hover:not(:disabled) {
    background-image: url('/y2k-halftone-plasma.jpg');
    filter: brightness(1.08);
    color: var(--palette-paper);
  }
  .y2k-display--plasma {
    background-image: url('/y2k-halftone-plasma.jpg');
    background-size: cover;
    background-position: center;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-stroke: 0;
  }

  /* ── Hero ── */
  .y2k-hero {
    position: relative;
    background: var(--paper);
    padding: clamp(48px, 8vw, 96px) clamp(24px, 6vw, 80px);
    overflow-x: clip;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 28px;
  }
  .y2k-hero--plasma {
    color: var(--ink);
  }
  .y2k-root[data-theme="dark"] .y2k-hero--plasma {
    color: var(--palette-paper);
  }
  .y2k-root[data-theme="dark"] .y2k-hero--plasma .y2k-bracket,
  .y2k-root[data-theme="dark"] .y2k-hero--plasma .y2k-rail {
    color: var(--palette-paper);
  }
  .y2k-root[data-theme="dark"] .y2k-hero--plasma .y2k-display--outline {
    -webkit-text-stroke-color: var(--palette-paper);
  }
  .y2k-hero__plasma-slab {
    position: absolute;
    right: -8%;
    top: 8%;
    width: min(58vw, 520px);
    height: min(70vh, 560px);
    border: var(--y2k-border);
    overflow: hidden;
    z-index: 1;
    box-shadow: var(--y2k-shadow);
    border-radius: 0;
  }
  .y2k-root[data-theme="dark"] .y2k-hero__plasma-slab {
    inset: 0;
    width: auto;
    height: auto;
    right: 0;
    top: 0;
    border: 0;
    box-shadow: none;
    border-radius: 0;
  }
  .y2k-hero__ring-wrap {
    position: absolute;
    right: 8%;
    top: 18%;
    width: min(42vw, 340px);
    height: min(42vw, 340px);
    pointer-events: none;
  }
  .y2k-hero__cta { display: flex; flex-wrap: wrap; gap: 12px; }
  .y2k-hero__content { position: relative; z-index: 2; max-width: 920px; }

  /* ── PosterCard ── */
  .y2k-poster {
    border: var(--y2k-border);
    background: var(--paper);
    display: flex;
    flex-direction: column;
    box-shadow: var(--y2k-shadow);
  }
  .y2k-poster__header {
    font-family: var(--y2k-font-stencil);
    font-weight: 800;
    font-size: 18px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 12px 16px;
    border-bottom: var(--y2k-border);
    background: var(--fog);
    color: var(--ink);
  }
  .y2k-poster__header--pink {
    background: var(--pink);
    color: var(--paper);
    border-bottom-color: var(--ink);
  }
  .y2k-poster__media {
    aspect-ratio: 4 / 3;
    background: var(--fog);
    overflow: hidden;
  }
  .y2k-poster__footer {
    display: flex;
    align-items: stretch;
    border-top: var(--y2k-border);
    font-family: var(--y2k-font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .y2k-poster__meta {
    flex: 1;
    padding: 10px 12px;
    border-right: var(--y2k-border);
  }
  .y2k-poster__meta:last-child { border-right: 0; }

  /* ── Section ── */
  .y2k-section {
    position: relative;
    padding: clamp(40px, 7vw, 88px) clamp(24px, 6vw, 80px);
    overflow-x: clip;
  }
  .y2k-section--paper { background: var(--paper); color: var(--ink); }
  .y2k-section--cream { background: var(--cream); color: var(--ink); }
  .y2k-section--ink { background: var(--ink); color: var(--paper); }
  .y2k-section--ink .y2k-bracket,
  .y2k-section--ink .y2k-pill,
  .y2k-section--ink .y2k-rail,
  .y2k-section--ink .y2k-rule__label { color: var(--paper); }
  .y2k-section--ink .y2k-pill { border-color: var(--paper); }
  .y2k-section--ink .y2k-rule,
  .y2k-section--ink .y2k-rule--labelled::before,
  .y2k-section--ink .y2k-rule--labelled::after { background: var(--paper); }
  /* Inverse ink blocks stay navy even in dark mode */
  .y2k-root[data-theme="dark"] .y2k-section--ink {
    background: var(--palette-ink);
    color: var(--palette-paper);
  }
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-bracket,
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-pill,
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-rail,
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-rule__label {
    color: var(--palette-paper);
  }
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-pill {
    border-color: var(--palette-paper);
  }
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-rule,
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-rule--labelled::before,
  .y2k-root[data-theme="dark"] .y2k-section--ink .y2k-rule--labelled::after {
    background: var(--palette-paper);
  }
  .y2k-section--pink { background: var(--pink); color: var(--paper); }
  .y2k-section--pink .y2k-bracket,
  .y2k-section--pink .y2k-rail { color: var(--paper); }
  .y2k-section--plasma {
    background: var(--palette-ink-deep);
    color: var(--palette-paper);
    isolation: isolate;
  }
  .y2k-section--plasma .y2k-bracket,
  .y2k-section--plasma .y2k-rail,
  .y2k-section--plasma .y2k-sg__h2,
  .y2k-section--plasma .y2k-sg__lead {
    color: var(--palette-paper);
  }
  .y2k-section--plasma .y2k-sg__lead { opacity: 0.9; }
  .y2k-section--plasma > .y2k-plasma { z-index: 0; }
  .y2k-section--plasma > *:not(.y2k-plasma):not(.y2k-section__num):not(.y2k-rail) {
    position: relative;
    z-index: 1;
  }
  .y2k-section--plasma .y2k-btn--ghost {
    color: var(--palette-paper);
    border-color: var(--palette-paper);
  }
  .y2k-section--plasma .y2k-btn--ghost:hover:not(:disabled) {
    background: var(--palette-paper);
    color: var(--palette-ink-deep);
  }
  .y2k-poster__header--plasma {
    background-image:
      linear-gradient(rgba(10,15,31,0.25), rgba(10,15,31,0.25)),
      url('/y2k-halftone-plasma.jpg');
    background-size: cover;
    background-position: center;
    color: var(--palette-paper);
    border-bottom-color: var(--ink);
  }
  .y2k-section__num {
    font-family: var(--y2k-font-condensed);
    font-size: clamp(4rem, 10vw, 7rem);
    line-height: 0.85;
    opacity: 0.18;
    position: absolute;
    top: 16px;
    right: 24px;
    pointer-events: none;
  }

  /* ── Footer ── */
  .y2k-footer {
    background: var(--paper);
    color: var(--ink);
  }
  .y2k-footer__links {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 28px;
    padding: 28px clamp(24px, 6vw, 80px);
    font-family: var(--y2k-font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .y2k-footer__links a:hover { color: var(--cobalt); }

  /* ── Sticker badge (creative) ── */
  .y2k-sticker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--y2k-font-stencil);
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--orange);
    color: var(--ink-deep);
    border: var(--y2k-border);
    padding: 10px 14px;
    transform: rotate(-6deg);
    box-shadow: var(--y2k-shadow);
    white-space: nowrap;
  }

  /* ── Mono ticker (creative) ── */
  .y2k-ticker {
    overflow: hidden;
    border-top: var(--y2k-border);
    border-bottom: var(--y2k-border);
    background-color: var(--palette-ink-deep);
    background-image:
      linear-gradient(rgba(10,15,31,0.55), rgba(10,15,31,0.55)),
      url('/y2k-halftone-plasma.jpg');
    background-size: cover;
    background-position: 50% 40%;
    color: var(--palette-paper);
    padding: 8px 0;
  }
  .y2k-ticker__track {
    display: flex;
    width: max-content;
    gap: 48px;
    animation: y2k-ticker 28s linear infinite;
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  @keyframes y2k-ticker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* ── Style guide layout ── */
  .y2k-sg {
    padding-bottom: 80px;
  }
  .y2k-sg__block {
    padding: clamp(28px, 5vw, 56px) clamp(24px, 6vw, 80px);
  }
  .y2k-sg__h2 {
    font-family: var(--y2k-font-display);
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.95;
    margin: 0 0 8px;
  }
  .y2k-sg__lead {
    font-size: 15px;
    line-height: 1.55;
    max-width: 62ch;
    margin: 0 0 28px;
    color: var(--ink);
  }
  .y2k-sg__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  .y2k-sg__swatch {
    border: var(--y2k-border);
    background: var(--paper);
  }
  .y2k-sg__chip {
    height: 72px;
    border-bottom: var(--y2k-border);
  }
  .y2k-sg__meta {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .y2k-sg__name {
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .y2k-sg__hex {
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    color: var(--cobalt);
  }
  .y2k-sg__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;
  }
  .y2k-sg__stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .y2k-sg__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
  .y2k-sg__window {
    border: var(--y2k-border);
    border-radius: var(--y2k-radius-window);
    overflow: hidden;
    background: var(--fog);
    min-height: 160px;
  }
  .y2k-sg__note {
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 8px;
    opacity: 0.7;
  }
  .y2k-sg__type-sample {
    margin-bottom: 18px;
  }
  .y2k-sg__type-label {
    font-family: var(--y2k-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
    color: var(--cobalt);
  }

  @media (prefers-reduced-motion: reduce) {
    .y2k-root *,
    .y2k-root *::before,
    .y2k-root *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;
