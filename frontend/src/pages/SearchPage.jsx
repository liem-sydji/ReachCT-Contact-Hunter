import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API, COMPANY_TYPES_GROUPED } from "../styles.js";
import { SearchIcon, DownloadIcon, CopyIcon, StopIcon } from "../components/icons.jsx";
import { InnerHeader, ResultsTable } from "../components/shared.jsx";
import AddToDBModal from "../components/AddToDBModal.jsx";

export default function SearchPage() {
  const navigate        = useNavigate();
  const { user, token } = useAuth();
  const [tab, setTab]   = useState("maps"); // "maps" | "linkedin" | "urls"

  return (
    <div className="inner-page">
      <InnerHeader title="New Search" />

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:8, padding:"0 24px", marginBottom:8 }}>
        <button onClick={()=>setTab("maps")} style={tabStyle(tab==="maps")}>
          🗺️ Google Maps
        </button>
        <button onClick={()=>setTab("linkedin")} style={tabStyle(tab==="linkedin")}>
          🔗 LinkedIn Search
        </button>
        <button onClick={()=>setTab("urls")} style={tabStyle(tab==="urls")}>
          🌐 Scrape from URLs
        </button>
      </div>

      {tab === "maps"     && <MapsSearch user={user} token={token} navigate={navigate} />}
      {tab === "linkedin" && <LinkedInSearch user={user} token={token} />}
      {tab === "urls"     && <URLScraper user={user} token={token} />}
    </div>
  );
}

function tabStyle(active) {
  return {
    padding:"9px 18px", borderRadius:"10px 10px 0 0", border:"none", cursor:"pointer",
    fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
    background: active ? "#fff" : "transparent",
    color: active ? "#E8005A" : "#888",
    borderBottom: active ? "2px solid #E8005A" : "2px solid transparent",
  };
}

