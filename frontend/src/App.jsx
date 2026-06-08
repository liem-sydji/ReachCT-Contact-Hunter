import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = "https://reachct-production.up.railway.app";

const COMPANY_TYPES = [
  "Accounting Firm",
  "Administration Company",
  "Advertising Agency",
  "Architecture Company",
  "Art Company",
  "Branding Agency",
  "Business Analytics",
  "Business Company",
  "Childcare Company",
  "Consulting Company",
  "Data Analytics Company",
  "Data Science Company",
  "Design Company",
  "Digital Marketing Agency",
  "Economic Consulting Company",
  "Education Company",
  "Electrical Company",
  "Engineering Company",
  "Fashion Company",
  "Finance Company",
  "Furniture Design Company",
  "Hotel Company",
  "HR Company",
  "Interior Design Company",
  "IT Company",
  "Journalism Company",
  "Language Academy",
  "Library Company",
  "Logistics Company",
  "Management Company",
  "Market Research Agency",
  "Marketing Agency",
  "Operations Company",
  "PR Agency",
  "Real Estate Company",
  "Restaurant Company",
  "Retail Company",
  "Sales Company",
  "Tourism Company",
  "Travel Agency",
];

// ─── ICONS (Lucide-style SVG) ─────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const StopIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const ReachCTLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="17" stroke="#E8005A" strokeWidth="2"/>
    <circle cx="18" cy="18" r="10" stroke="#E8005A" strokeWidth="2" opacity="0.6"/>
    <circle cx="18" cy="18" r="3" fill="#E8005A"/>
    <line x1="18" y1="1" x2="18" y2="8" stroke="#E8005A" strokeWidth="2" strokeLinecap="round"/>
    <line x1="18" y1="28" x2="18" y2="35" stroke="#E8005A" strokeWidth="2" strokeLinecap="round"/>
    <line x1="1" y1="18" x2="8" y2="18" stroke="#E8005A" strokeWidth="2" strokeLinecap="round"/>
    <line x1="28" y1="18" x2="35" y2="18" stroke="#E8005A" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
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

  #root {
    min-height: 100vh;
  }

  .page { min-height: 100vh; }

  /* Landing */
  .landing {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
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

  .landing-logo {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
    animation: fadeUp 0.6s ease both;
  }

  .landing-title {
    font-family: 'Syne', sans-serif;
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -1.5px;
    color: #fff;
  }

  .landing-title span { color: #E8005A; }

  .landing-tagline {
    color: rgba(255,255,255,0.45);
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.02em;
    margin-bottom: 56px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .landing-cards {
    display: flex;
    gap: 20px;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .landing-card {
    width: 220px;
    padding: 32px 24px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .landing-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(232,0,90,0.08), transparent);
    opacity: 0;
    transition: opacity 0.25s ease;
    border-radius: 16px;
  }

  .landing-card:hover {
    border-color: rgba(232,0,90,0.4);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(232,0,90,0.12);
  }

  .landing-card:hover::before { opacity: 1; }

  .card-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    background: rgba(232,0,90,0.1);
    border: 1px solid rgba(232,0,90,0.2);
    display: flex; align-items: center; justify-content: center;
    color: #E8005A;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .card-desc {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    line-height: 1.5;
  }

  /* Inner pages */
  .inner-page {
    min-height: 100vh;
    width: 100%;
    background: #f8f8f8;
    animation: fadeIn 0.3s ease;
    position: absolute;
    top: 0; left: 0; right: 0;
  }

  .inner-header {
    background: #fff;
    border-bottom: 1px solid #eee;
    padding: 0 48px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .back-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: #666; font-size: 13px; font-family: 'DM Sans', sans-serif;
    padding: 6px 10px; border-radius: 8px;
    transition: all 0.15s ease;
  }

  .back-btn:hover { background: #f5f5f5; color: #111; }

  .inner-header-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    color: #111; letter-spacing: -0.5px;
  }

  .inner-header-logo span { color: #E8005A; }

  .inner-header-divider {
    width: 1px; height: 20px;
    background: #eee; margin: 0 4px;
  }

  .inner-header-title {
    font-size: 13px; color: #999;
    font-family: 'DM Sans', sans-serif;
  }

  /* Form area */
  .form-area {
    max-width: 1100px;
    margin: 48px auto 0;
    padding: 0 48px;
  }

  .form-card {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04);
    border: 1px solid #eee;
  }

  .form-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    color: #111; letter-spacing: -0.5px;
    margin-bottom: 24px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-bottom: 6px;
    font-family: 'DM Sans', sans-serif;
  }

  .field-input, .field-select {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #111;
    background: #fff;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    appearance: none;
    -webkit-appearance: none;
  }

  .field-input:focus, .field-select:focus {
    border-color: #E8005A;
    box-shadow: 0 0 0 3px rgba(232,0,90,0.08);
  }

  .field-select { cursor: pointer; }

  .hint {
    font-size: 12px;
    color: #E8005A;
    font-weight: 500;
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 6px;
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #E8005A; color: #fff;
    border: none; border-radius: 10px;
    padding: 11px 24px;
    font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.01em;
  }

  .btn-primary:hover { background: #cc004f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(232,0,90,0.25); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; color: #444;
    border: 1.5px solid #e8e8e8; border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-secondary:hover { border-color: #ccc; background: #f9f9f9; }

  .btn-danger {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; color: #E8005A;
    border: 1.5px solid #E8005A; border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-danger:hover { background: #E8005A; color: #fff; }

  .btn-row {
    display: flex; gap: 10px; align-items: center;
    flex-wrap: wrap;
  }

  /* Status messages */
  .loading-area {
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
    padding: 48px 0;
  }

  .spinner {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 3px solid #f0f0f0;
    border-top-color: #E8005A;
    animation: spin 0.8s linear infinite;
  }

  .loading-msg {
    font-size: 14px; font-weight: 500;
    color: #666; text-align: center;
    max-width: 400px; line-height: 1.5;
  }

  .error-msg {
    background: #FFF1F2; border: 1px solid #FECDD3;
    color: #9F1239; border-radius: 10px;
    padding: 12px 16px; font-size: 13px;
    margin-top: 16px;
  }

  /* Results */
  .results-area {
    max-width: 1100px;
    margin: 24px auto 48px;
    padding: 0 48px;
  }

  .results-header {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap; gap: 12px;
  }

  .results-count {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
    color: #111;
  }

  .results-count span { color: #E8005A; }

  .table-wrap {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #eee;
    overflow-x: auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  table {
    min-width: 900px;
    width: 100%; border-collapse: collapse;
    font-size: 13px;
  }

  thead th {
    background: #111; color: #fff;
    padding: 12px 16px;
    text-align: left;
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    white-space: nowrap;
  }

  tbody tr { border-bottom: 1px solid #f5f5f5; transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #fafafa; }

  tbody td {
    padding: 12px 16px;
    color: #333; vertical-align: middle;
    max-width: 200px; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }

  .email-cell { color: #E8005A; font-weight: 500; }
  .no-data { color: #ccc; font-style: italic; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Number input */
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { opacity: 1; }
`;

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // landing | search | database

  // Admin page accessible via URL hash
  if (window.location.pathname === "/admin") {
    return <><style>{css}</style><AdminPage /></>;
  }

  return (
    <>
      <style>{css}</style>
      {page === "landing"  && <Landing  onNav={setPage} />}
      {page === "search"   && <SearchPage   onBack={() => setPage("landing")} onNav={setPage} />}
      {page === "database" && <DatabasePage onBack={() => setPage("landing")} />}
      {page === "info"     && <InfoPage     onBack={() => setPage("landing")} />}
    </>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onNav }) {
  return (
    <div className="landing">
      <div className="landing-logo">
        <ReachCTLogo size={44} />
        <span className="landing-title">Reach<span>CT</span></span>
      </div>
      <p className="landing-tagline">B2B Contact Intelligence — Find companies, extract emails, close deals.</p>
      <div className="landing-cards">
        <div className="landing-card" onClick={() => onNav("search")}>
          <div className="card-icon"><SearchIcon /></div>
          <div>
            <div className="card-title">Start New Search</div>
            <div className="card-desc">Scrape Google Maps for company contacts in any city</div>
          </div>
        </div>
        <div className="landing-card" onClick={() => onNav("database")}>
          <div className="card-icon"><DatabaseIcon /></div>
          <div>
            <div className="card-title">Pull From Database</div>
            <div className="card-desc">Query and export previously scraped contacts</div>
          </div>
        </div>
      </div>
      <button onClick={() => onNav("info")} style={{
        marginTop: 40, background: "none", border: "none",
        color: "rgba(255,255,255,0.35)", fontSize: 13,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.03em", transition: "color 0.2s",
        textDecoration: "underline", textUnderlineOffset: 3,
      }}
        onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}
      >
        How to use ReachCT?
      </button>
    </div>
  );
}

// ─── SEARCH PAGE ──────────────────────────────────────────────────────────────
function SearchPage({ onBack, onNav }) {
  const [query,    setQuery]    = useState("");
  const [city,     setCity]     = useState("");
  const [country,  setCountry]  = useState("");
  const [start,    setStart]    = useState(0);
  const [end,      setEnd]      = useState(25);
  const [loading,  setLoading]  = useState(false);
  const [loadMsg,  setLoadMsg]  = useState("");
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState("");
  const [jobId,    setJobId]    = useState(null);
  const pollRef = useRef(null);

  const handleSearch = async () => {
    if (!query || !city || !country) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true); setSearched(false); setResults([]);
    setLoadMsg("Connecting to Google Maps...");
    try {
      const res  = await fetch(`${API}/api/scrape?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&start=${start}&end=${end}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start search");
      const jid = data.job_id;
      setJobId(jid);
      setLoadMsg(data.queue_position > 0 ? `Queued at position ${data.queue_position}…` : "Scrolling Google Maps…");
      pollRef.current = setInterval(async () => {
        try {
          const jr = await fetch(`${API}/api/job/${jid}`);
          const jd = await jr.json();
          if (jd.status === "done" || jd.status === "cancelled") {
            clearInterval(pollRef.current);
            setResults(jd.results || []);
            setSearched(true); setLoading(false); setJobId(null);
          } else if (jd.status === "error") {
            clearInterval(pollRef.current);
            setError(jd.error || "Something went wrong");
            setLoading(false);
          } else {
            const found      = jd.results?.length || 0;
            const onMaps     = jd.total_on_maps;
            const processing = jd.processing;
            const queuePos   = jd.queue_position;
            if (queuePos > 0 || jd.status === "starting") setLoadMsg(`Your search is in queue at position ${queuePos || 1} — this might take a while before other searches are done. Your results will be saved automatically.`);
            else setLoadMsg(`Your search is in progress — this may take a couple of minutes. Come back when it's ready, your results will appear here automatically.`);
          }
        } catch {}
      }, 4000);
    } catch (e) {
      setError(e.message); setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!jobId) return;
    try { await fetch(`${API}/api/job/${jobId}/cancel`, { method: "POST" }); setLoadMsg("Cancelling…"); } catch {}
  };

  const handleExport = () => {
    const url = `${API}/api/export?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
    const rows = results.map(r => [r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
    const tsv = [headers,...rows].map(r => r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(() => alert("Copied! Paste into Google Sheets or Excel."));
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <div className="inner-page">
      <header className="inner-header">
        <button className="back-btn" onClick={onBack}><ArrowLeftIcon /> Back</button>
        <div className="inner-header-divider"/>
        <div className="inner-header-logo"><ReachCTLogo size={22}/>Reach<span>CT</span></div>
        <div className="inner-header-divider"/>
        <span className="inner-header-title">New Search</span>
      </header>

      <div className="form-area">
        <div className="form-card">
          <div className="form-title">Search Google Maps</div>
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr 0.6fr 0.6fr", gap:16, marginBottom:16}}>
            <div>
              <label className="field-label">Business Type</label>
              <select className="field-select" value={query} onChange={e => setQuery(e.target.value)}>
                <option value="">Select company type…</option>
                {COMPANY_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">City</label>
              <input className="field-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Munich"/>
            </div>
            <div>
              <label className="field-label">Country</label>
              <input className="field-input" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Germany"/>
            </div>
            <div>
              <label className="field-label">Start</label>
              <input className="field-input" type="number" min="0" value={start} onChange={e => { const v = e.target.value; setStart(v === "" ? "" : Number(v)); }} onBlur={e => { if (e.target.value === "") setStart(0); }}/>
            </div>
            <div>
              <label className="field-label">End (max +50)</label>
              <input className="field-input" type="number" min="1" value={end} onChange={e => { const v = e.target.value; setEnd(v === "" ? "" : Math.min(Number(v), (start||0) + 50)); }} onBlur={e => { if (e.target.value === "") setEnd(25); }}/>
            </div>
          </div>
          <p className="hint">Use English spelling — "Spain" not "España", "Munich" not "München"</p>
          <p style={{ fontSize:12, color:"#888", marginBottom:16, lineHeight:1.6 }}>
            💡 <strong>Tip:</strong> Run searches in batches of 25 for quicker results — e.g. 0→25, then 25→50, then 50→75.
            Each batch saves automatically to the database.
            &nbsp;<button onClick={() => onNav("info")} style={{ background:"none", border:"none", color:"#E8005A", cursor:"pointer", fontSize:12, fontWeight:600, padding:0, textDecoration:"underline", textUnderlineOffset:2 }}>How to use ReachCT →</button>
          </p>
          <div className="btn-row">
            <button className="btn-primary" onClick={handleSearch} disabled={loading}>
              <SearchIcon />{loading ? "Searching…" : "Search"}
            </button>
            {loading && <button className="btn-danger" onClick={handleCancel}><StopIcon />Stop</button>}
          </div>
          {error && <div className="error-msg">{error}</div>}
          {loading && (
            <div className="loading-area">
              <div className="spinner"/>
              <p className="loading-msg">{loadMsg}</p>
            </div>
          )}
        </div>
      </div>

      {searched && (
        <div className="results-area">
          <div className="results-header">
            <div className="results-count">
              <span>{results.length}</span> companies found
              &nbsp;·&nbsp;
              <span style={{color:"#E8005A"}}>{results.filter(r => r.email).length}</span> emails found
            </div>
            <div className="btn-row">
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <ResultsTable data={results}/>
        </div>
      )}
    </div>
  );
}

// ─── DATABASE PAGE ────────────────────────────────────────────────────────────
function DatabasePage({ onBack }) {
  const [dbQuery,   setDbQuery]   = useState("");
  const [dbCity,    setDbCity]    = useState("");
  const [dbCountry, setDbCountry] = useState("");
  const [dbResults, setDbResults] = useState([]);
  const [searched,  setSearched]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [filters,   setFilters]   = useState({ countries: [], cities: {}, company_types: [] });

  useEffect(() => {
    fetch(`${API}/api/filters`).then(r => r.json()).then(setFilters).catch(() => {});
  }, []);

  const safeCountries    = filters?.countries    || [];
  const safeCities       = filters?.cities       || {};
  const safeCompanyTypes = filters?.company_types || [];

  const handlePull = async () => {
    if (!dbCity && !dbCountry && !dbQuery) { setError("Please select at least one filter."); return; }
    setError(""); setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dbCity)    params.append("city", dbCity);
      if (dbCountry) params.append("country", dbCountry);
      if (dbQuery)   params.append("query", dbQuery);
      const res  = await fetch(`${API}/api/companies?${params}`);
      const data = await res.json();
      setDbResults(data.companies || []);
      setSearched(true);
    } catch { setError("Failed to load data."); }
    setLoading(false);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (dbCity)    params.append("city", dbCity);
    if (dbCountry) params.append("country", dbCountry);
    if (dbQuery)   params.append("query", dbQuery);
    window.open(`${API}/api/export?${params}`, "_blank");
  };

  const handleCopy = () => {
    if (!dbResults.length) return;
    const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
    const rows = dbResults.map(r => [r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
    const tsv = [headers,...rows].map(r => r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(() => alert("Copied! Paste into Google Sheets or Excel."));
  };

  return (
    <div className="inner-page">
      <header className="inner-header">
        <button className="back-btn" onClick={onBack}><ArrowLeftIcon/>Back</button>
        <div className="inner-header-divider"/>
        <div className="inner-header-logo"><ReachCTLogo size={22}/>Reach<span>CT</span></div>
        <div className="inner-header-divider"/>
        <span className="inner-header-title">Database</span>
      </header>

      <div className="form-area">
        <div className="form-card">
          <div className="form-title">Pull From Database</div>
          <div className="form-grid">
            <div>
              <label className="field-label">Company Type (optional)</label>
              <select className="field-select" value={dbQuery} onChange={e => setDbQuery(e.target.value)}>
                <option value="">All company types</option>
                {safeCompanyTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Country (optional)</label>
              <select className="field-select" value={dbCountry} onChange={e => { setDbCountry(e.target.value); setDbCity(""); }}>
                <option value="">All countries</option>
                {safeCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">City (optional)</label>
              <select className="field-select" value={dbCity} onChange={e => setDbCity(e.target.value)}>
                <option value="">All cities</option>
                {(dbCountry ? (safeCities[dbCountry]||[]) : Object.values(safeCities).flat()).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-primary" onClick={handlePull} disabled={loading}>
              <DatabaseIcon/>{loading ? "Loading…" : "Pull Data"}
            </button>
          </div>
          {error && <div className="error-msg">{error}</div>}
          {loading && <div className="loading-area"><div className="spinner"/><p className="loading-msg">Fetching from database…</p></div>}
        </div>
      </div>

      {searched && (
        <div className="results-area">
          <div className="results-header">
            <div className="results-count">
              <span>{dbResults.length}</span> companies found
              &nbsp;·&nbsp;
              <span style={{color:"#E8005A"}}>{dbResults.filter(r => r.email).length}</span> emails found
            </div>
            <div className="btn-row">
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <ResultsTable data={dbResults}/>
        </div>
      )}
    </div>
  );
}

// ─── RESULTS TABLE ────────────────────────────────────────────────────────────
function ResultsTable({ data }) {
  if (!data.length) return <div style={{textAlign:"center",padding:"48px",color:"#999",fontSize:14}}>No results found.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Company Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Location</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td style={{color:"#bbb",fontSize:12}}>{i+1}</td>
              <td style={{fontWeight:500,color:"#111"}}>{r.name||<span className="no-data">—</span>}</td>
              <td className={r.email?"email-cell":""}>{r.email||<span className="no-data">—</span>}</td>
              <td>{r.phone||<span className="no-data">—</span>}</td>
              <td>{r.website ? <a href={r.website} target="_blank" rel="noreferrer" style={{color:"#666",textDecoration:"none",fontSize:12}}>{r.website.replace(/https?:\/\/(www\.)?/,"").slice(0,30)}</a> : <span className="no-data">—</span>}</td>
              <td style={{fontSize:12,color:"#666"}}>{[r.city,r.country].filter(Boolean).join(", ")||<span className="no-data">—</span>}</td>
              <td style={{fontSize:12,color:"#888"}}>{r.company_type||<span className="no-data">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ─── INFO PAGE ────────────────────────────────────────────────────────────────
function InfoPage({ onBack }) {
  const sections = [
    {
      title: "What is ReachCT?",
      content: "ReachCT is an internal B2B contact intelligence tool built for Spain Internship. It automatically searches Google Maps for companies in any city and country, visits their websites to extract emails and phone numbers, and stores everything in a shared database. Instead of spending hours researching companies manually, ReachCT does it in minutes — giving your team a ready-to-use contact list for outreach."
    },
    {
      title: "How to make a search",
      steps: [
        "Click Start New Search from the home screen.",
        "Select a Business Type from the dropdown — e.g. Marketing Agency, IT Company.",
        "Type the City and Country in English — e.g. Madrid, Spain (not España).",
        "Set the Start and End index. Start at 0 and End at 25 for your first search — we recommend keeping searches to 25 listings at a time to avoid overloading the server and keeping queue wait times short for other users. That said, the tool supports up to 100 listings in a single search if needed (e.g. Start 0, End 100). For larger datasets, run multiple searches in batches (0–25, 25–50, 50–75, 75–100).",
        "Click Search. ReachCT will scroll Google Maps, visit each company website, and extract contact details automatically.",
        "Once done, your results appear in a table. Export to Excel or Copy Table to paste into Google Sheets."
      ]
    },
    {
      title: "How to pull from database",
      steps: [
        "Click Pull From Database from the home screen.",
        "Filter by Company Type, Country, and/or City using the dropdowns. All filters are optional — leave them empty to see all companies.",
        "Click Pull Data to retrieve matching companies from the database.",
        "Export to Excel or Copy Table to use the data in your outreach."
      ]
    },
    {
      title: "What if my search takes too long?",
      content: "If another team member is already running a search, yours will be queued. You will see a message saying your search is in queue — this is normal. Your search will start automatically once the previous one finishes. Do not close the tab or refresh the page while waiting. All results are saved to the shared database automatically, so even if you close the tab after the search completes, the data is not lost and can be retrieved from Pull From Database."
    },
  ];

  return (
    <div className="inner-page">
      <header className="inner-header">
        <button className="back-btn" onClick={onBack}><ArrowLeftIcon /> Back</button>
        <div className="inner-header-divider"/>
        <div className="inner-header-logo"><ReachCTLogo size={22}/>Reach<span>CT</span></div>
        <div className="inner-header-divider"/>
        <span className="inner-header-title">How to use ReachCT</span>
      </header>

      <div style={{ maxWidth: 720, margin: "48px auto 80px", padding: "0 48px" }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#E8005A", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif",
                flexShrink: 0,
              }}>{i + 1}</div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20, fontWeight: 800,
                color: "#111", letterSpacing: "-0.4px", margin: 0
              }}>{s.title}</h2>
            </div>

            {s.content && (
              <p style={{
                fontSize: 15, color: "#555", lineHeight: 1.7,
                fontFamily: "'DM Sans', sans-serif",
                paddingLeft: 40,
              }}>{s.content}</p>
            )}

            {s.steps && (
              <ol style={{ paddingLeft: 40, margin: 0 }}>
                {s.steps.map((step, j) => (
                  <li key={j} style={{
                    fontSize: 15, color: "#555", lineHeight: 1.7,
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 8,
                  }}>{step}</li>
                ))}
              </ol>
            )}

            {i < sections.length - 1 && (
              <div style={{ height: 1, background: "#eee", marginTop: 48 }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage() {
  const ADMIN_PASSWORD = "reachct2026";
  const [authed,   setAuthed]   = useState(false);
  const [password, setPassword] = useState("");
  const [jobs,     setJobs]     = useState([]);
  const [error,    setError]    = useState("");
  const [msg,      setMsg]      = useState("");

  const login = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else setError("Wrong password");
  };

  const fetchJobs = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/jobs`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch { setError("Failed to fetch jobs"); }
  };

  const cancelJob = async (jobId) => {
    try {
      await fetch(`${API}/api/job/${jobId}/cancel`, { method: "POST" });
      setMsg(`Job ${jobId} cancelled`);
      fetchJobs();
    } catch { setError("Failed to cancel job"); }
  };

  const cancelAll = async () => {
    try {
      await fetch(`${API}/api/admin/cancel-all`, { method: "POST" });
      setMsg("All running jobs cancelled");
      fetchJobs();
    } catch { setError("Failed to cancel all"); }
  };

  useEffect(() => {
    if (authed) {
      fetchJobs();
      const interval = setInterval(fetchJobs, 5000);
      return () => clearInterval(interval);
    }
  }, [authed]);

  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:16, padding:40, width:320, textAlign:"center" }}>
        <ReachCTLogo size={40} />
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", marginTop:16, marginBottom:8, fontSize:20 }}>Admin Access</h2>
        <p style={{ color:"#666", fontSize:13, marginBottom:24 }}>ReachCT Control Panel</p>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #333", background:"#111", color:"#fff", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:12, boxSizing:"border-box" }}
        />
        {error && <p style={{ color:"#E8005A", fontSize:12, marginBottom:12 }}>{error}</p>}
        <button onClick={login} style={{ width:"100%", background:"#E8005A", color:"#fff", border:"none", borderRadius:8, padding:"11px 0", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          Login
        </button>
      </div>
    </div>
  );

  const running = jobs.filter(j => ["running","queued","starting","cancelling"].includes(j.status));
  const done    = jobs.filter(j => ["done","cancelled","error"].includes(j.status));

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", padding:40 }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <ReachCTLogo size={32} />
            <h1 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:24, margin:0 }}>ReachCT <span style={{color:"#E8005A"}}>Admin</span></h1>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={fetchJobs} style={{ background:"#1a1a1a", color:"#fff", border:"1px solid #333", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Refresh
            </button>
            {running.length > 0 && (
              <button onClick={cancelAll} style={{ background:"#E8005A", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Cancel All
              </button>
            )}
          </div>
        </div>

        {msg && <div style={{ background:"#052e16", border:"1px solid #16a34a", color:"#4ade80", borderRadius:8, padding:"10px 16px", fontSize:13, marginBottom:16 }}>{msg}</div>}
        {error && <div style={{ background:"#2d0a0a", border:"1px solid #E8005A", color:"#E8005A", borderRadius:8, padding:"10px 16px", fontSize:13, marginBottom:16 }}>{error}</div>}

        <h3 style={{ color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:14, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>
          Active Jobs ({running.length})
        </h3>

        {running.length === 0 ? (
          <div style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:12, padding:24, color:"#666", fontSize:14, textAlign:"center", marginBottom:32 }}>
            No active jobs
          </div>
        ) : (
          <div style={{ marginBottom:32 }}>
            {running.map(job => (
              <div key={job.id} style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:12, padding:20, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span style={{ background: job.status === "running" ? "#052e16" : "#1c1917", color: job.status === "running" ? "#4ade80" : "#f59e0b", border: `1px solid ${job.status === "running" ? "#16a34a" : "#d97706"}`, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                      {job.status.toUpperCase()}
                    </span>
                    <span style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{job.query}</span>
                    <span style={{ color:"#666", fontSize:13 }}>{job.city}, {job.country}</span>
                  </div>
                  <div style={{ color:"#555", fontSize:12 }}>
                    Job ID: {job.id} · {job.results?.length || 0} results so far
                    {job.total_on_maps ? ` · ${job.total_on_maps} listings on Maps` : ""}
                  </div>
                </div>
                <button onClick={() => cancelJob(job.id)} style={{ background:"none", color:"#E8005A", border:"1.5px solid #E8005A", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}
                  onMouseEnter={e => { e.target.style.background = "#E8005A"; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "none"; e.target.style.color = "#E8005A"; }}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:14, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>
          Recent Jobs ({done.length})
        </h3>
        <div>
          {done.slice(0, 10).map(job => (
            <div key={job.id} style={{ background:"#111", border:"1px solid #222", borderRadius:10, padding:"14px 20px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <span style={{ background: job.status === "done" ? "#052e16" : "#2d0a0a", color: job.status === "done" ? "#4ade80" : "#f87171", border: `1px solid ${job.status === "done" ? "#16a34a" : "#dc2626"}`, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600, marginRight:10 }}>
                  {job.status.toUpperCase()}
                </span>
                <span style={{ color:"#888", fontSize:13 }}>{job.query} · {job.city}, {job.country}</span>
              </div>
              <span style={{ color:"#555", fontSize:12 }}>{job.results?.length || 0} results</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}