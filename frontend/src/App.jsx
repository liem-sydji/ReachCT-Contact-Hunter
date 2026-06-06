import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = "https://reachct-production.up.railway.app";

const COMPANY_TYPES = [
  "Administration Company","Architecture","Art Company","Business Company",
  "Childcare","Consulting Company","Data Analytics Company","Data Science Company",
  "Design Company","Digital Marketing Company","Economics Company","Education",
  "Electrical Company","Engineering Company","Fashion Company","Finance Company",
  "Furniture Design","Hotels","HR Company","Interior Design","IT Company",
  "Journalism Company","Language Academy","Libraries","Logistics Company",
  "Management Company","Marketing Company","Operations Company","Real Estate",
  "Restaurants","Retail Company","Sales Company","Software Company",
  "Tourism Company","Travel Agency",
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
    background: #f8f8f8;
    animation: fadeIn 0.3s ease;
  }

  .inner-header {
    background: #fff;
    border-bottom: 1px solid #eee;
    padding: 0 32px;
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
    max-width: 820px;
    margin: 48px auto 0;
    padding: 0 24px;
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
    gap: 14px;
    margin-bottom: 14px;
  }

  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
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
    max-width: 820px;
    margin: 24px auto 48px;
    padding: 0 24px;
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
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  table {
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

  return (
    <>
      <style>{css}</style>
      {page === "landing"  && <Landing  onNav={setPage} />}
      {page === "search"   && <SearchPage   onBack={() => setPage("landing")} />}
      {page === "database" && <DatabasePage onBack={() => setPage("landing")} />}
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
    </div>
  );
}

// ─── SEARCH PAGE ──────────────────────────────────────────────────────────────
function SearchPage({ onBack }) {
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
            const found = jd.results?.length || 0;
            const onMaps = jd.total_on_maps;
            const processing = jd.processing;
            if (onMaps && processing) setLoadMsg(`Found ${onMaps} listings on Maps — scraping ${processing} in range… (${found} done)`);
            else if (onMaps) setLoadMsg(`Found ${onMaps} listings — starting scrape…`);
            else setLoadMsg("Scrolling Google Maps to find listings…");
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
          <div className="form-grid">
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
          </div>
          <div className="form-grid-2">
            <div>
              <label className="field-label">Start Index</label>
              <input className="field-input" type="number" min="0" value={start} onChange={e => setStart(Number(e.target.value))}/>
            </div>
            <div>
              <label className="field-label">End Index (max +100)</label>
              <input className="field-input" type="number" min="1" value={end} onChange={e => setEnd(Math.min(Number(e.target.value), start + 100))}/>
            </div>
          </div>
          <p className="hint">Use English spelling — "Spain" not "España", "Munich" not "München"</p>
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
            <div className="results-count"><span>{results.length}</span> companies found</div>
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
            <div className="results-count"><span>{dbResults.length}</span> companies found</div>
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
