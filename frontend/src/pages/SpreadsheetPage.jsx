import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API, COMPANY_TYPES_GROUPED } from "../styles.js";
import { ReachCTLogo, SearchIcon, DownloadIcon, CopyIcon } from "../components/icons.jsx";

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel({ user, onNav }) {
  return (
    <aside style={{ width:200, minHeight:"100vh", background:"#111", borderRight:"1px solid #1e1e1e",
      display:"flex", flexDirection:"column", padding:"20px 0", flexShrink:0 }}>
      <div style={{ padding:"0 16px 20px", borderBottom:"1px solid #1e1e1e", cursor:"pointer" }}
        onClick={() => onNav("/")}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <ReachCTLogo size={20} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:"#fff" }}>
            Reach<span style={{ color:"#E8005A" }}>CT</span>
          </span>
        </div>
      </div>
      <div style={{ padding:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          {user?.picture
            ? <img src={user.picture} alt="" referrerPolicy="no-referrer"
                style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:"2px solid #333" }} />
            : <div style={{ width:32, height:32, borderRadius:"50%", background:"#E8005A",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, color:"#fff", fontFamily:"'Syne',sans-serif" }}>
                {(user?.name||"?")[0].toUpperCase()}
              </div>
          }
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#fff", overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{user?.name||"User"}</div>
            <div style={{ fontSize:10, color:"#555", overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={() => onNav("/dashboard")} style={{ display:"flex", alignItems:"center", gap:8,
          background:"rgba(232,0,90,0.12)", border:"1px solid rgba(232,0,90,0.2)", borderRadius:8,
          padding:"8px 12px", cursor:"pointer", color:"#E8005A", fontSize:12, fontWeight:600,
          fontFamily:"'DM Sans',sans-serif", width:"100%", textAlign:"left" }}>
          🗄️ Databases
        </button>
      </div>
    </aside>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ placeholder, options, value, onChange }) {
  const [inputVal, setInputVal] = useState("");
  const [open, setOpen]         = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(inputVal.toLowerCase()) && !value.includes(o)).slice(0,200);
  const add    = (item) => { onChange([...value, item]); setInputVal(""); setOpen(false); };
  const remove = (item) => onChange(value.filter(v => v !== item));
  return (
    <div style={{ position:"relative" }}>
      <div style={{ minHeight:40, padding:"6px 10px", border:"1.5px solid #e8e8e8", borderRadius:10,
        background:"#fff", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", cursor:"text" }}
        onClick={() => setOpen(true)}>
        {value.map(v => (
          <span key={v} style={{ background:"rgba(232,0,90,0.08)", border:"1px solid rgba(232,0,90,0.2)",
            borderRadius:6, padding:"2px 8px", fontSize:12, color:"#E8005A",
            display:"flex", alignItems:"center", gap:4 }}>
            {v}
            <button onClick={e => { e.stopPropagation(); remove(v); }} style={{
              background:"none", border:"none", cursor:"pointer", color:"#E8005A", fontSize:14, padding:0, lineHeight:1 }}>×</button>
          </span>
        ))}
        <input value={inputVal} onChange={e => { setInputVal(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{ border:"none", outline:"none", fontSize:13, flex:1, minWidth:80,
            fontFamily:"'DM Sans',sans-serif", background:"transparent" }} />
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:100, background:"#fff",
          border:"1px solid #eee", borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
          maxHeight:260, overflowY:"auto", marginTop:4 }}>
          {filtered.map(o => (
            <div key={o} onMouseDown={() => add(o)} style={{ padding:"9px 14px", fontSize:13,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#111", background:"#fff" }}
              onMouseEnter={e => e.target.style.background="#f9f9f9"}
              onMouseLeave={e => e.target.style.background="#fff"}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal primitives ─────────────────────────────────────────────────────────
const labelStyle = { display:"block", fontSize:11, fontWeight:600, color:"#999",
  letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
const inputStyle = { width:"100%", padding:"10px 14px", border:"1.5px solid #e8e8e8",
  borderRadius:10, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#111",
  background:"#fff", outline:"none", boxSizing:"border-box" };

function ModalWrap({ onClose, title, subtitle, children, width=480 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:width,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#111",
          margin:"0 0 4px", letterSpacing:"-0.4px" }}>{title}</h2>
        {subtitle && <p style={{ fontSize:13, color:"#999", marginBottom:24 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, loading, label, disabled }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:24 }}>
      <button onClick={onClose} style={{ background:"none", border:"1px solid #e8e8e8", borderRadius:8,
        padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
        Cancel</button>
      <button onClick={onConfirm} disabled={disabled||loading} style={{ background:"#E8005A", border:"none",
        borderRadius:8, padding:"9px 20px", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
        fontFamily:"'DM Sans',sans-serif", opacity:(disabled||loading)?0.5:1 }}>
        {loading?"Loading…":label}</button>
    </div>
  );
}

// ─── Pull Modal ───────────────────────────────────────────────────────────────
function PullModal({ onClose, onPull, filters, kind, liFilters }) {
  const [queries, setQueries]     = useState([]);
  const [cities, setCities]       = useState([]);
  const [countries, setCountries] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(false);

  const allTypes     = filters?.company_types || [];
  const allCountries = filters?.countries || [];
  const allCities    = filters?.cities ? Object.values(filters.cities).flat() : [];

  const handlePull = async () => {
    setLoading(true);
    if (kind === "linkedin") {
      await onPull({ job_titles:jobTitles, companies, locations });
    } else {
      await onPull({ queries, cities, countries });
    }
    setLoading(false); onClose();
  };

  if (kind === "linkedin") {
    return (
      <ModalWrap onClose={onClose} title="Pull from LinkedIn Contacts" subtitle="Import people from the shared LinkedIn contacts database.">
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div><label style={labelStyle}>Job Title</label>
            <TagInput placeholder="e.g. HR Manager" options={liFilters?.job_titles||[]} value={jobTitles} onChange={setJobTitles} /></div>
          <div><label style={labelStyle}>Company</label>
            <TagInput placeholder="e.g. Kreaset" options={liFilters?.companies||[]} value={companies} onChange={setCompanies} /></div>
          <div><label style={labelStyle}>Location</label>
            <TagInput placeholder="e.g. Madrid" options={liFilters?.locations||[]} value={locations} onChange={setLocations} /></div>
          <p style={{ fontSize:12, color:"#999" }}>Multiple values are OR-matched. Leave empty to pull all contacts.</p>
        </div>
        <ModalFooter onClose={onClose} onConfirm={handlePull} loading={loading} label="Pull Contacts" />
      </ModalWrap>
    );
  }

  return (
    <ModalWrap onClose={onClose} title="Pull from Database" subtitle="Import contacts from the shared ReachCT database.">
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div><label style={labelStyle}>Company Type</label>
          <TagInput placeholder="e.g. Marketing Agency" options={allTypes} value={queries} onChange={setQueries} /></div>
        <div><label style={labelStyle}>Country</label>
          <TagInput placeholder="e.g. Germany" options={allCountries} value={countries} onChange={setCountries} /></div>
        <div><label style={labelStyle}>City</label>
          <TagInput placeholder="e.g. Berlin" options={allCities} value={cities} onChange={setCities} /></div>
        <p style={{ fontSize:12, color:"#999" }}>Multiple values are OR-matched. Leave empty to pull all.</p>
      </div>
      <ModalFooter onClose={onClose} onConfirm={handlePull} loading={loading} label="Pull Data" />
    </ModalWrap>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUpload }) {
  const [file, setFile]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try { const res = await onUpload(file); setResult(res); }
    catch (e) { setError(e.message || "Upload failed"); }
    setLoading(false);
  };
  return (
    <ModalWrap onClose={onClose} title="Push Spreadsheet" subtitle="Upload an Excel or CSV file to import contacts.">
      <div style={{ background:"#f8f9ff", border:"1px solid #e8eeff", borderRadius:12,
        padding:"16px 20px", marginBottom:20, fontSize:13, color:"#444", lineHeight:1.6 }}>
        <strong>📋 Tips for best results:</strong>
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>Include column headers like: <em>Company Name, Email, Phone, Website, City, Country</em></li>
          <li>One company per row</li>
          <li>Missing columns are fine — Claude will do its best</li>
          <li>Files with no headers are supported but may be less accurate</li>
          <li>Supported formats: <strong>.xlsx, .xls, .csv</strong></li>
        </ul>
      </div>
      <div style={{ border:"2px dashed #e8e8e8", borderRadius:12, padding:32, textAlign:"center",
        cursor:"pointer", marginBottom:16, transition:"all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="#E8005A"; e.currentTarget.style.background="rgba(232,0,90,0.02)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="#e8e8e8"; e.currentTarget.style.background="none"; }}
        onClick={() => document.getElementById("upload-file-input").click()}>
        <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
        <div style={{ fontSize:14, fontWeight:600, color:"#111", marginBottom:4 }}>
          {file ? file.name : "Click to select file"}</div>
        <div style={{ fontSize:12, color:"#999" }}>.xlsx, .xls, .csv supported</div>
        <input id="upload-file-input" type="file" accept=".xlsx,.xls,.csv"
          style={{ display:"none" }} onChange={e => setFile(e.target.files[0])} />
      </div>
      {loading && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", color:"#666", fontSize:13 }}>
          <div style={{ width:20, height:20, borderRadius:"50%", border:"2px solid #eee",
            borderTopColor:"#E8005A", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
          Claude is analyzing and cleaning your data…
        </div>
      )}
      {result && (
        <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10,
          padding:"12px 16px", fontSize:13, color:"#166534", marginBottom:8 }}>
          ✅ Imported {result.inserted} companies — cleaned by Claude
        </div>
      )}
      {error && <div style={{ background:"#FFF1F2", border:"1px solid #FECDD3", borderRadius:10,
        padding:"12px 16px", fontSize:13, color:"#9F1239", marginBottom:8 }}>{error}</div>}
      <ModalFooter onClose={onClose} onConfirm={handleUpload}
        loading={loading} label={result?"Done":"Import"} disabled={!file||!!result} />
    </ModalWrap>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────
function SearchModal({ onClose, onSearch, token }) {
  const [query, setQuery]     = useState("");
  const [city, setCity]       = useState("");
  const [country, setCountry] = useState("");
  const [start, setStart]     = useState(0);
  const [end, setEnd]         = useState(25);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const pollRef = useRef(null);
  const handleSearch = async () => {
    if (!query||!city||!country) return;
    setLoading(true); setLoadMsg("Starting search…");
    try {
      const res  = await fetch(`${API}/api/scrape?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&start=${start}&end=${end}`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.queue_position > 0) {
        setLoadMsg(`Queued at position ${data.queue_position}…`);
      } else {
        setLoadMsg("Your search is in progress…");
      }
      pollRef.current = setInterval(async () => {
        const jr = await fetch(`${API}/api/job/${data.job_id}`);
        const jd = await jr.json();
        if (jd.status==="done"||jd.status==="cancelled") {
          clearInterval(pollRef.current); setLoading(false);
          await onSearch(jd.results||[]); onClose();
        } else if (jd.status==="error") {
          clearInterval(pollRef.current); setLoading(false); setLoadMsg("Search failed.");
        } else if (jd.queue_position > 0) {
          setLoadMsg(`Queued at position ${jd.queue_position}…`);
        } else {
          setLoadMsg("Your search is in progress…");
        }
      }, 4000);
    } catch { setLoading(false); setLoadMsg("Failed to start search."); }
  };
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
  return (
    <ModalWrap onClose={onClose} title="New Search" subtitle="Search Google Maps and save to this database.">
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><label style={labelStyle}>Business Type</label>
          <select value={query} onChange={e => setQuery(e.target.value)}
            style={{ ...inputStyle, appearance:"none", cursor:"pointer" }}>
            <option value="">Select company type…</option>
            {Object.entries(COMPANY_TYPES_GROUPED).map(([letter, types]) => (
              <optgroup key={letter} label={`── ${letter} ──`}>
                {types.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={labelStyle}>City</label>
            <input style={inputStyle} value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Berlin"/></div>
          <div><label style={labelStyle}>Country</label>
            <input style={inputStyle} value={country} onChange={e=>setCountry(e.target.value)} placeholder="e.g. Germany"/></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={labelStyle}>Start</label>
            <input style={inputStyle} type="number" min="0" value={start}
              onChange={e=>{ const v=e.target.value; setStart(v===""?"":Number(v)); }}
              onBlur={e=>{ if(e.target.value==="") setStart(0); }}/></div>
          <div><label style={labelStyle}>End (max +50)</label>
            <input style={inputStyle} type="number" min="1" value={end}
              onChange={e=>{ const v=e.target.value; setEnd(v===""?"":Math.min(Number(v),(start||0)+50)); }}
              onBlur={e=>{ if(e.target.value==="") setEnd(25); }}/></div>
        </div>
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:12, color:"#666", fontSize:13 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", border:"2px solid #eee",
              borderTopColor:"#E8005A", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
            {loadMsg}
          </div>
        )}
      </div>
      <ModalFooter onClose={onClose} onConfirm={handleSearch} loading={loading}
        label={loading?"Searching…":"Search"} disabled={!query||!city||!country||loading} />
    </ModalWrap>
  );
}

// ─── Collaborator Modal ───────────────────────────────────────────────────────
function CollaboratorModal({ onClose, dbId, token }) {
  const [email, setEmail]     = useState("");
  const [role, setRole]       = useState("viewer");
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  useEffect(() => { fetchCollabs(); }, []);
  const fetchCollabs = async () => {
    try {
      const res  = await fetch(`${API}/api/databases/${dbId}/collaborators`, { headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json();
      setCollabs(Array.isArray(data)?data:[]);
    } catch {}
  };
  const handleAdd = async () => {
    if (!email.trim()) return; setLoading(true);
    try {
      const res = await fetch(`${API}/api/databases/${dbId}/collaborators`, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({email:email.trim(),role}),
      });
      if (!res.ok) { const err=await res.json(); setMsg(err.detail||"Failed"); }
      else { setEmail(""); setMsg(""); fetchCollabs(); }
    } catch { setMsg("Failed to add collaborator"); }
    setLoading(false);
  };
  const handleRemove = async (userId) => {
    try {
      await fetch(`${API}/api/databases/${dbId}/collaborators/${userId}`, { method:"DELETE", headers:{Authorization:`Bearer ${token}`} });
      setCollabs(prev => prev.filter(c => c.user_id !== userId));
    } catch {}
  };
  return (
    <ModalWrap onClose={onClose} title="Share Database" subtitle="Add collaborators by their ReachCT email.">
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input style={{ ...inputStyle, flex:1 }} value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="colleague@email.com" onKeyDown={e=>e.key==="Enter"&&handleAdd()} />
          <select value={role} onChange={e=>setRole(e.target.value)} style={{ padding:"10px 12px",
            border:"1.5px solid #e8e8e8", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif",
            color:"#111", background:"#fff", outline:"none", cursor:"pointer" }}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button onClick={handleAdd} disabled={loading||!email.trim()} style={{ background:"#E8005A",
            border:"none", borderRadius:10, padding:"10px 16px", color:"#fff", fontSize:13,
            fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            opacity:email.trim()?1:0.5 }}>Add</button>
        </div>
        {msg && <div style={{ fontSize:12, color:"#E8005A" }}>{msg}</div>}
        {collabs.length > 0 && (
          <div style={{ borderTop:"1px solid #eee", paddingTop:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#999", letterSpacing:"0.06em",
              textTransform:"uppercase", marginBottom:10 }}>Current collaborators</div>
            {collabs.map(c => (
              <div key={c.user_id} style={{ display:"flex", alignItems:"center",
                justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f5f5f5" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {c.picture ? <img src={c.picture} alt="" referrerPolicy="no-referrer"
                    style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover" }} />
                  : <div style={{ width:28, height:28, borderRadius:"50%", background:"#E8005A",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, color:"#fff", fontWeight:700 }}>{(c.name||c.email||"?")[0].toUpperCase()}</div>}
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:"#111" }}>{c.name||c.email}</div>
                    <div style={{ fontSize:11, color:"#999" }}>{c.role}</div>
                  </div>
                </div>
                <button onClick={()=>handleRemove(c.user_id)} style={{ background:"none", border:"none",
                  color:"#ccc", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e=>e.target.style.color="#E8005A"} onMouseLeave={e=>e.target.style.color="#ccc"}>
                  Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:24 }}>
        <button onClick={onClose} style={{ background:"none", border:"1px solid #e8e8e8", borderRadius:8,
          padding:"9px 20px", color:"#111", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          Done</button>
      </div>
    </ModalWrap>
  );
}

// ─── Three Dots Menu ──────────────────────────────────────────────────────────
function ThreeDotsMenu({ onPull, onUpload, onSearch, onShare, onExport, onCopy, kind }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const options = [
    { label:"Pull from Database", icon: kind === "linkedin" ? "🔗" : "🗄️", onClick:onPull },
    ...(kind !== "linkedin" ? [{ label:"Start Search", icon:"🔍", onClick:onSearch }] : []),
    { label:"Share Database",     icon:"👥", onClick:onShare },
    { label:"Export to Excel",    icon:"⬇️", onClick:onExport },
    { label:"Copy Table",         icon:"📋", onClick:onCopy },
  ];
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={()=>setOpen(!open)} style={{ background:"none", border:"1px solid #e8e8e8",
        borderRadius:8, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", fontSize:18, color:"#666", transition:"all 0.15s" }}
        onMouseEnter={e=>{ e.currentTarget.style.background="#f5f5f5"; e.currentTarget.style.borderColor="#ccc"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="#e8e8e8"; }}>
        ⋯
      </button>
      {open && (
        <div style={{ position:"absolute", top:"100%", right:0, zIndex:200, background:"#fff",
          border:"1px solid #eee", borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,0.12)",
          minWidth:200, marginTop:6, overflow:"hidden" }}>
          {options.map(opt => (
            <button key={opt.label} onClick={()=>{ opt.onClick(); setOpen(false); }} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 16px",
              background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#333",
              fontFamily:"'DM Sans',sans-serif", transition:"background 0.1s", textAlign:"left" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9f9f9"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span>{opt.icon}</span>{opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Spreadsheet Grid ─────────────────────────────────────────────────────────
const EMPTY_ROWS = 50;
const COL_WIDTH  = 180;

function SpreadsheetGrid({ entries, columns, setColumns, onCellChange, onDeleteRow, onDeleteCol, onAddCol, onRenameCol, isViewer, isCellSelected, onCellMouseDown, onCellMouseEnter }) {
  const [editCell, setEditCell]   = useState(null);
  const [editVal,  setEditVal]    = useState("");
  const [editColHeader, setEditColHeader] = useState(null);
  const [newColName, setNewColName]       = useState("");
  const [showAddCol, setShowAddCol]       = useState(false);
  const [addColName, setAddColName]       = useState("");
  const [dragCol, setDragCol]             = useState(null);
  const [dragOverCol, setDragOverCol]     = useState(null);

  const emptyCount = EMPTY_ROWS;

  const handleCellClick = (entryId, col, currentVal) => {
    if (isViewer) return;
    setEditCell({ entryId, col });
    setEditVal(currentVal || "");
  };

  const handleCellBlur = () => {
    if (editCell) {
      onCellChange(editCell.entryId, editCell.col, editVal);
      setEditCell(null);
    }
  };

  const handleDragStart = (col) => setDragCol(col);
  const handleDragOver  = (e, col) => { e.preventDefault(); setDragOverCol(col); };
  const handleDrop      = (col) => {
    if (!dragCol || dragCol === col) { setDragCol(null); setDragOverCol(null); return; }
    const newCols = [...columns];
    const fromIdx = newCols.indexOf(dragCol);
    const toIdx   = newCols.indexOf(col);
    newCols.splice(fromIdx, 1);
    newCols.splice(toIdx, 0, dragCol);
    setColumns(newCols);
    setDragCol(null); setDragOverCol(null);
  };

  const startRenameCol = (col) => { setEditColHeader(col); setNewColName(col); };
  const confirmRenameCol = () => {
    if (newColName.trim() && newColName.trim() !== editColHeader) {
      onRenameCol(editColHeader, newColName.trim());
    }
    setEditColHeader(null);
  };

  return (
    <div style={{ flex:1, overflow:"auto" }}>
      <table style={{ borderCollapse:"collapse", fontSize:13, fontFamily:"'DM Sans',sans-serif",
        minWidth:"100%", tableLayout:"fixed" }}>
        <colgroup>
          <col style={{ width:44 }} />
          {columns.map(col => <col key={col} style={{ width:COL_WIDTH }} />)}
          {!isViewer && <col style={{ width:120 }} />}
        </colgroup>
        <thead>
          <tr>
            <th style={{ background:"#f8f8f8", borderRight:"1px solid #e8e8e8",
              borderBottom:"2px solid #e0e0e0", position:"sticky", top:0, left:0, zIndex:10 }} />
            {columns.map(col => (
              <th key={col}
                draggable={!isViewer}
                onDragStart={() => handleDragStart(col)}
                onDragOver={(e) => handleDragOver(e, col)}
                onDrop={() => handleDrop(col)}
                style={{ padding:"10px 12px", background: dragOverCol===col ? "rgba(232,0,90,0.08)" : "#f8f8f8",
                  borderRight:"1px solid #e8e8e8", borderBottom:"2px solid #e0e0e0",
                  textAlign:"left", fontWeight:600, color:"#333", fontSize:12,
                  letterSpacing:"0.02em", position:"sticky", top:0, zIndex:9,
                  cursor: isViewer ? "default" : "grab", userSelect:"none",
                  transition:"background 0.15s" }}>
                {editColHeader === col ? (
                  <input autoFocus value={newColName} onChange={e=>setNewColName(e.target.value)}
                    onBlur={confirmRenameCol}
                    onKeyDown={e=>{ if(e.key==="Enter") confirmRenameCol(); if(e.key==="Escape") setEditColHeader(null); }}
                    style={{ border:"none", outline:"none", fontSize:12, fontWeight:600,
                      background:"transparent", width:"100%", fontFamily:"'DM Sans',sans-serif" }} />
                ) : (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}
                      onDoubleClick={() => !isViewer && startRenameCol(col)}>
                      {col}
                    </span>
                    {!isViewer && (
                      <button onClick={()=>onDeleteCol(col)} style={{ background:"none", border:"none",
                        color:"#ccc", cursor:"pointer", fontSize:14, padding:0, lineHeight:1,
                        flexShrink:0, opacity:0 }} className="col-del-btn">×</button>
                    )}
                  </div>
                )}
              </th>
            ))}
            {!isViewer && (
              <th style={{ background:"#f8f8f8", borderBottom:"2px solid #e0e0e0",
                position:"sticky", top:0, zIndex:9, padding:"8px 12px" }}>
                {showAddCol ? (
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    <input autoFocus value={addColName} onChange={e=>setAddColName(e.target.value)}
                      onKeyDown={e=>{ if(e.key==="Enter"){ onAddCol(addColName.trim()); setAddColName(""); setShowAddCol(false); }
                        if(e.key==="Escape") setShowAddCol(false); }}
                      placeholder="Column name"
                      style={{ width:100, padding:"4px 8px", border:"1.5px solid #E8005A",
                        borderRadius:6, fontSize:12, outline:"none" }} />
                    <button onClick={()=>{ onAddCol(addColName.trim()); setAddColName(""); setShowAddCol(false); }}
                      style={{ background:"#E8005A", border:"none", borderRadius:6, padding:"4px 8px",
                        color:"#fff", fontSize:11, cursor:"pointer" }}>Add</button>
                  </div>
                ) : (
                  <button onClick={()=>setShowAddCol(true)} style={{ background:"none",
                    border:"1.5px dashed #e8e8e8", borderRadius:6, padding:"4px 10px",
                    color:"#999", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    whiteSpace:"nowrap" }}>+ Column</button>
                )}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, rowIdx) => (
            <tr key={entry.id} style={{ borderBottom:"1px solid #f0f0f0" }}
              onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <td style={{ background:"#f8f8f8", borderRight:"1px solid #e8e8e8", color:"#bbb",
                fontSize:11, textAlign:"center", padding:"0 4px", position:"sticky", left:0,
                height:36, verticalAlign:"middle", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 4px" }}>
                  <span>{rowIdx+1}</span>
                  {!isViewer && (
                    <button onClick={e=>{e.stopPropagation();onDeleteRow(entry.id);}} style={{ background:"none", border:"none",
                      color:"#ddd", cursor:"pointer", fontSize:14, padding:0, lineHeight:1, opacity:0 }}
                      className="row-del-btn"
                      onMouseEnter={e=>e.target.style.color="#E8005A"} onMouseLeave={e=>e.target.style.color="#ddd"}>
                      ×</button>
                  )}
                </div>
              </td>
              {columns.map(col => {
                const isEditing = editCell?.entryId === entry.id && editCell?.col === col;
                const val       = entry.data?.[col] || "";
                return (
                  <td key={col} style={{ padding:0, borderRight:"1px solid #f0f0f0",
                    background: isEditing ? "#fff9fb" : isCellSelected && isCellSelected(rowIdx, columns.indexOf(col)) ? "rgba(232,0,90,0.08)" : "transparent",
                    outline: isEditing ? "2px solid #E8005A" : isCellSelected && isCellSelected(rowIdx, columns.indexOf(col)) ? "1px solid rgba(232,0,90,0.3)" : "none",
                    cursor: isViewer ? "default" : "text", height:36, verticalAlign:"middle",
                    userSelect:"none" }}
                    onMouseDown={(e)=>{ onCellMouseDown && onCellMouseDown(entry.id, col, e); }}
                    onMouseEnter={()=>{ onCellMouseEnter && onCellMouseEnter(entry.id, col); }}
                    onClick={()=>handleCellClick(entry.id, col, val)}>
                    {isEditing ? (
                      <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={e=>{ if(e.key==="Enter") handleCellBlur(); if(e.key==="Escape") setEditCell(null); }}
                        style={{ width:"100%", height:36, padding:"0 12px", border:"none", outline:"none",
                          fontSize:13, fontFamily:"'DM Sans',sans-serif", background:"transparent" }} />
                    ) : (
                      <div style={{ padding:"0 12px", height:36, display:"flex", alignItems:"center",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        color: col==="email" ? "#E8005A" : "#333", fontWeight: col==="email" ? 500 : 400 }}>
                        {val}
                      </div>
                    )}
                  </td>
                );
              })}
              {!isViewer && <td />}
            </tr>
          ))}
          {Array.from({ length: emptyCount }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ borderBottom:"1px solid #f0f0f0", height:36 }}
              onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <td style={{ background:"#f8f8f8", borderRight:"1px solid #e8e8e8", color:"#ddd",
                fontSize:11, textAlign:"center", padding:"0 8px", position:"sticky", left:0 }}>
                {entries.length + i + 1}
              </td>
              {columns.map(col => (
                <td key={col} style={{ borderRight:"1px solid #f0f0f0", height:36 }} />
              ))}
              {!isViewer && <td />}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        tbody tr:hover .row-del-btn { opacity: 1 !important; }
        thead th:hover .col-del-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

// ─── Spreadsheet Page ─────────────────────────────────────────────────────────
export default function SpreadsheetPage() {
  const { dbId }            = useParams();
  const { user, token }     = useAuth();
  const navigate            = useNavigate();
  const [db, setDb]         = useState(null);
  const [entries, setEntries] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [liFilters, setLiFilters] = useState({});
  const [modal, setModal]     = useState(null);

  const isViewer = db?.role === "viewer";

  const [selection, setSelection]     = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [copiedCells, setCopiedCells] = useState(null);
  const selectionRef = useRef(null);

  const getCellCoords = (entryId, col) => {
    const rowIdx = entries.findIndex(e => e.id === entryId);
    const colIdx = columns.indexOf(col);
    return { rowIdx, colIdx };
  };

  const isCellSelected = (rowIdx, colIdx) => {
    if (!selection) return false;
    const minR = Math.min(selection.startRow, selection.endRow);
    const maxR = Math.max(selection.startRow, selection.endRow);
    const minC = Math.min(selection.startCol, selection.endCol);
    const maxC = Math.max(selection.startCol, selection.endCol);
    return rowIdx >= minR && rowIdx <= maxR && colIdx >= minC && colIdx <= maxC;
  };

  const handleCellMouseDown = (entryId, col, e) => {
    if (e.button !== 0) return;
    const { rowIdx, colIdx } = getCellCoords(entryId, col);
    setSelection({ startRow:rowIdx, startCol:colIdx, endRow:rowIdx, endCol:colIdx });
    setIsSelecting(true);
    selectionRef.current = { startRow:rowIdx, startCol:colIdx };
  };

  const handleCellMouseEnter = (entryId, col) => {
    if (!isSelecting) return;
    const { rowIdx, colIdx } = getCellCoords(entryId, col);
    setSelection(prev => prev ? { ...prev, endRow:rowIdx, endCol:colIdx } : null);
  };

  const handleMouseUp = () => setIsSelecting(false);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selection) {
        const minR = Math.min(selection.startRow, selection.endRow);
        const maxR = Math.max(selection.startRow, selection.endRow);
        const minC = Math.min(selection.startCol, selection.endCol);
        const maxC = Math.max(selection.startCol, selection.endCol);
        const selectedCols = columns.slice(minC, maxC+1);
        const data = entries.slice(minR, maxR+1).map(entry =>
          selectedCols.map(col => entry.data?.[col] || "")
        );
        setCopiedCells({ data, cols: selectedCols, startCol: minC });
        const tsv = data.map(r => r.join("\t")).join("\n");
        await navigator.clipboard.writeText(tsv).catch(()=>{});
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && selection && !isViewer) {
        try {
          const text = await navigator.clipboard.readText();
          const lines = text.trim().split("\n").filter(l => l.trim());
          if (!lines.length) return;
          const pasteRows = lines.map(l => l.split("\t"));
          const startRow  = Math.min(selection.startRow, selection.endRow);
          const startCol  = Math.min(selection.startCol, selection.endCol);
          const updates = [];
          for (let ri = 0; ri < pasteRows.length; ri++) {
            const entryIdx = startRow + ri;
            if (entryIdx >= entries.length) break;
            const entry   = entries[entryIdx];
            const newData = { ...(entry.data || {}) };
            for (let ci = 0; ci < pasteRows[ri].length; ci++) {
              const colIdx = startCol + ci;
              if (colIdx < columns.length) {
                newData[columns[colIdx]] = pasteRows[ri][ci];
              }
            }
            updates.push({ id: entry.id, data: newData });
          }
          await Promise.all(updates.map(u =>
            fetch(`${API}/api/databases/${dbId}/entries/${u.id}`, {
              method:"PATCH",
              headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
              body:JSON.stringify({data: u.data}),
            })
          ));
          fetchAll();
        } catch {}
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selection, entries, columns, dbId, token, isViewer]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
    fetch(`${API}/api/filters`).then(r=>r.json()).then(setFilters).catch(()=>{});
    fetch(`${API}/api/linkedin/filters`, { headers:{Authorization:`Bearer ${token}`} }).then(r=>r.json()).then(setLiFilters).catch(()=>{});
  }, [dbId, token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dbRes, entriesRes] = await Promise.all([
        fetch(`${API}/api/databases`, { headers:{Authorization:`Bearer ${token}`} }),
        fetch(`${API}/api/databases/${dbId}/entries`, { headers:{Authorization:`Bearer ${token}`} }),
      ]);
      const dbs  = await dbRes.json();
      const rows = await entriesRes.json();
      setDb((Array.isArray(dbs)?dbs:[]).find(d=>String(d.id)===String(dbId))||null);
      const safeRows = Array.isArray(rows)?rows:[];
      const realRows = safeRows.filter(r => {
        const data = r.data || {};
        return Object.values(data).some(v => v && String(v).trim() !== "");
      });
      setEntries(realRows);
      const derived = deriveColumns(realRows);
      const theDb = (Array.isArray(dbs)?dbs:[]).find(d=>String(d.id)===String(dbId));
      if (derived.length === 0) {
        if (theDb?.kind === "linkedin") {
          setColumns(["full_name","job_title","company","email","linkedin_url","location"]);
        } else {
          setColumns(["name","email","phone","website","city","country","company_type"]);
        }
      } else {
        setColumns(derived);
      }
    } catch {}
    setLoading(false);
  };

  const deriveColumns = (rows) => {
    const seen = new Set();
    const cols = [];
    rows.forEach(r => Object.keys(r.data||{}).forEach(k => { if(!seen.has(k)){ seen.add(k); cols.push(k); } }));
    return cols;
  };

  const handleCellChange = useCallback(async (entryId, col, val) => {
    const entry   = entries.find(e => e.id === entryId);
    if (!entry) return;
    const newData = { ...(entry.data||{}), [col]: val };
    try {
      const res = await fetch(`${API}/api/databases/${dbId}/entries/${entryId}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({data:newData}),
      });
      const updated = await res.json();
      setEntries(prev => prev.map(e => e.id===entryId ? updated : e));
    } catch {}
  }, [entries, dbId, token]);

  const handleDeleteRow = useCallback(async (entryId) => {
    await fetch(`${API}/api/databases/${dbId}/entries/${entryId}`, {
      method:"DELETE", headers:{Authorization:`Bearer ${token}`},
    });
    const newEntries = entries.filter(e => e.id !== entryId);
    setEntries(newEntries);
    setColumns(deriveColumns(newEntries));
  }, [entries, dbId, token]);

  const handleDeleteCol = useCallback(async (col) => {
    if (!confirm(`Delete column "${col}"?`)) return;
    const updated = await Promise.all(entries.map(async entry => {
      const newData = { ...(entry.data||{}) };
      delete newData[col];
      const res = await fetch(`${API}/api/databases/${dbId}/entries/${entry.id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({data:newData}),
      });
      return res.json();
    }));
    setEntries(updated);
    setColumns(prev => prev.filter(c => c !== col));
  }, [entries, dbId, token]);

  const handleAddCol = useCallback((colName) => {
    if (!colName || columns.includes(colName)) return;
    setColumns(prev => [...prev, colName]);
  }, [columns]);

  const handleRenameCol = useCallback(async (oldName, newName) => {
    try {
      await fetch(`${API}/api/databases/${dbId}/rename-column`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({old_name:oldName, new_name:newName}),
      });
      setEntries(prev => prev.map(entry => {
        const data = { ...(entry.data||{}) };
        if (oldName in data) { data[newName] = data[oldName]; delete data[oldName]; }
        return { ...entry, data };
      }));
      setColumns(prev => prev.map(c => c===oldName ? newName : c));
    } catch {}
  }, [dbId, token]);

  const handlePull = async (params) => {
    if (db?.kind === "linkedin") {
      const res  = await fetch(`${API}/api/linkedin/pull`, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify(params),
      });
      const data = await res.json();
      const rows = (data.results||[]).map(r => ({
        full_name:r.full_name||"", job_title:r.job_title||"", company:r.company||"",
        email:r.email||"", linkedin_url:r.linkedin_url||"", location:r.location||"",
      }));
      if (rows.length) {
        await fetch(`${API}/api/databases/add-rows`, {
          method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
          body:JSON.stringify({ db_id: Number(dbId), rows }),
        });
      }
      fetchAll();
      return;
    }
    const res  = await fetch(`${API}/api/databases/${dbId}/pull`, {
      method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
      body:JSON.stringify(params),
    });
    const data = await res.json();
    if (data.columns) setColumns(prev => [...new Set([...prev, ...data.columns])]);
    fetchAll();
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch(`${API}/api/databases/${dbId}/upload`, {
      method:"POST", headers:{Authorization:`Bearer ${token}`}, body:formData,
    });
    if (!res.ok) { const err=await res.json(); throw new Error(err.detail||"Upload failed"); }
    const data = await res.json();
    if (data.columns) setColumns(prev => [...new Set([...prev, ...data.columns])]);
    fetchAll();
    return data;
  };

  const handleSearch = async (results) => {
    if (!results.length) return;
    const rows = results.map(r => ({ name:r.name||"", email:r.email||"", phone:r.phone||"",
      website:r.website||"", city:r.city||"", country:r.country||"", company_type:r.company_type||"" }));
    await fetch(`${API}/api/databases/${dbId}/entries`, {
      method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
      body:JSON.stringify({rows}),
    });
    setColumns(prev => [...new Set([...prev, "name","email","phone","website","city","country","company_type"])]);
    fetchAll();
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/api/databases/${dbId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert("Export failed"); return; }
      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = `${db?.name || "database"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert("Export failed"); }
  };

  const handleCopy = () => {
    if (!entries.length) return;
    const headers = columns;
    const rows    = entries.map(e => columns.map(c => e.data?.[c]||""));
    const tsv     = [headers, ...rows].map(r => r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(() => alert("Copied! Paste into Google Sheets or Excel."));
  };

  if (loading) return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0a0a",
      alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #333",
        borderTopColor:"#E8005A", animation:"spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:"#f8f8f8", overflow:"hidden" }}>
      <LeftPanel user={user} onNav={navigate} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"#fff", borderBottom:"1px solid #eee", padding:"0 20px",
          height:52, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <button onClick={()=>navigate("/dashboard")} style={{ background:"none", border:"none",
            color:"#999", cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif",
            display:"flex", alignItems:"center", gap:4, padding:"5px 8px", borderRadius:6 }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#333"; e.currentTarget.style.background="#f5f5f5"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#999"; e.currentTarget.style.background="none"; }}>
            ← Databases
          </button>
          <div style={{ width:1, height:18, background:"#eee" }} />
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
            color:"#111", margin:0, flex:1 }}>{db?.name||"Database"}</h1>
          <span style={{ fontSize:12, color:"#bbb" }}>{entries.length} rows</span>
          {selection && (
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans',sans-serif" }}>
              Ctrl+C to copy · Ctrl+V to paste
            </span>
          )}
          {!isViewer && (
            <ThreeDotsMenu
              onPull={()=>setModal("pull")}
              onSearch={()=>setModal("search")}
              onShare={()=>setModal("share")}
              onExport={handleExport}
              onCopy={handleCopy}
              kind={db?.kind}
            />
          )}
        </div>

        <SpreadsheetGrid
          entries={entries} columns={columns} setColumns={setColumns}
          onCellChange={handleCellChange} onDeleteRow={handleDeleteRow}
          onDeleteCol={handleDeleteCol} onAddCol={handleAddCol}
          onRenameCol={handleRenameCol} isViewer={isViewer}
          isCellSelected={isCellSelected}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
        />
      </div>

      {modal==="pull"   && <PullModal   onClose={()=>setModal(null)} onPull={handlePull} filters={filters} kind={db?.kind} liFilters={liFilters} />}
      {modal==="upload" && <UploadModal onClose={()=>setModal(null)} onUpload={handleUpload} />}
      {modal==="search" && <SearchModal onClose={()=>setModal(null)} onSearch={handleSearch} token={token} />}
      {modal==="share"  && <CollaboratorModal onClose={()=>setModal(null)} dbId={dbId} token={token} />}
    </div>
  );
}