// ─── Google Maps Search ────────────────────────────────────────────────────────
function MapsSearch({ user, token, navigate }) {
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
  const [showAddDB, setShowAddDB] = useState(false);
  const pollRef = useRef(null);

  const handleSearch = async () => {
    if (!query||!city||!country) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true); setSearched(false); setResults([]);
    setLoadMsg("Connecting to Google Maps...");
    try {
      const res  = await fetch(`${API}/api/scrape?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&start=${start}&end=${end}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed to start search");
      setJobId(data.job_id);
      if (data.queue_position > 0) {
        setLoadMsg(`Your search is queued at position ${data.queue_position} — results will save automatically.`);
      } else {
        setLoadMsg("Your search is in progress — this may take a couple of minutes.");
      }
      pollRef.current = setInterval(async () => {
        try {
          const jr = await fetch(`${API}/api/job/${data.job_id}`);
          const jd = await jr.json();
          if (jd.status==="done"||jd.status==="cancelled") {
            clearInterval(pollRef.current);
            setResults(jd.results||[]); setSearched(true); setLoading(false); setJobId(null);
          } else if (jd.status==="error") {
            clearInterval(pollRef.current); setError(jd.error||"Something went wrong"); setLoading(false); setJobId(null);
          } else if (jd.queue_position > 0) {
            setLoadMsg(`Your search is queued at position ${jd.queue_position} — results will save automatically.`);
          } else if (jd.status==="starting") {
            setLoadMsg("Starting search…");
          } else {
            const progress = jd.progress || 0;
            const total    = jd.total || (end - start);
            setLoadMsg(`Scanning companies… ${progress}/${total} processed.`);
          }
        } catch {}
      }, 4000);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  const handleCancel = async () => {
    if (!jobId) return;
    try { await fetch(`${API}/api/job/${jobId}/cancel`, { method:"POST" }); setLoadMsg("Cancelling…"); } catch {}
  };

  const handleExport = () => {
    if (!results.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
      const rows    = results.map(r => [r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let row = 1; row <= range.e.r; row++) {
        const ref = XLSX.utils.encode_cell({ r: row, c: 2 });
        if (ws[ref]) { ws[ref].t = "s"; ws[ref].z = "@"; }
      }
      ws["!cols"] = [{wch:30},{wch:30},{wch:18},{wch:35},{wch:18},{wch:18},{wch:22}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ReachCT Export");
      XLSX.writeFile(wb, `reachct_maps_${new Date().toISOString().slice(0,10)}.xlsx`);
    });
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
    const rows    = results.map(r => [r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
    const tsv     = [headers,...rows].map(r=>r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(()=>alert("Copied! Paste into Google Sheets or Excel."));
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <>
      <div className="form-area">
        <div className="form-card">
          <div className="form-title">Search Google Maps</div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 0.6fr 0.6fr", gap:16, marginBottom:16 }}>
            <div>
              <label className="field-label">Business Type</label>
              <select className="field-select" value={query} onChange={e=>setQuery(e.target.value)}>
                <option value="">Select company type…</option>
                {Object.entries(COMPANY_TYPES_GROUPED).map(([letter, types]) => (
                  <optgroup key={letter} label={`── ${letter} ──`}>
                    {types.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">City</label>
              <input className="field-input" value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Munich"/>
            </div>
            <div>
              <label className="field-label">Country</label>
              <input className="field-input" value={country} onChange={e=>setCountry(e.target.value)} placeholder="e.g. Germany"/>
            </div>
            <div>
              <label className="field-label">Start</label>
              <input className="field-input" type="number" min="0" value={start}
                onChange={e=>{ const v=e.target.value; setStart(v===""?"":Number(v)); }}
                onBlur={e=>{ if(e.target.value==="") setStart(0); }}/>
            </div>
            <div>
              <label className="field-label">End (max +50)</label>
              <input className="field-input" type="number" min="1" value={end}
                onChange={e=>{ const v=e.target.value; setEnd(v===""?"":Math.min(Number(v),(start||0)+50)); }}
                onBlur={e=>{ if(e.target.value==="") setEnd(25); }}/>
            </div>
          </div>
          <p className="hint">Use English spelling — "Spain" not "España", "Munich" not "München"</p>
          <p className="batch-tip">
            💡 <strong>Tip:</strong> Run searches in batches of 25 for quicker results — e.g. 0→25, then 25→50.&nbsp;
            <button className="batch-tip-link" onClick={()=>navigate("/info")}>How to use ReachCT →</button>
          </p>
          <div className="btn-row">
            <button className="btn-primary" onClick={handleSearch} disabled={loading}>
              <SearchIcon/>{loading?"Searching…":"Search"}
            </button>
            {loading && (
              <button className="btn-danger" onClick={handleCancel}>
                <StopIcon/>Stop
              </button>
            )}
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
              <span>{results.length}</span> companies found &nbsp;·&nbsp;
              <span style={{ color:"#E8005A" }}>{results.filter(r=>r.email).length}</span> emails found
            </div>
            <div className="btn-row">
              {user && <button className="btn-primary" onClick={()=>setShowAddDB(true)}>+ Add to Database</button>}
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <ResultsTable data={results}/>
        </div>
      )}

      {showAddDB && (
        <AddToDBModal
          dbKind="maps"
          rows={results.map(r=>({ name:r.name||"", email:r.email||"", phone:r.phone||"",
            website:r.website||"", city:r.city||"", country:r.country||"", company_type:r.company_type||"" }))}
          onClose={()=>setShowAddDB(false)}
        />
      )}
    </>
  );
}

// ─── LinkedIn Search (Smart only — Bulk removed) ───────────────────────────────
function LinkedInSearch({ user, token }) {
  const [companyType,   setCompanyType]   = useState("");
  const [city,          setCity]          = useState("");
  const [role,          setRole]          = useState("HR");
  const [start,         setStart]         = useState(0);
  const [end,           setEnd]           = useState(25);
  const [filters,       setFilters]       = useState({ company_types:[], cities:{} });
  const [loading,       setLoading]       = useState(false);
  const [loadMsg,       setLoadMsg]       = useState("");
  const [results,       setResults]       = useState([]);
  const [searched,      setSearched]      = useState(false);
  const [error,         setError]         = useState("");
  const [jobId,         setJobId]         = useState(null);
  const [showAddDB,     setShowAddDB]     = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/filters`).then(r=>r.json()).then(setFilters).catch(()=>{});
  }, []);

  const allCities = filters?.cities ? Object.values(filters.cities).flat() : [];

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await fetch(`${API}/api/linkedin/cancel/${jobId}`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}` },
      });
      setLoadMsg("Cancelling — collecting results so far…");
    } catch {}
  };

  const handleSmartSearch = async () => {
    if (!companyType || !city) { setError("Please select a company type and city."); return; }
    setError(""); setLoading(true); setSearched(false); setResults([]);
    setLoadMsg("Looking up companies in database…");
    try {
      const res = await fetch(`${API}/api/linkedin/smart`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ company_type:companyType, city, role, start:Number(start), end:Number(end) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed");

      const newJobId = data.job_id;
      setJobId(newJobId);

      if (data.queue_position > 0) {
        setLoadMsg(`Search queued at position ${data.queue_position} — will start automatically.`);
      } else {
        setLoadMsg(`Found ${data.total_companies} companies — searching LinkedIn for ${role}…`);
      }

      pollRef.current = setInterval(async () => {
        try {
          const jr = await fetch(`${API}/api/linkedin/status/${newJobId}`, {
            headers:{ Authorization:`Bearer ${token}` },
          });
          const jd = await jr.json();

          if (jd.status==="done" || jd.status==="cancelled") {
            clearInterval(pollRef.current);
            setResults(jd.results||[]); setSearched(true); setLoading(false); setJobId(null);
          } else if (jd.status==="error") {
            clearInterval(pollRef.current); setError(jd.error||"Search failed"); setLoading(false); setJobId(null);
          } else if (jd.status==="queued" && jd.queue_position > 0) {
            setLoadMsg(`Search queued at position ${jd.queue_position} — will start automatically.`);
          } else if (jd.status==="starting") {
            setLoadMsg(`Starting search across ${data.total_companies} companies…`);
          } else {
            const found     = jd.found || 0;
            const idx       = jd.company_index || 0;
            const total     = jd.total_companies || data.total_companies || 0;
            const company   = jd.processing || "…";
            setLoadMsg(`Searching ${company} (${idx}/${total}) — ${found} people found so far`);
          }
        } catch {}
      }, 3000);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  const handleExport = () => {
    if (!results.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Full Name","Job Title","Company","Email","Confidence","LinkedIn URL","Location"];
      const rows    = results.map(r => [r.full_name||"",r.job_title||"",r.company||"",r.email||"",r.confidence||"",r.linkedin_url||"",r.location||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = [{wch:24},{wch:24},{wch:22},{wch:30},{wch:14},{wch:40},{wch:18}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "LinkedIn Export");
      XLSX.writeFile(wb, `reachct_linkedin_${new Date().toISOString().slice(0,10)}.xlsx`);
    });
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Full Name","Job Title","Company","Email","Confidence","LinkedIn URL","Location"];
    const rows    = results.map(r => [r.full_name||"",r.job_title||"",r.company||"",r.email||"",r.confidence||"",r.linkedin_url||"",r.location||""]);
    const tsv     = [headers,...rows].map(r=>r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(()=>alert("Copied!"));
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const confColor = (c) => c==="verified" ? "#16a34a" : c==="catch-all" ? "#ca8a04" : c==="guess"||c==="unverified" ? "#dc2626" : "#999";

  return (
    <>
      <div className="form-area">
        <div className="form-card">
          <div className="form-title">Find People on LinkedIn</div>
          <p className="hint" style={{ marginTop:-4, marginBottom:16 }}>
            Pulls companies from your ReachCT database and automatically finds decision makers on LinkedIn.
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 0.5fr 0.5fr", gap:16, marginBottom:16 }}>
            <div>
              <label className="field-label">Company Type</label>
              <select className="field-select" value={companyType} onChange={e=>setCompanyType(e.target.value)}>
                <option value="">Select company type…</option>
                {(filters?.company_types||[]).map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">City</label>
              <select className="field-select" value={city} onChange={e=>setCity(e.target.value)}>
                <option value="">Select city…</option>
                {allCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Role to find</label>
              <input className="field-input" value={role} onChange={e=>setRole(e.target.value)}
                placeholder="e.g. HR, Director"/>
            </div>
            <div>
              <label className="field-label">Start company</label>
              <input className="field-input" type="number" min="0" value={start}
                onChange={e=>{ const v=e.target.value; setStart(v===""?"":Number(v)); }}
                onBlur={e=>{ if(e.target.value==="") setStart(0); }}/>
            </div>
            <div>
              <label className="field-label">End company</label>
              <input className="field-input" type="number" min="1" value={end}
                onChange={e=>{ const v=e.target.value; setEnd(v===""?"":Number(v)); }}
                onBlur={e=>{ if(e.target.value==="") setEnd(10); }}/>
            </div>

            <div style={{ gridColumn:"span 5", background:"rgba(232,0,90,0.04)", border:"1px solid rgba(232,0,90,0.15)",
              borderRadius:10, padding:"12px 16px", fontSize:12, color:"#666" }}>
              💡 ReachCT will pull <strong>{companyType||"companies"}</strong> in <strong>{city||"selected city"}</strong> (companies {start}→{end})
              from the database and find the most relevant <strong>{role}</strong> at each — 1 person per company.
            </div>
          </div>

          <div className="btn-row">
            <button className="btn-primary" onClick={handleSmartSearch} disabled={loading}>
              <SearchIcon/>{loading?"Searching…":"Find People"}
            </button>
            {loading && (
              <button className="btn-danger" onClick={handleCancel}>
                <StopIcon/>Stop &amp; get results
              </button>
            )}
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
              <span>{results.length}</span> people found &nbsp;·&nbsp;
              <span style={{ color:"#E8005A" }}>{results.filter(r=>r.email).length}</span> emails found
            </div>
            <div className="btn-row">
              {user && <button className="btn-primary" onClick={()=>setShowAddDB(true)}>+ Add to Database</button>}
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Full Name</th><th>Job Title</th><th>Company</th>
                  <th>Email</th><th>Confidence</th><th>LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.full_name}</td>
                    <td>{r.job_title}</td>
                    <td>{r.company}</td>
                    <td style={{ color: r.email ? "#E8005A" : "#ccc" }}>{r.email||"—"}</td>
                    <td>
                      <span style={{ color:confColor(r.confidence), fontSize:12, fontWeight:600 }}>
                        {r.confidence||"—"}
                      </span>
                    </td>
                    <td>{r.linkedin_url
                      ? <a href={r.linkedin_url} target="_blank" rel="noreferrer" style={{ color:"#0a66c2" }}>Profile →</a>
                      : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddDB && (
        <AddToDBModal
          dbKind="linkedin"
          rows={results.map(r=>({ full_name:r.full_name||"", job_title:r.job_title||"", company:r.company||"",
            email:r.email||"", linkedin_url:r.linkedin_url||"", location:r.location||"" }))}
          onClose={()=>setShowAddDB(false)}
        />
      )}
    </>
  );
}

// ─── URL Scraper ──────────────────────────────────────────────────────────────
function URLScraper({ user, token }) {
  const [companyType, setCompanyType] = useState("");
  const [urlText,     setUrlText]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [loadMsg,     setLoadMsg]     = useState("");
  const [results,     setResults]     = useState([]);
  const [skipped,     setSkipped]     = useState([]);
  const [searched,    setSearched]    = useState(false);
  const [error,       setError]       = useState("");
  const [jobId,       setJobId]       = useState(null);
  const [showAddDB,   setShowAddDB]   = useState(false);
  const pollRef = useRef(null);

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await fetch(`${API}/api/scrape/urls/cancel/${jobId}`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}` },
      });
      setLoadMsg("Cancelling — collecting results so far…");
    } catch {}
  };

  const handleScrape = async () => {
    const urls = urlText.split("\n").map(u=>u.trim()).filter(Boolean);
    if (!companyType) { setError("Please select a company type."); return; }
    if (!urls.length) { setError("Please paste at least one URL."); return; }
    setError(""); setLoading(true); setSearched(false); setResults([]); setSkipped([]);
    setLoadMsg("Starting URL scraper…");
    try {
      const res = await fetch(`${API}/api/scrape/urls`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ urls, company_type:companyType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed to start");

      const newJobId = data.job_id;
      setJobId(newJobId);

      if (data.queue_position > 0) {
        setLoadMsg(`Scraper queued at position ${data.queue_position} — will start automatically.`);
      } else {
        setLoadMsg(`Starting scrape of ${urls.length} URLs…`);
      }

      pollRef.current = setInterval(async () => {
        try {
          const jr = await fetch(`${API}/api/scrape/urls/status/${newJobId}`, {
            headers:{ Authorization:`Bearer ${token}` },
          });
          const jd = await jr.json();

          if (jd.status==="done" || jd.status==="cancelled") {
            clearInterval(pollRef.current);
            setResults(jd.results||[]); setSkipped(jd.skipped_urls||[]);
            setSearched(true); setLoading(false); setJobId(null);
          } else if (jd.status==="error") {
            clearInterval(pollRef.current); setError(jd.error||"Failed"); setLoading(false); setJobId(null);
          } else if (jd.status==="queued" && jd.queue_position > 0) {
            setLoadMsg(`Scraper queued at position ${jd.queue_position} — will start automatically.`);
          } else if (jd.status==="starting") {
            setLoadMsg(`Starting scrape of ${urls.length} URLs…`);
          } else {
            const url     = jd.processing || "…";
            const idx     = jd.index || 0;
            const total   = jd.total || urls.length;
            const found   = jd.found || 0;
            const skippedCount = jd.skipped || 0;
            setLoadMsg(`Scraping ${url} (${idx}/${total}) — ${found} emails found, ${skippedCount} skipped`);
          }
        } catch {}
      }, 3000);
    } catch(e) { setError(e.message); setLoading(false); }
  };

  const handleExport = () => {
    if (!results.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Company Name","Email","Website","Company Type"];
      const rows    = results.map(r=>[r.name||"",r.email||"",r.website||"",r.company_type||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = [{wch:30},{wch:30},{wch:40},{wch:22}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "URL Scrape Export");
      XLSX.writeFile(wb, `reachct_urls_${new Date().toISOString().slice(0,10)}.xlsx`);
    });
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Company Name","Email","Website","Company Type"];
    const rows    = results.map(r=>[r.name||"",r.email||"",r.website||"",r.company_type||""]);
    const tsv     = [headers,...rows].map(r=>r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(()=>alert("Copied!"));
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <>
      <div className="form-area">
        <div className="form-card">
          <div className="form-title">Scrape Emails from URLs</div>
          <p className="hint" style={{ marginTop:-4, marginBottom:16 }}>
            Paste company website URLs — ReachCT visits each one and extracts emails. Companies without emails are skipped.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginBottom:16 }}>
            <div>
              <label className="field-label">Company Type <span style={{color:"#E8005A"}}>*</span></label>
              <select className="field-select" value={companyType} onChange={e=>setCompanyType(e.target.value)}>
                <option value="">Select type…</option>
                {Object.entries(COMPANY_TYPES_GROUPED).map(([letter, types]) => (
                  <optgroup key={letter} label={`── ${letter} ──`}>
                    {types.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </optgroup>
                ))}
              </select>
              <p style={{ fontSize:11, color:"#999", marginTop:6 }}>
                All scraped companies will be saved with this type.
              </p>
            </div>
            <div>
              <label className="field-label">Website URLs (one per line)</label>
              <textarea className="field-input" rows={8} value={urlText} onChange={e=>setUrlText(e.target.value)}
                placeholder={"https://kreaset.com\nhttps://optimoclick.com\nhttps://theagency.es"}
                style={{ resize:"vertical", fontFamily:"monospace", fontSize:12, lineHeight:1.6 }}/>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-primary" onClick={handleScrape} disabled={loading}>
              <SearchIcon/>{loading?"Scraping…":"Scrape Emails"}
            </button>
            {loading && (
              <button className="btn-danger" onClick={handleCancel}>
                <StopIcon/>Stop &amp; get results
              </button>
            )}
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
              <span>{results.length}</span> emails found &nbsp;·&nbsp;
              <span style={{color:"#999"}}>{skipped.length}</span> skipped (no email)
            </div>
            <div className="btn-row">
              {user && <button className="btn-primary" onClick={()=>setShowAddDB(true)}>+ Add to Database</button>}
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table className="results-table">
              <thead><tr><th>Company</th><th>Email</th><th>Website</th><th>Type</th></tr></thead>
              <tbody>
                {results.map((r,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:500}}>{r.name}</td>
                    <td style={{color:"#E8005A"}}>{r.email}</td>
                    <td>
                      <a href={r.website} target="_blank" rel="noreferrer"
                        style={{color:"#666",fontSize:12}}>
                        {r.website.replace(/https?:\/\/(www\.)?/,"").slice(0,35)}
                      </a>
                    </td>
                    <td style={{fontSize:12,color:"#888"}}>{r.company_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {skipped.length > 0 && (
            <div style={{ marginTop:16, padding:"12px 16px", background:"#f9f9f9",
              borderRadius:10, fontSize:12, color:"#999" }}>
              <strong>Skipped (no email found):</strong> {skipped.join(", ")}
            </div>
          )}
        </div>
      )}

      {showAddDB && (
        <AddToDBModal
          dbKind="maps"
          rows={results.map(r=>({ name:r.name||"", email:r.email||"", phone:"",
            website:r.website||"", city:"", country:"", company_type:r.company_type||"" }))}
          onClose={()=>setShowAddDB(false)}
        />
      )}
    </>
  );
}