/** Groovy remaps for legacy class names used by existing pages. */
export const legacyGroovyCss = `
  body {
    font-family: var(--font-body);
    background: var(--bg-night);
    color: var(--text-on-night);
  }

  /* ── Landing / login night surface ── */
  .landing-signin-btn {
    position: absolute; top: 24px; right: 28px;
    background: transparent;
    border: var(--border-chunky);
    border-color: var(--cream);
    border-radius: var(--radius-pill);
    padding: 10px 22px;
    color: var(--cream);
    font-size: 13px; font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer;
    box-shadow: 4px 4px 0 rgba(246,235,217,0.25);
    transition: transform var(--dur-fast) var(--ease-bounce), box-shadow var(--dur-fast) var(--ease-bounce);
    letter-spacing: 0.02em;
  }
  .landing-signin-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 rgba(246,235,217,0.35);
    color: var(--cream);
    background: var(--ink-soft);
  }
  .landing {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 90% 70% at 50% 110%, rgba(228,119,80,0.45), transparent 55%),
      radial-gradient(ellipse 80% 55% at 50% 75%, rgba(214,51,145,0.28), transparent 60%),
      radial-gradient(ellipse 70% 45% at 50% 35%, rgba(183,166,232,0.18), transparent 65%),
      var(--bg-night);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative; overflow: hidden; padding: 24px;
  }
  .landing::before {
    content: '';
    position: absolute;
    width: min(720px, 110vw); height: min(720px, 110vw);
    background:
      radial-gradient(ellipse 50% 45% at 50% 85%, var(--marigold) 0%, transparent 55%),
      radial-gradient(ellipse 55% 50% at 35% 55%, var(--orange) 0%, transparent 65%),
      radial-gradient(ellipse 50% 50% at 65% 45%, var(--hot-pink) 0%, transparent 60%),
      radial-gradient(ellipse 45% 40% at 50% 20%, rgba(246,235,217,0.55) 0%, transparent 70%),
      radial-gradient(ellipse 40% 35% at 50% 10%, rgba(183,166,232,0.35) 0%, transparent 70%);
    opacity: 0.72;
    top: 48%; left: 50%;
    transform: translate(-50%, -42%);
    pointer-events: none;
    border-radius: 50%;
    filter: saturate(1.12);
    animation: landingGlowWave 10s ease-in-out infinite alternate;
    z-index: 0;
  }
  .landing::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle, rgba(246,235,217,0.55) 0.7px, transparent 0.85px),
      radial-gradient(circle, rgba(45,43,44,0.35) 0.55px, transparent 0.7px);
    background-size: 5px 5px, 7px 7px;
    background-position: 0 0, 2px 3px;
    opacity: 0.28;
    mix-blend-mode: soft-light;
    z-index: 0;
  }

  /* Grainy orange→pink→cream heatmap field */
  .landing-waves {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .landing-waves__heat {
    position: absolute;
    left: 50%;
    bottom: -22%;
    transform: translateX(-50%);
    border-radius: 50%;
    filter: blur(36px);
    will-change: transform, opacity;
  }
  .landing-waves__heat--base {
    width: min(1100px, 160vw);
    height: min(820px, 105vh);
    background:
      radial-gradient(ellipse 55% 50% at 50% 78%, rgba(228,119,80,0.95) 0%, transparent 62%),
      radial-gradient(ellipse 50% 45% at 50% 55%, rgba(214,51,145,0.7) 0%, transparent 65%),
      radial-gradient(ellipse 45% 40% at 50% 28%, rgba(183,166,232,0.45) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 50% 8%, rgba(246,235,217,0.35) 0%, transparent 75%);
    animation: landingWashWave 12s ease-in-out infinite alternate;
    opacity: 0.95;
  }
  .landing-waves__heat--hot {
    width: min(720px, 110vw);
    height: min(560px, 75vh);
    bottom: -8%;
    background:
      radial-gradient(ellipse 50% 48% at 50% 70%, rgba(252,197,109,0.9) 0%, transparent 55%),
      radial-gradient(ellipse 48% 45% at 42% 48%, rgba(238,104,94,0.7) 0%, transparent 60%),
      radial-gradient(ellipse 45% 42% at 60% 40%, rgba(214,51,145,0.55) 0%, transparent 62%);
    animation: landingWashWave 9.5s ease-in-out infinite alternate-reverse;
    animation-delay: 0.6s;
    opacity: 0.88;
  }
  .landing-waves__heat--core {
    width: min(420px, 70vw);
    height: min(360px, 48vh);
    bottom: 2%;
    background: radial-gradient(ellipse 50% 50% at 50% 55%, rgba(252,197,109,0.95) 0%, rgba(228,119,80,0.5) 40%, transparent 70%);
    animation: landingWashWave 8s ease-in-out infinite alternate;
    animation-delay: 1.1s;
    opacity: 0.9;
    filter: blur(22px);
  }
  .landing-waves__svg {
    position: absolute;
    left: 50%;
    bottom: -10%;
    width: min(1000px, 155vw);
    height: min(860px, 115vh);
    transform: translateX(-50%);
    overflow: visible;
    opacity: 0.85;
  }
  .landing-waves__heatmap {
    transform-origin: 50% 100%;
  }
  .landing-waves__ridge {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation-name: landingRidgeWave;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
  .landing-waves__dots { pointer-events: none; }
  .landing-waves__grain {
    position: absolute;
    inset: -10%;
    pointer-events: none;
    opacity: 0.42;
    mix-blend-mode: multiply;
    background-image:
      radial-gradient(circle, rgba(45,43,44,0.65) 0.55px, transparent 0.7px),
      radial-gradient(circle, rgba(45,43,44,0.4) 0.45px, transparent 0.6px),
      radial-gradient(circle, rgba(246,235,217,0.25) 0.4px, transparent 0.55px);
    background-size: 3px 3px, 5px 5px, 4px 4px;
    background-position: 0 0, 1px 2px, 2px 1px;
    animation: landingGrainDrift 14s linear infinite;
  }

  @keyframes landingRidgeWave {
    0%   { transform: translateY(8px) scaleX(0.99) scaleY(0.985); }
    50%  { transform: translateY(-14px) scaleX(1.03) scaleY(1.02); }
    100% { transform: translateY(-2px) scaleX(1.01) scaleY(1.005); }
  }
  @keyframes landingWashWave {
    from { transform: translateX(-50%) translateY(14px) scale(0.97); opacity: 0.78; }
    to   { transform: translateX(-50%) translateY(-20px) scale(1.05); opacity: 1; }
  }
  @keyframes landingGlowWave {
    from { transform: translate(-50%, -40%) scale(0.96); opacity: 0.62; }
    to   { transform: translate(-50%, -46%) scale(1.06); opacity: 0.82; }
  }
  @keyframes landingGrainDrift {
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(-6px, 8px, 0); }
  }
  .landing-logo {
    display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
    animation: ghPageIn 0.7s var(--ease-bounce) both;
    position: relative; z-index: 1;
  }
  .landing-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1, "opsz" 144;
    font-size: clamp(40px, 8vw, 56px);
    letter-spacing: -0.03em; line-height: 0.95;
    color: var(--cream);
    text-shadow: 3px 3px 0 var(--coral), 6px 6px 0 var(--marigold), 9px 9px 0 var(--lavender);
  }
  .landing-title span {
    font-family: var(--font-accent);
    color: var(--coral);
    text-shadow: none;
  }
  .landing-tagline {
    color: var(--sand); font-size: 15px; font-weight: 400;
    letter-spacing: 0.02em; margin-bottom: 48px;
    animation: ghPageIn 0.7s 0.08s var(--ease-bounce) both;
    text-align: center; max-width: 420px; line-height: 1.5;
    position: relative; z-index: 1;
  }
  .landing-cards {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
    animation: ghPageIn 0.7s 0.14s var(--ease-bounce) both;
    position: relative; z-index: 1;
  }
  .landing-card {
    width: 220px; padding: 28px 22px;
    border: var(--border-chunky);
    border-radius: var(--radius-card);
    background: var(--cream-light);
    color: var(--ink);
    cursor: pointer;
    transition: transform var(--dur-ui) var(--ease-bounce), box-shadow var(--dur-ui) var(--ease-bounce);
    display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
    box-shadow: var(--shadow-hard);
    position: relative; overflow: hidden;
  }
  .landing-card::before { display: none; }
  .landing-card:hover {
    transform: translate(-2px, -3px) rotate(-1deg);
    box-shadow: 7px 8px 0 var(--ink);
    border-color: var(--ink);
  }
  .card-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--cream);
    border: var(--border-chunky);
    display: flex; align-items: center; justify-content: center;
    color: var(--ink);
  }
  .card-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 15px; color: var(--ink); letter-spacing: -0.02em;
  }
  .card-desc { font-size: 12px; color: #5a524c; line-height: 1.5; }
  .landing-info-link {
    margin-top: 40px; background: none; border: none;
    color: var(--sand); font-size: 13px; cursor: pointer;
    font-family: var(--font-body); letter-spacing: 0.03em;
    transition: color 0.2s; text-decoration: underline; text-underline-offset: 3px;
    position: relative; z-index: 1;
  }
  .landing-info-link:hover { color: var(--marigold); }

  .landing-user-chip {
    position: absolute; top: 20px; right: 24px; z-index: 2;
    display: flex; align-items: center; gap: 10px;
    background: var(--ink-soft);
    border: var(--border-chunky);
    border-color: var(--cream);
    border-radius: var(--radius-pill);
    padding: 6px 16px 6px 6px;
  }
  .landing-user-chip__avatar {
    width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--ink);
  }
  .landing-user-chip__fallback {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--coral); color: var(--ink);
    border: 2px solid var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
  }
  .landing-user-chip__name {
    font-size: 13px; color: var(--cream); font-weight: 500;
    max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .landing-user-chip__out {
    background: none; border: none; color: var(--sand);
    font-size: 12px; cursor: pointer; font-family: var(--font-body); padding: 0 0 0 4px;
  }
  .landing-user-chip__out:hover { color: var(--marigold); }
  .landing-card--featured { background: var(--cream); }
  .card-icon--ai {
    background: var(--marigold) !important;
    font-size: 18px; color: var(--ink);
  }

  .auth-card {
    position: relative; z-index: 1;
    background: var(--cream-light);
    color: var(--ink);
    border: var(--border-chunky);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-hard);
    padding: 28px 32px;
    width: min(340px, 92vw);
    text-align: center;
  }
  .auth-card-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 1.6rem; margin-bottom: 8px; letter-spacing: -0.02em;
  }
  .auth-card-sub { font-size: 13px; color: #5a524c; margin-bottom: 20px; line-height: 1.45; }
  .auth-google-btn { display: flex; justify-content: center; }
  .auth-error {
    margin-top: 14px; padding: 10px 12px;
    background: #F8E4E2; border: var(--border-chunky); border-radius: 12px;
    color: var(--error); font-size: 13px;
  }

  /* ── Inner pages (paper) ── */
  .inner-page {
    min-height: 100vh; width: 100%;
    background: var(--bg-paper);
    color: var(--text-on-paper);
    animation: ghPageIn 0.55s var(--ease-bounce) both;
    position: absolute; top: 0; left: 0; right: 0;
    font-family: var(--font-body);
  }
  .inner-header {
    background: var(--ink);
    color: var(--cream);
    border-bottom: var(--border-chunky);
    padding: 0 48px; height: 60px;
    display: flex; align-items: center; gap: 16px;
    position: sticky; top: 0; z-index: 100;
  }
  .back-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: var(--sand); font-size: 13px; font-family: var(--font-body);
    padding: 6px 10px; border-radius: 8px;
    transition: color var(--dur-fast) ease, background var(--dur-fast) ease;
  }
  .back-btn:hover { background: var(--ink-soft); color: var(--cream); }
  .inner-header-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 18px; color: var(--cream); letter-spacing: -0.02em;
  }
  .inner-header-logo span { font-family: var(--font-accent); color: var(--coral); }
  .inner-header-divider { width: 2px; height: 18px; background: var(--ink-soft); margin: 0 4px; }
  .inner-header-title { font-size: 13px; color: var(--sand); font-family: var(--font-body); }

  /* ── Forms ── */
  .form-area { max-width: 1100px; margin: 48px auto 0; padding: 0 48px; }
  .form-card {
    background: var(--cream-light);
    border-radius: var(--radius-card);
    padding: 32px;
    box-shadow: var(--shadow-hard);
    border: var(--border-chunky);
  }
  .form-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 22px; color: var(--ink); letter-spacing: -0.02em; margin-bottom: 24px;
  }
  .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .field-label {
    display: block; font-size: 11px; font-weight: 600; color: var(--ink);
    letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 6px;
    font-family: var(--font-body);
  }
  .field-input, .field-select {
    width: 100%; padding: 11px 14px;
    border: var(--border-chunky); border-radius: 14px;
    font-size: 14px; font-family: var(--font-body);
    color: var(--ink); background: var(--cream);
    outline: none;
    transition: box-shadow var(--dur-fast) ease;
    appearance: none; -webkit-appearance: none;
  }
  .field-input:focus, .field-select:focus {
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-color: var(--ink);
  }
  .field-select { cursor: pointer; }
  .hint { font-size: 12px; color: var(--coral); font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .batch-tip { font-size: 12px; color: #5a524c; margin-bottom: 16px; line-height: 1.6; }
  .batch-tip-link {
    background: none; border: none; color: var(--coral); cursor: pointer;
    font-size: 12px; font-weight: 600; padding: 0;
    text-decoration: underline; text-underline-offset: 2px;
  }

  /* ── Buttons → groovy pills ── */
  .btn-primary, .btn-secondary, .btn-danger {
    display: inline-flex; align-items: center; gap: 8px;
    border-radius: var(--radius-pill);
    border: var(--border-chunky);
    box-shadow: var(--shadow-hard);
    padding: 11px 22px;
    font-size: 14px; font-weight: 600; font-family: var(--font-body);
    cursor: pointer;
    transition: transform var(--dur-fast) var(--ease-bounce), box-shadow var(--dur-fast) var(--ease-bounce);
    letter-spacing: 0.01em;
  }
  .btn-primary:hover:not(:disabled),
  .btn-secondary:hover:not(:disabled),
  .btn-danger:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--ink);
  }
  .btn-primary:active:not(:disabled),
  .btn-secondary:active:not(:disabled),
  .btn-danger:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--ink);
  }
  .btn-primary { background: var(--coral); color: var(--ink); }
  .btn-primary:hover { background: var(--coral); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: var(--shadow-hard); background: var(--sand); }
  .btn-secondary { background: var(--cream); color: var(--ink); }
  .btn-secondary:hover { background: var(--cream-light); border-color: var(--ink); }
  .btn-danger { background: var(--cream); color: var(--error); border-color: var(--error); box-shadow: 4px 4px 0 var(--error); }
  .btn-danger:hover { background: var(--cream-light); color: var(--error); }
  .btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* ── Status ── */
  .loading-area { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 0; }
  .spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--sand); border-top-color: var(--coral);
    animation: spin 0.8s linear infinite;
  }
  .loading-msg { font-size: 14px; font-weight: 500; color: #5a524c; text-align: center; max-width: 440px; line-height: 1.5; }
  .error-msg {
    background: #F8E4E2; border: var(--border-chunky); color: var(--error);
    border-radius: 14px; padding: 12px 16px; font-size: 13px; margin-top: 16px;
  }

  /* ── Results / tables (calm + readable) ── */
  .results-area { max-width: 1100px; margin: 24px auto 48px; padding: 0 48px; }
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .results-count {
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 16px; color: var(--ink);
  }
  .results-count span { color: var(--coral); }
  .table-wrap {
    background: var(--cream-light);
    border-radius: 20px;
    border: var(--border-chunky);
    overflow-x: auto;
    box-shadow: var(--shadow-hard);
  }
  table { min-width: 900px; width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th {
    background: var(--ink); color: var(--cream);
    padding: 12px 16px; text-align: left;
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
  }
  tbody tr { border-bottom: 1px solid var(--sand); transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--cream); }
  tbody td { padding: 12px 16px; color: var(--ink); vertical-align: middle; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .email-cell { color: var(--coral); font-weight: 600; }
  .no-data { color: var(--sand); font-style: italic; }

  /* ── Info ── */
  .info-wrap { max-width: 720px; margin: 48px auto 80px; padding: 0 48px; }
  .info-section { margin-bottom: 40px; }
  .info-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .info-num {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--coral); color: var(--ink);
    border: var(--border-chunky);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    font-family: var(--font-display); flex-shrink: 0;
  }
  .info-title {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 20px; color: var(--ink); letter-spacing: -0.02em; margin: 0;
  }
  .info-body { font-size: 15px; color: #5a524c; line-height: 1.7; font-family: var(--font-body); padding-left: 40px; }
  .info-body ol { margin: 0; padding-left: 20px; }
  .info-body li { margin-bottom: 8px; }
  .info-divider { height: 0; border-bottom: 2.5px solid var(--sand); margin-top: 40px; }

  /* ── Dashboard left panel ── */
  .dash-panel {
    width: 212px;
    min-height: 100vh;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 18px 0;
    background: var(--ink);
    color: var(--cream);
    border-right: var(--border-chunky);
    border-color: rgba(246,235,217,0.18);
    box-shadow: 4px 0 0 rgba(246,235,217,0.08);
  }
  .dash-panel__brand {
    display: flex; align-items: center; gap: 10px;
    margin: 0 14px 16px;
    padding: 10px 12px;
    background: var(--ink-soft);
    border: var(--border-chunky);
    border-color: rgba(246,235,217,0.22);
    border-radius: 14px;
    box-shadow: 3px 3px 0 rgba(246,235,217,0.12);
    cursor: pointer;
    color: inherit;
    font: inherit;
    text-align: left;
    transition: transform var(--dur-fast) var(--ease-bounce), box-shadow var(--dur-fast) var(--ease-bounce);
  }
  .dash-panel__brand:hover {
    transform: translate(-1px, -2px);
    box-shadow: 4px 5px 0 rgba(246,235,217,0.18);
  }
  .dash-panel__brand-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 15px;
    letter-spacing: -0.02em;
    color: var(--cream);
  }
  .dash-panel__brand-title span {
    font-family: var(--font-accent);
    color: var(--coral);
  }
  .dash-panel__body { padding: 4px 14px 16px; }
  .dash-panel__user {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
    padding: 10px;
    border-radius: 14px;
    background: rgba(246,235,217,0.04);
    border: 1.5px solid rgba(246,235,217,0.12);
  }
  .dash-panel__avatar {
    width: 34px; height: 34px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    border: 2.5px solid var(--cream);
    box-shadow: 2px 2px 0 var(--coral);
  }
  .dash-panel__avatar--fallback {
    background: var(--coral);
    color: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 13px; font-weight: 800;
  }
  .dash-panel__user-text { overflow: hidden; min-width: 0; }
  .dash-panel__user-name {
    font-size: 12px; font-weight: 600; color: var(--cream);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dash-panel__user-email {
    font-size: 10px; color: var(--sand);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dash-panel__nav {
    display: flex; flex-direction: column; gap: 6px;
  }
  .dash-panel__nav-btn {
    display: flex; align-items: center; gap: 10px;
    width: 100%; text-align: left;
    padding: 9px 10px;
    border-radius: 12px;
    border: 1.5px solid transparent;
    background: transparent;
    color: var(--sand);
    font-family: var(--font-body);
    font-size: 12px; font-weight: 500;
    cursor: pointer;
    transition: background var(--dur-fast) ease, color var(--dur-fast) ease,
      border-color var(--dur-fast) ease, transform var(--dur-fast) var(--ease-bounce),
      box-shadow var(--dur-fast) var(--ease-bounce);
  }
  .dash-panel__nav-btn:hover {
    color: var(--cream);
    background: rgba(246,235,217,0.06);
    border-color: rgba(246,235,217,0.14);
  }
  .dash-panel__nav-btn.is-active {
    color: var(--ink);
    background: var(--coral);
    border-color: var(--ink);
    font-weight: 700;
    box-shadow: 3px 3px 0 rgba(246,235,217,0.2);
  }
  .dash-panel__nav-icon {
    width: 28px; height: 28px;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* ── Dashboard database cards ── */
  .dash-db-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 16px;
  }
  .dash-db-card {
    position: relative;
    min-height: 148px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 14px;
    padding: 18px;
    border-radius: var(--radius-card);
    border: var(--border-chunky);
    background: var(--cream-light);
    color: var(--ink);
    box-shadow: var(--shadow-hard);
    cursor: pointer;
    text-align: left;
    font: inherit;
    transition: transform var(--dur-ui) var(--ease-bounce), box-shadow var(--dur-ui) var(--ease-bounce);
  }
  .dash-db-card:hover {
    transform: translate(-2px, -3px) rotate(-0.6deg);
    box-shadow: 7px 8px 0 var(--ink);
  }
  .dash-db-card--create {
    align-items: center;
    justify-content: center;
    background: var(--cream);
    border-style: dashed;
    box-shadow: 4px 4px 0 rgba(246,235,217,0.25);
  }
  .dash-db-card--create:hover {
    background: var(--marigold);
    border-style: solid;
    rotate: 0.4deg;
  }
  .dash-db-card__plus {
    width: 44px; height: 44px;
    border-radius: 14px;
    border: var(--border-chunky);
    background: var(--coral);
    color: var(--ink);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 3px 3px 0 var(--ink);
    margin-bottom: 4px;
  }
  .dash-db-card__create-label {
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 14px;
    letter-spacing: -0.02em;
  }
  .dash-db-card__meta {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .dash-db-card__role {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--coral);
  }
  .dash-db-card__kind {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 8px 3px 4px;
    border-radius: 999px;
    border: 1.5px solid var(--ink);
    background: var(--cream);
    font-size: 10px;
    font-weight: 700;
    font-family: var(--font-body);
    color: var(--ink);
  }
  .dash-db-card__kind--maps { background: var(--lavender); }
  .dash-db-card__kind--linkedin { background: var(--periwinkle); color: var(--cream); }
  .dash-db-card__kind--internships { background: var(--marigold); }
  .dash-db-card__title {
    font-family: var(--font-display);
    font-weight: 800;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 16px;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--ink);
    margin: 0;
  }
  .dash-db-card__footer {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .dash-db-card__date {
    font-size: 11px;
    color: #5a524c;
    font-family: var(--font-body);
  }
  .dash-db-card__delete {
    background: var(--cream);
    border: 1.5px solid var(--ink);
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--ink);
    cursor: pointer;
    box-shadow: 2px 2px 0 var(--ink);
    transition: background var(--dur-fast) ease, color var(--dur-fast) ease, transform var(--dur-fast) var(--ease-bounce);
  }
  .dash-db-card__delete:hover {
    background: var(--coral);
    transform: translate(-1px, -1px);
  }

  /* ── Light paper heatmap (ReachAI empty state) ── */
  .paper-heat {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    background: var(--cream);
  }
  .paper-heat__blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(42px);
    opacity: 0.72;
    will-change: transform;
  }
  .paper-heat__blob--a {
    width: min(520px, 80vw); height: min(420px, 55vh);
    left: 8%; top: 6%;
    background: radial-gradient(circle, rgba(252,197,109,0.85) 0%, transparent 68%);
    animation: paperHeatDrift 14s ease-in-out infinite alternate;
  }
  .paper-heat__blob--b {
    width: min(480px, 75vw); height: min(400px, 52vh);
    right: 0; top: 18%;
    background: radial-gradient(circle, rgba(247,167,124,0.7) 0%, transparent 70%);
    animation: paperHeatDrift 11s ease-in-out infinite alternate-reverse;
    animation-delay: 0.4s;
  }
  .paper-heat__blob--c {
    width: min(560px, 85vw); height: min(460px, 58vh);
    left: 18%; bottom: -8%;
    background: radial-gradient(circle, rgba(183,166,232,0.55) 0%, transparent 68%);
    animation: paperHeatDrift 13s ease-in-out infinite alternate;
    animation-delay: 0.9s;
  }
  .paper-heat__blob--d {
    width: min(360px, 55vw); height: min(300px, 40vh);
    left: 42%; top: 36%;
    background: radial-gradient(circle, rgba(246,235,217,0.95) 0%, rgba(238,104,94,0.22) 45%, transparent 72%);
    animation: paperHeatDrift 10s ease-in-out infinite alternate-reverse;
    animation-delay: 1.2s;
  }
  .paper-heat__noise {
    position: absolute; inset: 0;
    mix-blend-mode: multiply;
    opacity: 0.45;
  }
  .paper-heat__dots {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(circle, rgba(45,43,44,0.22) 0.55px, transparent 0.7px),
      radial-gradient(circle, rgba(45,43,44,0.12) 0.4px, transparent 0.55px);
    background-size: 4px 4px, 6px 6px;
    background-position: 0 0, 2px 3px;
    opacity: 0.35;
    mix-blend-mode: multiply;
  }
  @keyframes paperHeatDrift {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to   { transform: translate3d(12px, -16px, 0) scale(1.06); }
  }

  .reachai-empty {
    position: relative;
    text-align: center;
    padding: 48px 20px 32px;
    border-radius: var(--radius-card);
    border: var(--border-chunky);
    overflow: hidden;
    background: var(--cream);
    box-shadow: var(--shadow-hard);
    isolation: isolate;
  }
  .reachai-empty__content {
    position: relative;
    z-index: 1;
  }
  .reachai-empty__mark {
    width: 64px; height: 64px;
    margin: 0 auto 16px;
    border-radius: 18px;
    border: var(--border-chunky);
    background: var(--coral);
    color: var(--ink);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    box-shadow: 4px 4px 0 var(--ink);
  }
  .reachai-empty__title {
    font-family: var(--font-display);
    font-weight: 900;
    font-variation-settings: "SOFT" 100, "WONK" 1;
    font-size: 26px;
    letter-spacing: -0.03em;
    color: var(--ink);
    margin: 0 0 8px;
  }
  .reachai-empty__sub {
    color: #5a524c;
    font-size: 14px;
    line-height: 1.5;
    max-width: 420px;
    margin: 0 auto 28px;
    font-family: var(--font-body);
  }
  .reachai-empty__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    max-width: 620px;
    margin: 0 auto;
    text-align: left;
  }
  .reachai-suggest {
    background: rgba(250,244,231,0.92);
    border: var(--border-chunky);
    border-radius: 14px;
    padding: 14px 16px;
    cursor: pointer;
    font-size: 13px;
    font-family: var(--font-body);
    color: var(--ink);
    line-height: 1.45;
    box-shadow: 3px 3px 0 rgba(45,43,44,0.55);
    transition: transform var(--dur-ui) var(--ease-bounce), box-shadow var(--dur-ui) var(--ease-bounce),
      background var(--dur-fast) ease;
  }
  .reachai-suggest:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 var(--ink);
    background: var(--cream-light);
  }
  .reachai-suggest--wide { grid-column: 1 / -1; }
  @media (max-width: 640px) {
    .reachai-empty__grid { grid-template-columns: 1fr; }
    .reachai-suggest--wide { grid-column: auto; }
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .form-area, .results-area { padding: 0 20px; }
    .inner-header { padding: 0 20px; }
    .form-grid { grid-template-columns: 1fr; }
    .info-wrap { padding: 0 20px; }
    .landing-title { font-size: 40px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .landing-logo, .landing-tagline, .landing-cards, .inner-page {
      animation: none !important;
    }
    .landing::before,
    .landing-waves__heat,
    .landing-waves__ridge,
    .landing-waves__grain,
    .paper-heat__blob {
      animation: none !important;
    }
    .landing::before { transform: translate(-50%, -42%); opacity: 0.72; }
    .landing-waves__heat { transform: translateX(-50%); }
    .landing-waves__ridge { transform: none; }
    .landing-waves__grain { transform: none; }
  }
`;
