/** Groovy Halftone — tokens, components, motion. Consumed via styles.js. */
export const groovyCss = `
  /* ── Tokens ── */
  :root {
    --ink: #2D2B2C;
    --ink-soft: #3A3638;
    --cream: #F6EBD9;
    --cream-light: #FAF4E7;
    --sand: #D5C4AB;

    --marigold: #FCC56D;
    --peach: #F7A77C;
    --coral: #EE685E;
    --lavender: #B7A6E8;
    --periwinkle: #7F7BD6;

    --indigo: #391767;
    --violet: #6F268B;
    --magenta: #C51CBA;
    --hot-pink: #D63391;
    --orange: #E47750;

    --success: #2F6B4F;
    --warning: #B86A1A;
    --error: #9B2C3A;

    --bg-night: var(--ink);
    --bg-paper: var(--cream);
    --text-on-paper: var(--ink);
    --text-on-night: var(--cream);
    --primary: var(--coral);
    --focus-ring: var(--marigold);

    --font-display: 'Fraunces', Georgia, serif;
    --font-accent: 'Shrikhand', 'Fraunces', cursive;
    --font-body: 'Poppins', system-ui, sans-serif;

    --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);
    --dur-fast: 160ms;
    --dur-ui: 220ms;
    --dur-deco: 700ms;

    --border-chunky: 2.5px solid var(--ink);
    --shadow-hard: 4px 4px 0 var(--ink);
    --radius-card: 24px;
    --radius-pill: 999px;

    --gh-dot-size: 5px;
    --gh-dot-intensity: 0.35;
  }

  .gh-sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  .gh-display {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1, "opsz" 144;
    line-height: 0.95;
    letter-spacing: -0.03em;
  }

  .gh-accent-word {
    font-family: var(--font-accent);
    font-weight: 400;
    letter-spacing: 0;
  }

  .gh-display-shadow {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1, "opsz" 144;
    line-height: 0.95;
    letter-spacing: -0.03em;
    color: var(--cream);
    position: relative;
    text-shadow:
      3px 3px 0 var(--coral),
      6px 6px 0 var(--marigold),
      9px 9px 0 var(--lavender);
  }

  /* ── Motion system ── */
  .gh-page-enter {
    animation: ghPageIn var(--dur-deco) var(--ease-bounce) both;
  }

  @keyframes ghPageIn {
    from { opacity: 0; transform: translateY(18px) scale(0.985); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .gh-reveal {
    opacity: 0;
    transform: translateY(22px);
    transition:
      opacity var(--dur-deco) var(--ease-bounce),
      transform var(--dur-deco) var(--ease-bounce);
  }
  .gh-reveal.gh-reveal--in,
  .gh-hero .gh-reveal {
    opacity: 1;
    transform: none;
  }
  .gh-hero .gh-reveal {
    animation: ghPageIn 0.75s var(--ease-bounce) both;
  }

  .gh-parallax {
    will-change: transform;
    transition: transform 80ms linear;
  }

  .gh-drift {
    animation: ghDrift 8s ease-in-out infinite alternate;
  }
  @keyframes ghDrift {
    from { transform: translate3d(-6px, 0, 0) rotate(-1deg); }
    to   { transform: translate3d(8px, -6px, 0) rotate(1.5deg); }
  }

  .gh-twinkle {
    position: absolute;
    animation: ghTwinkle 2.4s ease-in-out infinite;
    opacity: 0.55;
  }
  @keyframes ghTwinkle {
    0%, 100% { opacity: 0.25; transform: scale(0.85); }
    50%      { opacity: 1; transform: scale(1.1); }
  }

  /* ── Halftone surface ── */
  .gh-halftone {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    background: var(--indigo);
    color: var(--cream);
  }
  .gh-halftone--rounded { border-radius: var(--radius-card); }
  .gh-halftone__blobs,
  .gh-halftone__dots {
    position: absolute; inset: 0; pointer-events: none;
  }
  .gh-halftone__blobs {
    background:
      radial-gradient(ellipse 55% 50% at 15% 20%, var(--violet) 0%, transparent 70%),
      radial-gradient(ellipse 50% 55% at 75% 15%, var(--magenta) 0%, transparent 65%),
      radial-gradient(ellipse 45% 50% at 85% 70%, var(--hot-pink) 0%, transparent 65%),
      radial-gradient(ellipse 55% 45% at 40% 85%, var(--orange) 0%, transparent 70%),
      radial-gradient(ellipse 40% 35% at 55% 95%, var(--marigold) 0%, transparent 70%),
      linear-gradient(160deg, var(--indigo), var(--violet));
    z-index: 0;
  }
  .gh-halftone__dots {
    z-index: 1;
    background-image: radial-gradient(
      circle,
      rgba(45, 43, 44, var(--gh-dot-intensity)) 1.1px,
      transparent 1.25px
    );
    background-size: var(--gh-dot-size) var(--gh-dot-size);
    background-repeat: repeat;
    mix-blend-mode: multiply;
    opacity: 0.9;
  }
  .gh-halftone__content {
    position: relative;
    z-index: 2;
  }

  /* ── Button ── */
  .gh-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 14px;
    line-height: 1.2;
    padding: 11px 22px;
    border-radius: var(--radius-pill);
    border: var(--border-chunky);
    box-shadow: var(--shadow-hard);
    cursor: pointer;
    transition:
      transform var(--dur-fast) var(--ease-bounce),
      box-shadow var(--dur-fast) var(--ease-bounce),
      background var(--dur-ui) ease,
      color var(--dur-ui) ease;
    -webkit-tap-highlight-color: transparent;
  }
  .gh-btn:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 3px;
  }
  .gh-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--ink);
  }
  .gh-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--ink);
  }
  .gh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--sand) !important;
    color: var(--ink) !important;
  }
  .gh-btn--primary { background: var(--coral); color: var(--ink); }
  .gh-btn--secondary { background: var(--cream); color: var(--ink); }
  .gh-btn--ghost-on-dark {
    background: transparent;
    color: var(--cream);
    border-color: var(--cream);
    box-shadow: 4px 4px 0 rgba(246, 235, 217, 0.25);
  }
  .gh-btn--ghost-on-dark:hover:not(:disabled) {
    box-shadow: 6px 6px 0 rgba(246, 235, 217, 0.35);
  }
  .gh-btn--halftone {
    color: var(--cream);
    border-color: var(--ink);
    background:
      radial-gradient(circle at 20% 30%, var(--magenta), transparent 50%),
      radial-gradient(circle at 80% 70%, var(--orange), transparent 50%),
      linear-gradient(120deg, var(--indigo), var(--hot-pink), var(--marigold));
    text-shadow: 0 1px 0 rgba(45,43,44,0.35);
  }
  .gh-btn--danger {
    background: var(--cream);
    color: var(--error);
    border-color: var(--error);
    box-shadow: 4px 4px 0 var(--error);
  }

  /* ── Badge ── */
  .gh-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    border: 2px solid var(--ink);
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .gh-badge--coral { background: var(--coral); }
  .gh-badge--marigold { background: var(--marigold); }
  .gh-badge--lavender { background: var(--lavender); }
  .gh-badge--peach { background: var(--peach); }
  .gh-badge--periwinkle { background: var(--periwinkle); color: var(--cream); }
  .gh-badge--sand { background: var(--sand); }

  /* ── Card ── */
  .gh-card {
    background: var(--cream-light);
    color: var(--ink);
    border: var(--border-chunky);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-hard);
    overflow: hidden;
    transition:
      transform var(--dur-ui) var(--ease-bounce),
      box-shadow var(--dur-ui) var(--ease-bounce);
  }
  .gh-card:hover {
    transform: translate(-2px, -3px) rotate(-1deg);
    box-shadow: 7px 8px 0 var(--ink);
  }
  .gh-card__band { height: 12px; border-bottom: var(--border-chunky); }
  .gh-card__band--marigold { background: var(--marigold); }
  .gh-card__band--peach { background: var(--peach); }
  .gh-card__band--coral { background: var(--coral); }
  .gh-card__band--lavender { background: var(--lavender); }
  .gh-card__band--periwinkle { background: var(--periwinkle); }
  .gh-card__title {
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 1.25rem;
    padding: 18px 20px 0;
    letter-spacing: -0.02em;
  }
  .gh-card__body { padding: 18px 20px 22px; font-family: var(--font-body); font-size: 14px; line-height: 1.55; }
  .gh-card--featured {
    border: var(--border-chunky);
    color: var(--cream);
    background: transparent;
    position: relative;
  }
  .gh-card--featured .gh-card__body,
  .gh-card--featured .gh-card__title { position: relative; z-index: 2; }
  .gh-card--featured::before {
    content: "";
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 55% 50% at 20% 20%, var(--violet), transparent 70%),
      radial-gradient(ellipse 50% 50% at 80% 30%, var(--magenta), transparent 65%),
      radial-gradient(ellipse 50% 45% at 60% 90%, var(--orange), transparent 70%),
      linear-gradient(145deg, var(--indigo), var(--hot-pink));
  }
  .gh-card--featured::after {
    content: "";
    position: absolute; inset: 0; z-index: 1;
    background-image: radial-gradient(circle, rgba(45,43,44,0.4) 1.1px, transparent 1.25px);
    background-size: 5px 5px;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  /* ── Form controls ── */
  .gh-field { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-body); }
  .gh-field__label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
    text-transform: uppercase; color: var(--ink);
  }
  .gh-input, .gh-select {
    width: 100%;
    padding: 11px 14px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--ink);
    background: var(--cream);
    border: var(--border-chunky);
    border-radius: 14px;
    outline: none;
    transition: box-shadow var(--dur-fast) ease, border-color var(--dur-fast) ease;
  }
  .gh-input:focus, .gh-select:focus {
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-color: var(--ink);
  }
  .gh-select { cursor: pointer; appearance: none; }

  .gh-check {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--font-body); font-size: 14px; color: var(--ink); cursor: pointer;
  }
  .gh-check__input { position: absolute; opacity: 0; width: 0; height: 0; }
  .gh-check__box {
    width: 22px; height: 22px; border: var(--border-chunky); border-radius: 6px;
    background: var(--cream); display: grid; place-items: center;
    transition: background var(--dur-fast) var(--ease-bounce), transform var(--dur-fast) var(--ease-bounce);
  }
  .gh-check__input:checked + .gh-check__box {
    background: var(--coral);
  }
  .gh-check__input:checked + .gh-check__box::after {
    content: "";
    width: 6px; height: 11px;
    border: solid var(--ink);
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(45deg) translate(-1px, -1px);
  }
  .gh-check__input:focus-visible + .gh-check__box {
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  .gh-toggle {
    display: inline-flex; align-items: center; gap: 12px;
    font-family: var(--font-body); font-size: 14px; color: var(--ink); cursor: pointer;
  }
  .gh-toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
  .gh-toggle__track {
    width: 52px; height: 28px; border-radius: var(--radius-pill);
    border: var(--border-chunky); background: var(--sand);
    position: relative; transition: background var(--dur-ui) var(--ease-bounce);
  }
  .gh-toggle__knob {
    position: absolute; top: 2px; left: 2px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--cream-light); border: 2px solid var(--ink);
    display: grid; place-items: center;
    transition: transform var(--dur-ui) var(--ease-bounce), background var(--dur-ui) ease;
  }
  .gh-toggle__needle {
    width: 8px; height: 2.5px; background: var(--coral);
    transform-origin: left center; transform: rotate(-35deg);
    border-radius: 2px;
  }
  .gh-toggle__input:checked + .gh-toggle__track { background: var(--marigold); }
  .gh-toggle__input:checked + .gh-toggle__track .gh-toggle__knob {
    transform: translateX(24px);
  }
  .gh-toggle__input:focus-visible + .gh-toggle__track {
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  /* ── Marquee ── */
  .gh-marquee {
    background: var(--cream);
    color: var(--ink);
    border-bottom: var(--border-chunky);
    overflow: hidden;
    height: 34px;
    display: flex; align-items: center;
  }
  .gh-marquee__track {
    display: flex; width: max-content;
    animation: ghMarquee 28s linear infinite;
  }
  .gh-marquee:hover .gh-marquee__track { animation-play-state: paused; }
  .gh-marquee__group {
    display: flex; align-items: center; gap: 18px;
    padding-right: 18px;
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    white-space: nowrap;
  }
  @keyframes ghMarquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* ── Navbar ── */
  .gh-nav {
    position: sticky; top: 0; z-index: 200;
    background: var(--ink);
    color: var(--cream);
    border-bottom: var(--border-chunky);
    transition: background var(--dur-ui) ease, backdrop-filter var(--dur-ui) ease;
  }
  .gh-nav--scrolled {
    background: rgba(45, 43, 44, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .gh-nav__inner {
    max-width: 1200px; margin: 0 auto;
    padding: 0 20px; height: 60px;
    display: flex; align-items: center; gap: 16px;
  }
  .gh-nav__left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .gh-nav__logo {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-display); font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 18px; color: var(--cream); letter-spacing: -0.02em;
  }
  .gh-nav__brand .gh-accent-word { color: var(--coral); }
  .gh-nav__divider { width: 2px; height: 18px; background: var(--ink-soft); }
  .gh-nav__title { font-size: 13px; color: var(--sand); font-family: var(--font-body); }
  .gh-nav__back {
    background: none; border: none; color: var(--sand); cursor: pointer;
    font-family: var(--font-body); font-size: 13px; padding: 6px 8px;
    border-radius: 8px;
  }
  .gh-nav__back:hover { color: var(--cream); }
  .gh-nav__links {
    display: flex; gap: 6px; margin: 0 auto; flex-wrap: wrap; justify-content: center;
  }
  .gh-nav__link {
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    color: var(--sand); padding: 6px 12px; border-radius: var(--radius-pill);
    transition: color var(--dur-fast) ease, background var(--dur-fast) ease;
  }
  .gh-nav__link:hover { color: var(--cream); background: var(--ink-soft); }
  .gh-nav__actions { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .gh-nav .gh-btn { padding: 8px 16px; font-size: 13px; }

  /* ── Hero ── */
  .gh-hero {
    position: relative;
    background: var(--bg-night);
    color: var(--text-on-night);
    min-height: 70vh;
    padding: 72px 24px 100px;
    overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
  }
  .gh-hero__stars { position: absolute; inset: 0; pointer-events: none; }
  .gh-hero__glow {
    position: absolute; width: min(520px, 90vw); height: min(520px, 90vw);
    top: 42%; left: 50%; transform: translate(-50%, -55%);
    pointer-events: none; border-radius: 50%; overflow: hidden;
    opacity: 0.85; filter: saturate(1.1);
  }
  .gh-hero__glow-surface { width: 100%; height: 100%; border-radius: 50%; }
  .gh-hero__glow-surface .gh-halftone__content { display: none; }
  .gh-hero__content { position: relative; z-index: 2; max-width: 720px; }
  .gh-hero__eyebrow {
    font-family: var(--font-body); font-size: 12px; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--marigold);
    margin-bottom: 16px;
  }
  .gh-hero__title { font-size: clamp(48px, 9vw, 88px); margin-bottom: 18px; }
  .gh-hero__sub {
    font-family: var(--font-body); font-size: 16px; font-weight: 400;
    color: var(--sand); max-width: 420px; margin: 0 auto 28px; line-height: 1.55;
  }
  .gh-hero__cta { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }

  /* ── Section divider ── */
  .gh-divider { line-height: 0; width: 100%; }
  .gh-divider__svg { display: block; width: 100%; height: 64px; }
  .gh-divider__svg--flip { transform: scaleY(-1); }

  /* ── Footer ── */
  .gh-footer { border-top: var(--border-chunky); }
  .gh-footer__surface { padding: 56px 24px 40px; }
  .gh-footer__inner { max-width: 900px; margin: 0 auto; text-align: center; }
  .gh-footer__headline {
    font-family: var(--font-display); font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: clamp(28px, 5vw, 48px); line-height: 1; letter-spacing: -0.02em;
    color: var(--cream); margin-bottom: 24px;
    display: inline-flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center;
  }
  .gh-footer__links { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
  .gh-footer__link {
    font-family: var(--font-body); font-weight: 500; font-size: 14px; color: var(--cream);
    text-decoration: underline; text-underline-offset: 4px;
  }
  .gh-footer__link:hover { color: var(--marigold); }

  /* ── States ── */
  .gh-skeleton {
    background: var(--sand);
    border-radius: 10px;
    position: relative; overflow: hidden;
  }
  .gh-skeleton::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(250,244,231,0.55), transparent);
    animation: ghShimmer 1.4s ease-in-out infinite;
  }
  @keyframes ghShimmer {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
  .gh-skeleton-stack { display: flex; flex-direction: column; gap: 10px; width: min(320px, 100%); margin-top: 16px; }
  .gh-spinner {
    position: relative; width: 48px; height: 48px;
    display: grid; place-items: center;
  }
  .gh-spinner__sparkle { animation: ghSpinSparkle 1.1s var(--ease-bounce) infinite; }
  .gh-spinner__sparkle--inner {
    position: absolute; animation-direction: reverse; animation-duration: 0.9s;
  }
  @keyframes ghSpinSparkle {
    0% { transform: rotate(0deg) scale(0.9); }
    50% { transform: rotate(180deg) scale(1.15); }
    100% { transform: rotate(360deg) scale(0.9); }
  }
  .gh-state {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: 10px; padding: 40px 20px; font-family: var(--font-body); color: var(--ink);
  }
  .gh-state__title {
    font-family: var(--font-display); font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 1.35rem; letter-spacing: -0.02em;
  }
  .gh-state__msg { color: #5a524c; font-size: 14px; max-width: 360px; line-height: 1.5; }
  .gh-state__error-mark {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--error); color: var(--cream);
    display: grid; place-items: center;
    font-family: var(--font-display); font-weight: 900; font-size: 22px;
    border: var(--border-chunky);
  }
  .gh-state--error {
    background: #F8E4E2; border: var(--border-chunky); border-radius: var(--radius-card);
  }

  /* ── Style guide layout ── */
  .sg-page { background: var(--cream); color: var(--ink); min-height: 100vh; font-family: var(--font-body); }
  .sg-section { padding: 48px 24px; max-width: 1100px; margin: 0 auto; }
  .sg-section--night { background: var(--ink); color: var(--cream); max-width: none; padding: 56px 24px; }
  .sg-section--night > .sg-inner { max-width: 1100px; margin: 0 auto; }
  .sg-h2 {
    font-family: var(--font-display); font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: clamp(28px, 4vw, 40px); line-height: 1; letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .sg-lead { font-size: 15px; color: #5a524c; margin-bottom: 28px; max-width: 560px; line-height: 1.55; }
  .sg-section--night .sg-lead { color: var(--sand); }
  .sg-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  .sg-swatch {
    border: var(--border-chunky); border-radius: 16px; overflow: hidden;
    box-shadow: 3px 3px 0 var(--ink); background: var(--cream-light);
  }
  .sg-swatch__chip { height: 72px; }
  .sg-swatch__meta { padding: 10px 12px; font-size: 12px; }
  .sg-swatch__name { font-weight: 600; display: block; }
  .sg-swatch__hex { color: #6b625a; font-variant-numeric: tabular-nums; }
  .sg-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 16px; }
  .sg-pair {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
  @media (max-width: 768px) {
    .sg-pair { grid-template-columns: 1fr; }
    .gh-nav__links { display: none; }
    .gh-hero { min-height: 60vh; padding: 56px 16px 80px; }
    .gh-hero__stars .gh-twinkle:nth-child(n+6) { display: none; }
    .gh-card:hover { transform: translate(-1px, -2px) rotate(0); }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .gh-page-enter,
    .gh-hero .gh-reveal,
    .gh-twinkle,
    .gh-drift,
    .gh-spinner__sparkle,
    .gh-skeleton::after {
      animation: none !important;
    }
    .gh-marquee__track { animation: none !important; transform: none !important; }
    .gh-reveal {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
    .gh-parallax { transform: none !important; transition: none !important; }
    .gh-btn { transition: none; }
    .gh-btn:hover:not(:disabled),
    .gh-btn:active:not(:disabled) {
      transform: none;
      box-shadow: var(--shadow-hard);
    }
    .gh-card:hover { transform: none; }
  }
`;
