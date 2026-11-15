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
    background-image: radial-gradient(circle, rgba(246,235,217,0.4) 1px, transparent 1.2px);
    background-size: 22px 22px;
    opacity: 0.16;
    z-index: 0;
  }

  /* Concentric orange→pink→cream wave field */
  .landing-waves {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .landing-waves__wash {
    position: absolute;
    left: 50%;
    bottom: -18%;
    width: min(920px, 140vw);
    height: min(720px, 95vh);
    transform: translateX(-50%);
    background:
      linear-gradient(to top,
        rgba(228,119,80,0.85) 0%,
        rgba(238,104,94,0.55) 28%,
        rgba(214,51,145,0.42) 55%,
        rgba(183,166,232,0.22) 78%,
        rgba(246,235,217,0.08) 100%);
    filter: blur(28px);
    opacity: 0.9;
    animation: landingWashWave 11s ease-in-out infinite alternate;
  }
  .landing-waves__svg {
    position: absolute;
    left: 50%;
    bottom: -8%;
    width: min(980px, 150vw);
    height: min(820px, 110vh);
    transform: translateX(-50%);
    overflow: visible;
  }
  .landing-waves__ridge {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation-name: landingRidgeWave;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    opacity: 0.78;
  }
  .landing-waves__ridge--1 { opacity: 0.55; }
  .landing-waves__ridge--2 { opacity: 0.62; }
  .landing-waves__ridge--3 { opacity: 0.7; }
  .landing-waves__ridge--4 { opacity: 0.78; }
  .landing-waves__ridge--5 { opacity: 0.85; }
  .landing-waves__ridge--6 { opacity: 0.92; }
  .landing-waves__dots {
    pointer-events: none;
  }

  @keyframes landingRidgeWave {
    0%   { transform: translateY(10px) scaleX(0.985) scaleY(0.98); }
    50%  { transform: translateY(-16px) scaleX(1.025) scaleY(1.02); }
    100% { transform: translateY(-4px) scaleX(1.01) scaleY(1.005); }
  }
  @keyframes landingWashWave {
    from { transform: translateX(-50%) translateY(12px) scale(0.98); opacity: 0.78; }
    to   { transform: translateX(-50%) translateY(-18px) scale(1.04); opacity: 0.95; }
  }
  @keyframes landingGlowWave {
    from { transform: translate(-50%, -40%) scale(0.96); opacity: 0.62; }
    to   { transform: translate(-50%, -46%) scale(1.06); opacity: 0.82; }
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
    .landing-waves__wash,
    .landing-waves__ridge {
      animation: none !important;
    }
    .landing::before { transform: translate(-50%, -42%); opacity: 0.72; }
    .landing-waves__wash { transform: translateX(-50%); opacity: 0.9; }
    .landing-waves__ridge { transform: none; }
  }
`;
