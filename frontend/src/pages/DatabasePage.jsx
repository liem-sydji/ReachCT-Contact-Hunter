import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { DatabaseIcon, DownloadIcon, CopyIcon } from "../components/icons.jsx";
import { InnerHeader, ResultsTable } from "../components/shared.jsx";
import AddToDBModal from "../components/AddToDBModal.jsx";

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ placeholder, options, value, onChange }) {
  const [inputVal, setInputVal] = useState("");
  const [open, setOpen]         = useState(false);
  const filtered = options.filter(o=>o.toLowerCase().includes(inputVal.toLowerCase())&&!value.includes(o)).slice(0,200);
  const add    = (item)=>{ onChange([...value,item]); setInputVal(""); setOpen(false); };
  const remove = (item)=>onChange(value.filter(v=>v!==item));
  return (
    <div style={{ position:"relative" }}>
      <div style={{ minHeight:42, padding:"6px 10px", border:"1.5px solid #e8e8e8", borderRadius:10,
        background:"#fff", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", cursor:"text" }}
        onClick={()=>setOpen(true)}>
        {value.map(v=>(
          <span key={v} style={{ background:"rgba(232,0,90,0.08)", border:"1px solid rgba(232,0,90,0.2)",
            borderRadius:6, padding:"2px 8px", fontSize:12, color:"#E8005A",
            display:"flex", alignItems:"center", gap:4 }}>
            {v}
            <button onClick={e=>{e.stopPropagation();remove(v);}} style={{
              background:"none",border:"none",cursor:"pointer",color:"#E8005A",fontSize:14,padding:0,lineHeight:1}}>×</button>
          </span>
        ))}
        <input value={inputVal} onChange={e=>{setInputVal(e.target.value);setOpen(true);}}
          onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}
          placeholder={value.length===0?placeholder:""}
          style={{border:"none",outline:"none",fontSize:13,flex:1,minWidth:80,
            fontFamily:"'DM Sans',sans-serif",background:"transparent"}} />
      </div>
      {open&&filtered.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#fff",
          border:"1px solid #eee",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
          maxHeight:260,overflowY:"auto",marginTop:4}}>
          {filtered.map(o=>(
            <div key={o} onMouseDown={()=>add(o)} style={{padding:"9px 14px",fontSize:13,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:"#111",background:"#fff"}}
              onMouseEnter={e=>e.target.style.background="#f9f9f9"}
              onMouseLeave={e=>e.target.style.background="#fff"}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Push Tab ─────────────────────────────────────────────────────────────────
function PushTab() {
  const { token }             = useAuth();
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/api/upload-shared`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:formData,
      });
      if (!res.ok) { const err=await res.json(); throw new Error(err.detail||"Upload failed"); }
      setResult(await res.json());
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <div className="form-title">Push Spreadsheet</div>
      <div style={{ background:"#f8f9ff", border:"1px solid #e8eeff", borderRadius:12,
        padding:"16px 20px", marginBottom:24, fontSize:13, color:"#444", lineHeight:1.7 }}>
        <strong>📋 Before uploading, make sure your file:</strong>
        <ul style={{ marginTop:8, paddingLeft:20, margin:"8px 0 0" }}>
          <li>Has clear column headers — e.g. <em>Company Name, Email, Phone, Website, City, Country</em></li>
          <li>Has one company per row</li>
          <li>Is saved as <strong>.xlsx, .xls, or .csv</strong></li>
          <li>Missing columns are fine — Claude AI will clean and standardize the data automatically</li>
        </ul>
      </div>
      <div style={{ border:"2px dashed #e8e8e8", borderRadius:12, padding:40,
        textAlign:"center", cursor:"pointer", marginBottom:20, transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="#E8005A";e.currentTarget.style.background="rgba(232,0,90,0.02)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="#e8e8e8";e.currentTarget.style.background="none";}}
        onClick={()=>document.getElementById("push-file-input").click()}>
        <div style={{fontSize:36,marginBottom:8}}>📂</div>
        <div style={{fontSize:15,fontWeight:600,color:"#111",marginBottom:4}}>
          {file?file.name:"Click to select file"}</div>
        <div style={{fontSize:13,color:"#999"}}>.xlsx, .xls, .csv supported</div>
        <input id="push-file-input" type="file" accept=".xlsx,.xls,.csv"
          style={{display:"none"}} onChange={e=>setFile(e.target.files[0])} />
      </div>
      {loading&&(
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",color:"#666",fontSize:14}}>
          <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid #eee",
            borderTopColor:"#E8005A",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
          Claude is analyzing and cleaning your data…
        </div>
      )}
      {result&&(
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,
          padding:"14px 18px",fontSize:14,color:"#166534",marginBottom:12}}>
          ✅ Successfully imported <strong>{result.inserted}</strong> companies — cleaned by Claude AI
        </div>
      )}
      {error&&<div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleUpload} disabled={!file||loading||!!result}>
        {loading?"Uploading…":result?"Done":"Upload & Clean with Claude"}
      </button>
    </div>
  );
}

// ─── Maps Pull Tab ─────────────────────────────────────────────────────────────
function MapsPullTab() {
  const { user }              = useAuth();
  const [queries, setQueries]     = useState([]);
  const [cities, setCities]       = useState([]);
  const [countries, setCountries] = useState([]);
  const [results, setResults]     = useState([]);
  const [searched, setSearched]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [filters, setFilters]     = useState({});
  const [showAddDB, setShowAddDB] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/filters`).then(r=>r.json()).then(setFilters).catch(()=>{});
  }, []);

  const allTypes     = filters?.company_types || [];
  const allCountries = filters?.countries || [];
  const allCities    = filters?.cities ? Object.values(filters.cities).flat() : [];

  const handlePull = async () => {
    if (!queries.length&&!cities.length&&!countries.length) { setError("Please select at least one filter."); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/companies/multi`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ queries, cities, countries }),
      });
      const data = await res.json();
      setResults(data.companies||[]); setSearched(true);
    } catch { setError("Failed to load data."); }
    setLoading(false);
  };

  const handleExport = () => {
    if (!results.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
      const rows    = results.map(r=>[r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let row=1; row<=range.e.r; row++) {
        const ref = XLSX.utils.encode_cell({r:row,c:2});
        if (ws[ref]) { ws[ref].t="s"; ws[ref].z="@"; }
      }
      ws["!cols"] = [{wch:30},{wch:30},{wch:18},{wch:35},{wch:18},{wch:18},{wch:22}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ReachCT Maps Export");
      const _fn4 = `reachct_maps_${new Date().toISOString().slice(0,10)}.xlsx`;
      const _buf4 = XLSX.write(wb, { bookType:"xlsx", type:"array" });
      const _blob4 = new Blob([_buf4], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const _url4 = URL.createObjectURL(_blob4);
      const _a4 = document.createElement("a"); _a4.href = _url4; _a4.download = _fn4;
      document.body.appendChild(_a4); _a4.click(); document.body.removeChild(_a4);
      URL.revokeObjectURL(_url4);
    });
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Company Name","Email","Phone","Website","City","Country","Company Type"];
    const rows    = results.map(r=>[r.name||"",r.email||"",r.phone||"",r.website||"",r.city||"",r.country||"",r.company_type||""]);
    navigator.clipboard.writeText([headers,...rows].map(r=>r.join("\t")).join("\n"))
      .then(()=>alert("Copied! Paste into Google Sheets or Excel."));
  };

  return (
    <>
      <div className="form-card">
        <div className="form-title">Pull from Maps Database</div>
        <div className="form-grid">
          <div>
            <label className="field-label">Company Type</label>
            <TagInput placeholder="e.g. Marketing Agency" options={allTypes} value={queries} onChange={setQueries}/>
          </div>
          <div>
            <label className="field-label">Country</label>
            <TagInput placeholder="e.g. Germany" options={allCountries} value={countries} onChange={setCountries}/>
          </div>
          <div>
            <label className="field-label">City</label>
            <TagInput placeholder="e.g. Berlin" options={allCities} value={cities} onChange={setCities}/>
          </div>
        </div>
        <p style={{fontSize:12,color:"#999",marginBottom:16}}>Multiple values are OR-matched. Leave empty to pull all.</p>
        <div className="btn-row">
          <button className="btn-primary" onClick={handlePull} disabled={loading}>
            <DatabaseIcon/>{loading?"Loading…":"Pull Data"}
          </button>
        </div>
        {error&&<div className="error-msg">{error}</div>}
        {loading&&<div className="loading-area"><div className="spinner"/>
          <p className="loading-msg">Fetching from database…</p></div>}
      </div>

      {searched&&(
        <div className="results-area">
          <div className="results-header">
            <div className="results-count">
              <span>{results.length}</span> companies found &nbsp;·&nbsp;
              <span style={{color:"#E8005A"}}>{results.filter(r=>r.email).length}</span> emails found
            </div>
            <div className="btn-row">
              {user&&<button className="btn-primary" onClick={()=>setShowAddDB(true)}>+ Add to Database</button>}
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>
          <ResultsTable data={results}/>
        </div>
      )}

      {showAddDB&&(
        <AddToDBModal
          rows={results.map(r=>({name:r.name||"",email:r.email||"",phone:r.phone||"",
            website:r.website||"",city:r.city||"",country:r.country||"",company_type:r.company_type||""}))}
          onClose={()=>setShowAddDB(false)}
        />
      )}
    </>
  );
}

// ─── LinkedIn Pull Tab ────────────────────────────────────────────────────────
function LinkedInPullTab() {
  const { user, token }           = useAuth();
  const [jobTitles, setJobTitles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [results, setResults]     = useState([]);
  const [searched, setSearched]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [liFilters, setLiFilters] = useState({});
  const [showAddDB, setShowAddDB] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/linkedin/filters`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(setLiFilters).catch(()=>{});
  }, [token]);

  const handlePull = async () => {
    if (!jobTitles.length&&!companies.length&&!locations.length) {
      setError("Please select at least one filter."); return;
    }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/linkedin/pull`, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ job_titles:jobTitles, companies, locations }),
      });
      const data = await res.json();
      setResults(data.results||[]); setSearched(true);
    } catch { setError("Failed to load LinkedIn data."); }
    setLoading(false);
  };

  const handleExport = () => {
    if (!results.length) return;
    import("xlsx").then(({ default: XLSX }) => {
      const headers = ["Full Name","Role","Profile Title","Company","Email","LinkedIn URL","Location"];
      const rows    = results.map(r=>[
        r.full_name||"", r.job_title||"", r.profile_title||"",
        r.company||"", r.email||"", r.linkedin_url||"", r.location||""
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = [{wch:24},{wch:16},{wch:32},{wch:24},{wch:32},{wch:50},{wch:20}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "LinkedIn Export");
      const _fn5 = `reachct_linkedin_${new Date().toISOString().slice(0,10)}.xlsx`;
      const _buf5 = XLSX.write(wb, { bookType:"xlsx", type:"array" });
      const _blob5 = new Blob([_buf5], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const _url5 = URL.createObjectURL(_blob5);
      const _a5 = document.createElement("a"); _a5.href = _url5; _a5.download = _fn5;
      document.body.appendChild(_a5); _a5.click(); document.body.removeChild(_a5);
      URL.revokeObjectURL(_url5);
    });
  };

  const handleCopy = () => {
    if (!results.length) return;
    const headers = ["Full Name","Role","Profile Title","Company","Email","LinkedIn URL","Location"];
    const rows    = results.map(r=>[r.full_name||"",r.job_title||"",r.profile_title||"",r.company||"",r.email||"",r.linkedin_url||"",r.location||""]);
    navigator.clipboard.writeText([headers,...rows].map(r=>r.join("\t")).join("\n"))
      .then(()=>alert("Copied! Paste into Google Sheets or Excel."));
  };

  const confColor = (c) => c==="verified"?"#16a34a":c==="catch-all"?"#ca8a04":c==="unverified"?"#dc2626":"#999";

  return (
    <>
      <div className="form-card">
        <div className="form-title">Pull from LinkedIn Contacts</div>
        <p style={{fontSize:13,color:"#888",marginTop:-8,marginBottom:20}}>
          Pull people from the shared LinkedIn contacts database — includes all manually saved emails.
        </p>
        <div className="form-grid">
          <div>
            <label className="field-label">Job Title</label>
            <TagInput placeholder="e.g. HR Manager" options={liFilters?.job_titles||[]} value={jobTitles} onChange={setJobTitles}/>
          </div>
          <div>
            <label className="field-label">Company</label>
            <TagInput placeholder="e.g. Kreaset" options={liFilters?.companies||[]} value={companies} onChange={setCompanies}/>
          </div>
          <div>
            <label className="field-label">Location</label>
            <TagInput placeholder="e.g. Madrid" options={liFilters?.locations||[]} value={locations} onChange={setLocations}/>
          </div>
        </div>
        <p style={{fontSize:12,color:"#999",marginBottom:16}}>Multiple values are OR-matched. Leave empty to pull all contacts.</p>
        <div className="btn-row">
          <button className="btn-primary" onClick={handlePull} disabled={loading}>
            <DatabaseIcon/>{loading?"Loading…":"Pull Contacts"}
          </button>
        </div>
        {error&&<div className="error-msg">{error}</div>}
        {loading&&<div className="loading-area"><div className="spinner"/>
          <p className="loading-msg">Fetching from LinkedIn database…</p></div>}
      </div>

      {searched&&(
        <div className="results-area">
          <div className="results-header">
            <div className="results-count">
              <span>{results.length}</span> contacts found &nbsp;·&nbsp;
              <span style={{color:"#E8005A"}}>{results.filter(r=>r.email).length}</span> with email
            </div>
            <div className="btn-row">
              {user&&<button className="btn-primary" onClick={()=>setShowAddDB(true)}>+ Add to Database</button>}
              <button className="btn-secondary" onClick={handleExport}><DownloadIcon/>Export Excel</button>
              <button className="btn-secondary" onClick={handleCopy}><CopyIcon/>Copy Table</button>
            </div>
          </div>

          <div style={{overflowX:"auto"}}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Profile Title</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>LinkedIn</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r,i)=>(
                  <tr key={i}>
                    <td style={{fontWeight:500}}>{r.full_name||"—"}</td>
                    <td><span style={{ background:"rgba(232,0,90,0.08)", border:"1px solid rgba(232,0,90,0.15)",
                      borderRadius:6, padding:"2px 8px", fontSize:11, color:"#E8005A", fontWeight:600,
                      whiteSpace:"nowrap" }}>{r.job_title||"—"}</span></td>
                    <td style={{color:"#666",fontSize:12}}>{r.profile_title||"—"}</td>
                    <td>{r.company||"—"}</td>
                    <td style={{color: r.email?"#E8005A":"#ccc"}}>{r.email||"—"}</td>
                    <td>
                      {r.linkedin_url
                        ? <a href={r.linkedin_url} target="_blank" rel="noreferrer"
                            style={{color:"#0a66c2",fontSize:12}}>Profile →</a>
                        : "—"}
                    </td>
                    <td style={{fontSize:12,color:"#888"}}>{r.location||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddDB&&(
        <AddToDBModal
          dbKind="linkedin"
          rows={results.map(r=>({full_name:r.full_name||"",job_title:r.job_title||"",
            profile_title:r.profile_title||"",company:r.company||"",
            email:r.email||"",linkedin_url:r.linkedin_url||"",location:r.location||""}))}          onClose={()=>setShowAddDB(false)}
        />
      )}
    </>
  );
}

// ─── Database Page ─────────────────────────────────────────────────────────────
export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState("maps");

  const tabStyle = (active) => ({
    padding:"10px 24px", border:"none", cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:active?600:400,
    color:active?"#E8005A":"#999", background:"none",
    borderBottom: active?"2px solid #E8005A":"2px solid transparent",
    transition:"all 0.15s", marginBottom:-1,
  });

  return (
    <div className="inner-page">
      <InnerHeader title="Push / Pull Database" />

      <div style={{ background:"#fff", borderBottom:"1px solid #eee", padding:"0 48px",
        display:"flex", gap:4 }}>
        <button style={tabStyle(activeTab==="maps")} onClick={()=>setActiveTab("maps")}>
          🗺️ Pull Maps Data
        </button>
        <button style={tabStyle(activeTab==="linkedin")} onClick={()=>setActiveTab("linkedin")}>
          🔗 Pull LinkedIn Contacts
        </button>
        <button style={tabStyle(activeTab==="push")} onClick={()=>setActiveTab("push")}>
          ⬆️ Push Spreadsheet
        </button>
      </div>

      <div className="form-area" style={{ marginTop:32 }}>
        {activeTab==="maps"     && <MapsPullTab/>}
        {activeTab==="linkedin" && <LinkedInPullTab/>}
        {activeTab==="push"     && <PushTab/>}
      </div>
    </div>
  );
}