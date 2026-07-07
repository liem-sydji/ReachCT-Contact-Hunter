// ─── CONFIG ───────────────────────────────────────────────────────────────────
// VITE_API_URL in .env.local overrides this for local dev (points to localhost:8000).
// Production keeps the Railway URL via Netlify env var or the hardcoded fallback.
export const API = import.meta.env.VITE_API_URL || "https://reachct-production.up.railway.app";

export const ADMIN_PASSWORD = "reachct2026";

// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = "863794295102-us9cq39mkd6s6su7u0380hr2ncrice5b.apps.googleusercontent.com";

// ─── COMPANY TYPES (grouped alphabetically for <optgroup>) ────────────────────
export const COMPANY_TYPES_GROUPED = {
  "A": ["Administration Company", "Advertising Agency", "Architecture Company", "Art Company"],
  "B": ["Biomedical Research Center", "Biotech Company", "Branding Agency", "Business Analytics", "Business Company"],
  "C": ["Childcare Company", "Clinical Laboratory", "Consulting Company", "Cosmetics Company"],
  "D": ["Data Analytics Company", "Data Science Company", "Design Company", "Diagnostic Laboratory", "Diagnostics Company", "Digital Marketing Agency"],
  "E": ["Economic Consulting Company", "Education Company", "Electrical Company", "Engineering Company", "Environmental Company"],
  "F": ["Fashion Company", "Finance Company", "Food Manufacturing Company", "Furniture Design Company"],
  "G": ["Graphic Design Company"],
  "H": ["Hotel Company", "HR Company","Hostal","Host Family Organization"],
  "I": ["Interior Design Company", "IT Company", "IVD Company"],
  "J": ["Journalism Company"],
  "L": ["Language Academy", "Library Company", "Life Science Company", "Logistics Company"],
  "M": ["Management Company", "Market Research Agency", "Marketing Agency", "Medical Device Company", "Medical Laboratory"],
  "N": ["Non Governmental Organization"],
  "O": ["Operations Company"],
  "P": ["Pharmaceutical Company", "PR Agency"],
  "R": ["Real Estate Company", "Research Institute", "Restaurant Company", "Retail Company"],
  "S": ["Sales Company","Student Apartment","Student Residence","Software Company","Startup","Short Term Rental"],
  "T": ["Tourism Company", "Travel Agency"],
  "V": ["Veterinary Company"],
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0a;
    color: #fff;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    margin: 0;
  }

  #root { min-height: 100vh; }

  a { color: inherit; text-decoration: none; }

  /* ── Landing ── */
  .landing-signin-btn {
    position: absolute;
    top: 24px;
    right: 28px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 50px;
    padding: 10px 22px;
    color: rgba(255,255,255,0.8);
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.02em;
    backdrop-filter: blur(10px);
  }
  .landing-signin-btn:hover {
    background: rgba(255,255,255,0.12);
    color: #fff;
    border-color: rgba(255,255,255,0.25);
    transform: translateY(-1px);
  }
  .landing {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 24px;
  }
  .landing::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(232,0,90,0.12) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    pointer-events: none;
  }
  .landing::after {
    content: '';
    position: absolute;
    width: 400px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,0,90,0.4), transparent);
    bottom: 120px; left: 50%;
    transform: translateX(-50%);
  }
  .landing-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; animation: fadeUp 0.6s ease both; }
  .landing-title { font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800; letter-spacing: -1.5px; color: #fff; }
  .landing-title span { color: #E8005A; }
  .landing-tagline { color: rgba(255,255,255,0.45); font-size: 15px; font-weight: 400; letter-spacing: 0.02em; margin-bottom: 56px; animation: fadeUp 0.6s 0.1s ease both; text-align: center; }
  .landing-cards { display: flex; gap: 20px; animation: fadeUp 0.6s 0.2s ease both; flex-wrap: wrap; justify-content: center; }
  .landing-card {
    width: 220px; padding: 32px 24px;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
    background: rgba(255,255,255,0.03); cursor: pointer;
    transition: all 0.25s ease;
    display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
    backdrop-filter: blur(10px); position: relative; overflow: hidden;
  }
  .landing-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(232,0,90,0.08), transparent); opacity: 0; transition: opacity 0.25s ease; border-radius: 16px; }
  .landing-card:hover { border-color: rgba(232,0,90,0.4); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(232,0,90,0.12); }
  .landing-card:hover::before { opacity: 1; }
  .card-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(232,0,90,0.1); border: 1px solid rgba(232,0,90,0.2); display: flex; align-items: center; justify-content: center; color: #E8005A; }
  .card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
  .card-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }
  .landing-info-link {
    margin-top: 40px; background: none; border: none;
    color: rgba(255,255,255,0.35); font-size: 13px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; letter-spacing: 0.03em;
    transition: color 0.2s; text-decoration: underline; text-underline-offset: 3px;
  }
  .landing-info-link:hover { color: rgba(255,255,255,0.7); }

  /* ── Inner pages ── */
  .inner-page { min-height: 100vh; width: 100%; background: #f8f8f8; animation: fadeIn 0.3s ease; position: absolute; top: 0; left: 0; right: 0; }
  .inner-header { background: #fff; border-bottom: 1px solid #eee; padding: 0 48px; height: 60px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 100; }
  .back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #666; font-size: 13px; font-family: 'DM Sans', sans-serif; padding: 6px 10px; border-radius: 8px; transition: all 0.15s ease; }
  .back-btn:hover { background: #f5f5f5; color: #111; }
  .inner-header-logo { display: flex; align-items: center; gap: 10px; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
  .inner-header-logo span { color: #E8005A; }
  .inner-header-divider { width: 1px; height: 20px; background: #eee; margin: 0 4px; }
  .inner-header-title { font-size: 13px; color: #999; font-family: 'DM Sans', sans-serif; }

  /* ── Form area ── */
  .form-area { max-width: 1100px; margin: 48px auto 0; padding: 0 48px; }
  .form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04); border: 1px solid #eee; }
  .form-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-bottom: 24px; }
  .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .field-label { display: block; font-size: 11px; font-weight: 600; color: #999; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; }
  .field-input, .field-select { width: 100%; padding: 10px 14px; border: 1.5px solid #e8e8e8; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #111; background: #fff; outline: none; transition: border-color 0.15s ease, box-shadow 0.15s ease; appearance: none; -webkit-appearance: none; }
  .field-input:focus, .field-select:focus { border-color: #E8005A; box-shadow: 0 0 0 3px rgba(232,0,90,0.08); }
  .field-select { cursor: pointer; }
  .hint { font-size: 12px; color: #E8005A; font-weight: 500; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .batch-tip { font-size: 12px; color: #888; margin-bottom: 16px; line-height: 1.6; }
  .batch-tip-link { background: none; border: none; color: #E8005A; cursor: pointer; font-size: 12px; font-weight: 600; padding: 0; text-decoration: underline; text-underline-offset: 2px; }

  /* ── Buttons ── */
  .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #E8005A; color: #fff; border: none; border-radius: 10px; padding: 11px 24px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s ease; letter-spacing: 0.01em; }
  .btn-primary:hover { background: #cc004f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(232,0,90,0.25); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #444; border: 1.5px solid #e8e8e8; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s ease; }
  .btn-secondary:hover { border-color: #ccc; background: #f9f9f9; }
  .btn-danger { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #E8005A; border: 1.5px solid #E8005A; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s ease; }
  .btn-danger:hover { background: #E8005A; color: #fff; }
  .btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* ── Status ── */
  .loading-area { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 0; }
  .spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #f0f0f0; border-top-color: #E8005A; animation: spin 0.8s linear infinite; }
  .loading-msg { font-size: 14px; font-weight: 500; color: #666; text-align: center; max-width: 440px; line-height: 1.5; }
  .error-msg { background: #FFF1F2; border: 1px solid #FECDD3; color: #9F1239; border-radius: 10px; padding: 12px 16px; font-size: 13px; margin-top: 16px; }

  /* ── Results ── */
  .results-area { max-width: 1100px; margin: 24px auto 48px; padding: 0 48px; }
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .results-count { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #111; }
  .results-count span { color: #E8005A; }
  .table-wrap { background: #fff; border-radius: 16px; border: 1px solid #eee; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  table { min-width: 900px; width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { background: #111; color: #fff; padding: 12px 16px; text-align: left; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
  tbody tr { border-bottom: 1px solid #f5f5f5; transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #fafafa; }
  tbody td { padding: 12px 16px; color: #333; vertical-align: middle; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .email-cell { color: #E8005A; font-weight: 500; }
  .no-data { color: #ccc; font-style: italic; }

  /* ── Info page ── */
  .info-wrap { max-width: 720px; margin: 48px auto 80px; padding: 0 48px; }
  .info-section { margin-bottom: 48px; }
  .info-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .info-num { width: 28px; height: 28px; border-radius: 50%; background: #E8005A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; font-family: 'Syne', sans-serif; flex-shrink: 0; }
  .info-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.4px; margin: 0; }
  .info-body { font-size: 15px; color: #555; line-height: 1.7; font-family: 'DM Sans', sans-serif; padding-left: 40px; }
  .info-body ol { margin: 0; padding-left: 20px; }
  .info-body li { margin-bottom: 8px; }
  .info-divider { height: 1px; background: #eee; margin-top: 48px; }

  /* ── Animations ── */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .form-area, .results-area { padding: 0 20px; }
    .inner-header { padding: 0 20px; }
    .form-grid { grid-template-columns: 1fr; }
    .info-wrap { padding: 0 20px; }
    .landing-title { font-size: 40px; }
  }
`;
