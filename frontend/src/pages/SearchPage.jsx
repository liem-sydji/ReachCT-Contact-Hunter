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

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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

  const attachMapsPoll = (job_id, totalHint) => {
    pollRef.current = setInterval(async () => {
      try {
        const jr = await fetch(`${API}/api/job/${job_id}`);
        if (jr.status === 404) {
          clearInterval(pollRef.current); setLoading(false);
          localStorage.removeItem("reachct-job-maps");
          setError("Search job not found — the server may have restarted. Results already scraped are saved to the shared database.");
          return;
        }
        const jd = await jr.json();
        if (jd.status==="done"||jd.status==="cancelled") {
          clearInterval(pollRef.current);
          setResults(jd.results||[]); setSearched(true); setLoading(false); setJobId(null);
          localStorage.removeItem("reachct-job-maps");
          if (Notification.permission==="granted") {
            const count = (jd.results||[]).length;
            new Notification("ReachCT — Maps search done", {
              body: `${count} companies found for "${query}" in ${city}, ${country}`,
            });
          }
        } else if (jd.status==="error") {
          clearInterval(pollRef.current); setError(jd.error||"Something went wrong"); setLoading(false); setJobId(null);
          localStorage.removeItem("reachct-job-maps");
        } else if (jd.status==="cancelling") {
          setLoadMsg("Cancelling — saving results collected so far…");
        } else if (jd.queue_position > 0) {
          setLoadMsg(`Your search is queued at position ${jd.queue_position} — results will save automatically.`);
        } else if (jd.status==="starting") {
          setLoadMsg("Starting search…");
        } else {
          const progress = jd.progress || 0;
          const total    = jd.total || totalHint || 25;
          setLoadMsg(`Scanning companies… ${progress}/${total} processed.`);
        }
      } catch {}
    }, 4000);
  };

  const handleSearch = async () => {
    if (!query||!city||!country) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true); setSearched(false); setResults([]);
    setLoadMsg("Connecting to Google Maps...");
    try {
      const res  = await fetch(`${API}/api/scrape?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&start=${start}&end=${end}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed to start search");
      setJobId(data.job_id);
      localStorage.setItem("reachct-job-maps", JSON.stringify({ job_id: data.job_id, started_at: Date.now() }));
      if (data.queue_position > 0) {
        setLoadMsg(`Your search is queued at position ${data.queue_position} — results will save automatically.`);
      } else {
        setLoadMsg("Your search is in progress — this may take a couple of minutes.");
      }
      attachMapsPoll(data.job_id, end - start);
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
      const _fn1 = `reachct_maps_${new Date().toISOString().slice(0,10)}.xlsx`;
      const _buf1 = XLSX.write(wb, { bookType:"xlsx", type:"array" });
      const _blob1 = new Blob([_buf1], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const _url1 = URL.createObjectURL(_blob1);
      const _a1 = document.createElement("a"); _a1.href = _url1; _a1.download = _fn1;
      document.body.appendChild(_a1); _a1.click(); document.body.removeChild(_a1);
      URL.revokeObjectURL(_url1);
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

  // Reconnect to a running job after page refresh
  useEffect(() => {
    const saved = localStorage.getItem("reachct-job-maps");
    if (!saved) return;
    try {
      const { job_id } = JSON.parse(saved);
      if (!job_id) return;
      setJobId(job_id); setLoading(true);
      setLoadMsg("Reconnecting to your running search…");
      attachMapsPoll(job_id, 25);
    } catch { localStorage.removeItem("reachct-job-maps"); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

// ─── LinkedIn Search ───────────────────────────────────────────────────────────
function LinkedInSearch({ user, token }) {
  const [mode,          setMode]          = useState("people"); // "people" | "internships"
  const [loading,       setLoading]       = useState(false);
  const [loadMsg,       setLoadMsg]       = useState("");
  const [error,         setError]         = useState("");
  const [jobId,         setJobId]         = useState(null);
  const [searched,      setSearched]      = useState(false);
  const [showAddDB,     setShowAddDB]     = useState(false);

  // People mode state
  const [companyType,   setCompanyType]   = useState("");
  const [city,          setCity]          = useState("");
  const [country,       setCountry]       = useState("");
  const [maxResults,    setMaxResults]    = useState(15);
  const [peopleResults, setPeopleResults] = useState([]);

  // Internship mode state
  const [internTitle,   setInternTitle]   = useState("");
  const [internCity,    setInternCity]    = useState("");
  const [internCountry, setInternCountry] = useState("");
  const [internMax,     setInternMax]     = useState(15);
  const [internResults, setInternResults] = useState([]);

  const pollRef = useRef(null);

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await fetch(`${API}/api/linkedin/cancel/${jobId}`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
      setLoadMsg("Cancelling — collecting results so far…");
    } catch {}
  };

  const attachLinkedInPoll = (newJobId, onDone, lsKey, notifMsg) => {
    pollRef.current = setInterval(async () => {
      try {
        const jr = await fetch(`${API}/api/linkedin/status/${newJobId}`, { headers:{ Authorization:`Bearer ${token}` } });
        if (jr.status === 404) {
          clearInterval(pollRef.current); setLoading(false);
          if (lsKey) localStorage.removeItem(lsKey);
          setError("Job not found — the server may have restarted. Any results scraped were saved to the shared database.");
          return;
        }
        const jd = await jr.json();
        if (jd.status==="done"||jd.status==="cancelled") {
          clearInterval(pollRef.current);
          onDone(jd.results||[]);
          setSearched(true); setLoading(false); setJobId(null);
          if (lsKey) localStorage.removeItem(lsKey);
          if (Notification.permission==="granted") {
            const count = (jd.results||[]).length;
            new Notification("ReachCT — LinkedIn search done", {
              body: `${count} results${notifMsg ? ` · ${notifMsg}` : ""}`,
            });
          }
        } else if (jd.status==="error") {
          clearInterval(pollRef.current);
          setError(jd.error||"Search failed"); setLoading(false); setJobId(null);
          if (lsKey) localStorage.removeItem(lsKey);
        } else {
          const found = jd.found||(jd.results||[]).length;
          setLoadMsg(jd.queue_position > 0
            ? `Queued at position ${jd.queue_position}…`
            : `Searching… (${found} found so far)`);
        }
      } catch {}
    }, 4000);
  };

  const handlePeopleSearch = async () => {
    if (!companyType) { setError("Company type / role is required."); return; }
    setError(""); setLoading(true); setSearched(false); setPeopleResults([]);
    setLoadMsg("Starting LinkedIn people search…");
    try {
      const res  = await fetch(`${API}/api/linkedin/people`, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ company_type:companyType, city, country, max_results:maxResults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed");
      setJobId(data.job_id);
      localStorage.setItem("reachct-job-li", JSON.stringify({ job_id:data.job_id, mode:"people", started_at:Date.now() }));
      setLoadMsg(data.queue_position > 0 ? `Queued at position ${data.queue_position}…` : "Searching LinkedIn…");
      attachLinkedInPoll(data.job_id, setPeopleResults, "reachct-job-li",
        `${companyType}${city ? ` · ${city}` : ""}${country ? `, ${country}` : ""}`);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  const handleInternSearch = async () => {
    if (!internTitle) { setError("Internship title is required."); return; }
    setError(""); setLoading(true); setSearched(false); setInternResults([]);
    setLoadMsg("Starting LinkedIn internship search…");
    try {
      const res  = await fetch(`${API}/api/linkedin/companies`, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ intern_title:internTitle, city:internCity, country:internCountry, max_results:internMax }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed");
      setJobId(data.job_id);
      localStorage.setItem("reachct-job-li", JSON.stringify({ job_id:data.job_id, mode:"internships", started_at:Date.now() }));
      setLoadMsg(data.queue_position > 0 ? `Queued at position ${data.queue_position}…` : "Searching LinkedIn Jobs…");
      attachLinkedInPoll(data.job_id, setInternResults, "reachct-job-li",
        `${internTitle}${internCity ? ` · ${internCity}` : ""}${internCountry ? `, ${internCountry}` : ""}`);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  const handleExportPeople = () => {
    if (!peopleResults.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Full Name","Company Type","Role","Company","LinkedIn URL","Email"];
      const rows    = peopleResults.map(r=>[r.full_name||"",r.company_type||"",r.profile_title||"",r.company||"",r.linkedin_url||"",r.email||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers,...rows]);
      ws["!cols"] = [{wch:24},{wch:16},{wch:32},{wch:24},{wch:50},{wch:30}];
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"LinkedIn People");
      const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
      a.download = `reachct_people_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
  };

  const handleExportIntern = () => {
    if (!internResults.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Internship","Type","Company","Email","Website","LinkedIn URL","City","Country"];
      const rows    = internResults.map(r=>[r.internship||"",r.internship_type||"",r.company||"",r.email||"",r.company_website||"",r.linkedin_url||"",r.city||"",r.country||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers,...rows]);
      ws["!cols"] = [{wch:32},{wch:18},{wch:24},{wch:28},{wch:30},{wch:50},{wch:18},{wch:18}];
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"LinkedIn Internships");
      const buf = XLSX.write(wb,{bookType:"xlsx",type:"array"});
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
      a.download = `reachct_internships_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
  };

  const handleCopyPeople = () => {
    const h = ["Full Name","Company Type","Role","Company","LinkedIn URL","Email"];
    const rows = peopleResults.map(r=>[r.full_name||"",r.company_type||"",r.profile_title||"",r.company||"",r.linkedin_url||"",r.email||""]);
    navigator.clipboard.writeText([h,...rows].map(r=>r.join("\t")).join("\n")).then(()=>alert("Copied!"));
  };

  const handleCopyIntern = () => {
    const h = ["Internship","Type","Company","Email","Website","LinkedIn URL","City","Country"];
    const rows = internResults.map(r=>[r.internship||"",r.internship_type||"",r.company||"",r.email||"",r.company_website||"",r.linkedin_url||"",r.city||"",r.country||""]);
    navigator.clipboard.writeText([h,...rows].map(r=>r.join("\t")).join("\n")).then(()=>alert("Copied!"));
  };

  const switchMode = (m) => { setMode(m); setSearched(false); setError(""); clearInterval(pollRef.current); setLoading(false); setJobId(null); };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Reconnect to a running LinkedIn job after page refresh
  useEffect(() => {
    if (!token) return;
    const saved = localStorage.getItem("reachct-job-li");
    if (!saved) return;
    try {
      const { job_id, mode: savedMode } = JSON.parse(saved);
      if (!job_id) return;
      setMode(savedMode || "people");
      setJobId(job_id); setLoading(true);
      setLoadMsg("Reconnecting to your running search…");
      const onDone = savedMode === "internships" ? setInternResults : setPeopleResults;
      attachLinkedInPoll(job_id, onDone, "reachct-job-li");
    } catch { localStorage.removeItem("reachct-job-li"); }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const btnTab = (active, color, label, onClick) => (
    <button onClick={onClick} style={{
      padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer",
      fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
      background: active ? color : "#f0f0f0", color: active ? "#fff" : "#888",
      transition:"all 0.15s",
    }}>{label}</button>
  );

  return (
    <>
      <div className="form-area">
        <div className="form-card">
          {/* Mode tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            {btnTab(mode==="people",      "#E8005A", "🔗 People Search",     ()=>switchMode("people"))}
            {btnTab(mode==="internships", "#9333ea", "🎓 Internship Search", ()=>switchMode("internships"))}
          </div>

          {mode === "people" && (
            <>
              <div className="form-title">Find People on LinkedIn</div>
              <p className="hint" style={{ marginTop:-4, marginBottom:16 }}>
                Search LinkedIn directly for people by company type and location.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 0.6fr", gap:16, marginBottom:16 }}>
                <div>
                  <label className="field-label">Company Type / Role <span style={{color:"#E8005A"}}>*</span></label>
                  <input className="field-input" value={companyType} onChange={e=>setCompanyType(e.target.value)}
                    placeholder="e.g. Marketing Agency"/>
                </div>
                <div>
                  <label className="field-label">City</label>
                  <input className="field-input" value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Madrid"/>
                </div>
                <div>
                  <label className="field-label">Country</label>
                  <input className="field-input" value={country} onChange={e=>setCountry(e.target.value)} placeholder="e.g. Spain"/>
                </div>
                <div>
                  <label className="field-label">Max Results</label>
                  <input className="field-input" type="number" min="1" max="50" value={maxResults}
                    onChange={e=>{ const v=e.target.value; setMaxResults(v===""?"":Math.min(50,Number(v))); }}
                    onBlur={e=>{ if(e.target.value==="") setMaxResults(15); else setMaxResults(Math.max(1,Math.min(50,Number(e.target.value)))); }}/>
                </div>
              </div>
              <div className="btn-row">
                <button className="btn-primary" onClick={handlePeopleSearch} disabled={loading}>
                  <SearchIcon/>{loading?"Searching…":"Find People"}
                </button>
                {loading && <button className="btn-danger" onClick={handleCancel}><StopIcon/>Stop &amp; get results</button>}
              </div>
            </>
          )}

          {mode === "internships" && (
            <>
              <div className="form-title">Find Internships on LinkedIn</div>
              <p className="hint" style={{ marginTop:-4, marginBottom:16 }}>
                Search LinkedIn Jobs for internship listings by title and location.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 0.6fr", gap:16, marginBottom:16 }}>
                <div>
                  <label className="field-label">Internship Title <span style={{color:"#9333ea"}}>*</span></label>
                  <input className="field-input" value={internTitle} onChange={e=>setInternTitle(e.target.value)}
                    placeholder="e.g. Marketing Internship"/>
                </div>
                <div>
                  <label className="field-label">City</label>
                  <input className="field-input" value={internCity} onChange={e=>setInternCity(e.target.value)} placeholder="e.g. Barcelona"/>
                </div>
                <div>
                  <label className="field-label">Country</label>
                  <input className="field-input" value={internCountry} onChange={e=>setInternCountry(e.target.value)} placeholder="e.g. Spain"/>
                </div>
                <div>
                  <label className="field-label">Max Results</label>
                  <input className="field-input" type="number" min="1" max="50" value={internMax}
                    onChange={e=>{ const v=e.target.value; setInternMax(v===""?"":Math.min(50,Number(v))); }}
                    onBlur={e=>{ if(e.target.value==="") setInternMax(15); else setInternMax(Math.max(1,Math.min(50,Number(e.target.value)))); }}/>
                </div>
              </div>
              <div className="btn-row">
                <button className="btn-primary" onClick={handleInternSearch} disabled={loading}
                  style={{ background: loading ? "rgba(147,51,234,0.5)" : "#9333ea" }}>
                  <SearchIcon/>{loading?"Searching…":"Find Internships"}
                </button>
                {loading && <button className="btn-danger" onClick={handleCancel}><StopIcon/>Stop &amp; get results</button>}
              </div>
            </>
          )}

          {error && <div className="error-msg">{error}</div>}
          {loading && (
            <div className="loading-area">
              <div className="spinner" style={{ borderTopColor: mode==="internships"?"#9333ea":"#E8005A" }}/>
              <p className="loading-msg">{loadMsg}</p>
            </div>
          )}
        </div>
      </div>

      {/* People results */}
      {mode==="people" && searched && (
        <div className="results-area">
          <div className="results-header">
            <div className="results-count">
              <span>{peopleResults.length}</span> people found &nbsp;·&nbsp;
              <span style={{ color:"#E8005A" }}>{peopleResults.filter(r=>r.email).length}</span> with email
            </div>
            <div className="btn-row">
              {user && peopleResults.length > 0 && (
                <button className="btn-primary" onClick={()=>setShowAddDB(true)}>
                  + Add to Database ({peopleResults.length})
                </button>
              )}
              <button className="btn-secondary" onClick={handleExportPeople}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopyPeople}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Full Name</th><th>Company Type</th><th>Role</th><th>Company</th>
                  <th>LinkedIn URL <span style={{fontWeight:400,color:"#aaa",fontSize:11}}>(click to copy)</span></th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {peopleResults.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{r.full_name}</td>
                    <td><span style={{ background:"rgba(232,0,90,0.08)", border:"1px solid rgba(232,0,90,0.15)",
                      borderRadius:6, padding:"2px 8px", fontSize:11, color:"#E8005A", fontWeight:600,
                      whiteSpace:"nowrap" }}>{r.company_type||"—"}</span></td>
                    <td style={{ color:"#666", fontSize:12 }}>{r.profile_title||"—"}</td>
                    <td>{r.company||"—"}</td>
                    <td style={{ maxWidth:280 }}>
                      {r.linkedin_url ? (
                        <span onClick={()=>{
                            navigator.clipboard.writeText(r.linkedin_url);
                            const el=document.getElementById(`url-copied-${i}`);
                            if(el){el.style.opacity=1;setTimeout(()=>{el.style.opacity=0;},1400);}
                          }} title="Click to copy"
                          style={{ fontFamily:"monospace", fontSize:11, color:"#0a66c2",
                            wordBreak:"break-all", cursor:"pointer", display:"block",
                            padding:"4px 0", borderBottom:"1px dashed #bfdbfe", userSelect:"none" }}>
                          {r.linkedin_url}
                          <span id={`url-copied-${i}`} style={{ marginLeft:6, fontSize:10,
                            color:"#16a34a", opacity:0, transition:"opacity 0.2s",
                            fontFamily:"'DM Sans',sans-serif" }}>✓ copied</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ color:"#E8005A", fontSize:12 }}>{r.email||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Internship results */}
      {mode==="internships" && searched && (
        <div className="results-area">
          <div className="results-header">
            <div className="results-count">
              <span>{internResults.length}</span> internships found
            </div>
            <div className="btn-row">
              {user && internResults.length > 0 && (
                <button className="btn-primary" onClick={()=>setShowAddDB(true)}
                  style={{ background:"#9333ea" }}>
                  + Add to Database ({internResults.length})
                </button>
              )}
              <button className="btn-secondary" onClick={handleExportIntern}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopyIntern}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Internship</th><th>Type</th><th>Company</th><th>Email</th>
                  <th>Website</th>
                  <th>LinkedIn URL <span style={{fontWeight:400,color:"#aaa",fontSize:11}}>(click to copy)</span></th>
                  <th>City</th><th>Country</th>
                </tr>
              </thead>
              <tbody>
                {internResults.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500, maxWidth:200 }}>{r.internship||"—"}</td>
                    <td><span style={{ background:"rgba(147,51,234,0.08)", border:"1px solid rgba(147,51,234,0.2)",
                      borderRadius:6, padding:"2px 8px", fontSize:11, color:"#9333ea", fontWeight:600,
                      whiteSpace:"nowrap" }}>{r.internship_type||"—"}</span></td>
                    <td>{r.company||"—"}</td>
                    <td style={{ color:"#E8005A", fontSize:12 }}>{r.email||"—"}</td>
                    <td style={{ fontSize:11, maxWidth:160 }}>
                      {r.company_website
                        ? <a href={r.company_website} target="_blank" rel="noreferrer"
                            style={{ color:"#0a66c2", wordBreak:"break-all" }}>{r.company_website}</a>
                        : "—"}
                    </td>
                    <td style={{ maxWidth:240 }}>
                      {r.linkedin_url ? (
                        <span onClick={()=>{
                            navigator.clipboard.writeText(r.linkedin_url);
                            const el=document.getElementById(`iurl-${i}`);
                            if(el){el.style.opacity=1;setTimeout(()=>{el.style.opacity=0;},1400);}
                          }} title="Click to copy"
                          style={{ fontFamily:"monospace", fontSize:11, color:"#0a66c2",
                            wordBreak:"break-all", cursor:"pointer", display:"block",
                            padding:"4px 0", borderBottom:"1px dashed #bfdbfe", userSelect:"none" }}>
                          {r.linkedin_url}
                          <span id={`iurl-${i}`} style={{ marginLeft:6, fontSize:10,
                            color:"#16a34a", opacity:0, transition:"opacity 0.2s" }}>✓ copied</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ color:"#666", fontSize:12 }}>{r.city||"—"}</td>
                    <td style={{ color:"#666", fontSize:12 }}>{r.country||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddDB && mode==="people" && (
        <AddToDBModal dbKind="linkedin"
          rows={peopleResults.map(r=>({
            full_name:r.full_name||"", company_type:r.company_type||"",
            profile_title:r.profile_title||"", company:r.company||"",
            email:r.email||"", linkedin_url:r.linkedin_url||"",
          }))}
          onClose={()=>setShowAddDB(false)} />
      )}
      {showAddDB && mode==="internships" && (
        <AddToDBModal dbKind="internships"
          rows={internResults.map(r=>({
            internship:r.internship||"", internship_type:r.internship_type||"",
            company:r.company||"", email:r.email||"",
            company_website:r.company_website||"", linkedin_url:r.linkedin_url||"",
            city:r.city||"", country:r.country||"",
          }))}
          onClose={()=>setShowAddDB(false)} />
      )}
    </>
  );
}

// ─── URL Scraper ──────────────────────────────────────────────────────────────
function URLScraper({ user, token }) {
  const [companyType, setCompanyType] = useState("");
  const [urlText,     setUrlText]     = useState("");
  const [scrapeCity,    setScrapeCity]    = useState("");
  const [scrapeCountry, setScrapeCountry] = useState("");
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

  const attachUrlsPoll = (newJobId, totalHint) => {
    pollRef.current = setInterval(async () => {
      try {
        const jr = await fetch(`${API}/api/scrape/urls/status/${newJobId}`, { headers:{ Authorization:`Bearer ${token}` } });
        if (jr.status === 404) {
          clearInterval(pollRef.current); setLoading(false);
          localStorage.removeItem("reachct-job-urls");
          setError("Scrape job not found — the server may have restarted. Results already found are saved to the shared database.");
          return;
        }
        const jd = await jr.json();
        if (jd.status==="done" || jd.status==="cancelled") {
          clearInterval(pollRef.current);
          setResults(jd.results||[]); setSkipped(jd.skipped_urls||[]);
          setSearched(true); setLoading(false); setJobId(null);
          localStorage.removeItem("reachct-job-urls");
          if (Notification.permission==="granted") {
            const count = (jd.results||[]).length;
            const skip  = (jd.skipped_urls||[]).length;
            new Notification("ReachCT — URL scrape done", {
              body: `${count} emails found · ${skip} skipped · ${companyType}`,
            });
          }
        } else if (jd.status==="error") {
          clearInterval(pollRef.current); setError(jd.error||"Failed"); setLoading(false); setJobId(null);
          localStorage.removeItem("reachct-job-urls");
        } else if (jd.status==="queued" && jd.queue_position > 0) {
          setLoadMsg(`Scraper queued at position ${jd.queue_position} — will start automatically.`);
        } else if (jd.status==="starting") {
          setLoadMsg(`Starting scrape…`);
        } else {
          const url  = jd.processing || "…";
          const idx  = jd.index || 0;
          const tot  = jd.total || totalHint || "?";
          const fnd  = jd.found || 0;
          const skp  = jd.skipped || 0;
          setLoadMsg(`Scraping ${url} (${idx}/${tot}) — ${fnd} emails found, ${skp} skipped`);
        }
      } catch {}
    }, 3000);
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
        body:JSON.stringify({ urls, company_type:companyType, city:scrapeCity, country:scrapeCountry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Failed to start");
      setJobId(data.job_id);
      localStorage.setItem("reachct-job-urls", JSON.stringify({ job_id:data.job_id, total:urls.length, started_at:Date.now() }));
      setLoadMsg(data.queue_position > 0
        ? `Scraper queued at position ${data.queue_position} — will start automatically.`
        : `Starting scrape of ${urls.length} URLs…`);
      attachUrlsPoll(data.job_id, urls.length);
    } catch(e) { setError(e.message); setLoading(false); }
  };

  const handleExport = () => {
    if (!results.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
      const rows    = results.map(r=>[r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = [{wch:30},{wch:30},{wch:18},{wch:40},{wch:20},{wch:20},{wch:22}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "URL Scrape Export");
      const _fn3 = `reachct_urls_${new Date().toISOString().slice(0,10)}.xlsx`;
      const _buf3 = XLSX.write(wb, { bookType:"xlsx", type:"array" });
      const _blob3 = new Blob([_buf3], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const _url3 = URL.createObjectURL(_blob3);
      const _a3 = document.createElement("a"); _a3.href = _url3; _a3.download = _fn3;
      document.body.appendChild(_a3); _a3.click(); document.body.removeChild(_a3);
      URL.revokeObjectURL(_url3);
    });
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
    const rows    = results.map(r=>[r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
    const tsv     = [headers,...rows].map(r=>r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(()=>alert("Copied!"));
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Reconnect to a running URL scrape job after page refresh
  useEffect(() => {
    if (!token) return;
    const saved = localStorage.getItem("reachct-job-urls");
    if (!saved) return;
    try {
      const { job_id, total } = JSON.parse(saved);
      if (!job_id) return;
      setJobId(job_id); setLoading(true);
      setLoadMsg("Reconnecting to your running URL scrape…");
      attachUrlsPoll(job_id, total);
    } catch { localStorage.removeItem("reachct-job-urls"); }
  }, [token]);

  return (
    <>
      <div className="form-area">
        <div className="form-card">
          <div className="form-title">Scrape Emails from URLs</div>
          <p className="hint" style={{ marginTop:-4, marginBottom:16 }}>
            Paste company website URLs — ReachCT visits each one and extracts emails and phone numbers. Companies without emails are skipped.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginBottom:16 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
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
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label className="field-label">City (optional)</label>
                  <input className="field-input" value={scrapeCity} onChange={e=>setScrapeCity(e.target.value)} placeholder="e.g. Madrid"/>
                </div>
                <div>
                  <label className="field-label">Country (optional)</label>
                  <input className="field-input" value={scrapeCountry} onChange={e=>setScrapeCountry(e.target.value)} placeholder="e.g. Spain"/>
                </div>
              </div>
              <p style={{ fontSize:11, color:"#999", marginTop:-10 }}>
                If provided, every company is saved with this city/country instead of what the scraper detects on the site.
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
              <thead><tr><th>Company</th><th>Email</th><th>Phone</th><th>Website</th><th>City</th><th>Country</th><th>Type</th></tr></thead>
              <tbody>
                {results.map((r,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:500}}>{r.name}</td>
                    <td style={{color:"#E8005A"}}>{r.email}</td>
                    <td style={{fontSize:12,color:"#555"}}>{r.phone||"—"}</td>
                    <td>
                      <a href={r.website} target="_blank" rel="noreferrer"
                        style={{color:"#666",fontSize:12}}>
                        {r.website.replace(/https?:\/\/(www\.)?/,"").slice(0,35)}
                      </a>
                    </td>
                    <td style={{fontSize:12,color:"#555"}}>{r.city||"—"}</td>
                    <td style={{fontSize:12,color:"#555"}}>{r.country||"—"}</td>
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
          rows={results.map(r=>({ name:r.name||"", email:r.email||"", phone:r.phone||"",
            website:r.website||"", city:r.city||"", country:r.country||"", company_type:r.company_type||"" }))}
          onClose={()=>setShowAddDB(false)}
        />
      )}
    </>
  );
}