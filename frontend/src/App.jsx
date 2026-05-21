import { useState, useEffect, useRef } from "react";

const PINK        = "#E8005A";
const PINK_LIGHT  = "#FF3D7F";
const PINK_PALE   = "#FFF0F5";
const PINK_BORDER = "#FFB3CC";
const API         = "https://reachct-production.up.railway.app";

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
    <circle cx="10" cy="22" r="9" fill="white"/>
    <circle cx="26" cy="22" r="9" fill="white" opacity="0.7"/>
    <circle cx="18" cy="10" r="9" fill="white" opacity="0.5"/>
  </svg>
);

const StatusBadge = ({ status }) => {
  const map = {
    "✅ Verified":         { bg: "#ECFDF5", color: "#059669", label: "Verified" },
    "⚠️ Needs Checking":   { bg: "#FFFBEB", color: "#D97706", label: "Needs Checking" },
    "📵 No Website":       { bg: "#F0F9FF", color: "#0369A1", label: "No Website" },
  };
  const s = map[status] || { bg: "#F9FAFB", color: "#6B7280", label: status || "—" };
  return (
    <span style={{ background:s.bg, color:s.color, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, fontFamily:"'DM Sans', sans-serif", letterSpacing:"0.03em", whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
};

const Spinner = ({ message, queued }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"48px 0" }}>
    <div style={{
      width:44, height:44, borderRadius:"50%",
      border:`4px solid ${queued ? "#FFD700" : PINK_BORDER}`,
      borderTopColor: queued ? "#FFD700" : PINK,
      animation: queued ? "none" : "spin 0.8s linear infinite",
    }}/>
    <p style={{ color: queued ? "#D97706" : PINK, fontFamily:"'DM Sans', sans-serif", fontWeight:600, fontSize:14 }}>
      {message || "Searching..."}
    </p>
    <p style={{ color:"#bbb", fontSize:12 }}>
      {queued ? "You will be notified when your search starts" : "This may take a few minutes"}
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Better number input that handles deletion properly
const NumberInput = ({ label, value, set, min = 0 }) => {
  const [raw, setRaw] = useState(String(value));

  useEffect(() => { setRaw(String(value)); }, [value]);

  return (
    <div>
      <label style={{ fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5 }}>
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={raw}
        onChange={e => {
          const v = e.target.value;
          setRaw(v);
          const n = parseInt(v, 10);
          if (!isNaN(n) && n >= min) set(n);
        }}
        onBlur={() => {
          const n = parseInt(raw, 10);
          if (isNaN(n) || n < min) { setRaw(String(min)); set(min); }
          else { setRaw(String(n)); set(n); }
        }}
        style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${PINK_BORDER}`, fontSize:13, color:"#1a1a1a", outline:"none", fontFamily:"'DM Sans', sans-serif", transition:"border-color 0.2s" }}
        onFocus={e => e.target.style.borderColor = PINK}
      />
    </div>
  );
};

const Field = ({ label, value, set, placeholder }) => (
  <div>
    <label style={{ fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5 }}>
      {label}
    </label>
    <input
      type="text" value={value}
      onChange={e => set(e.target.value)}
      placeholder={placeholder}
      style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${PINK_BORDER}`, fontSize:13, color:"#1a1a1a", outline:"none", fontFamily:"'DM Sans', sans-serif", transition:"border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor = PINK}
      onBlur={e  => e.target.style.borderColor = PINK_BORDER}
    />
  </div>
);

const ResultsTable = ({ results, filter }) => {
  const filtered = results.filter(r =>
    !filter ||
    r.name?.toLowerCase().includes(filter.toLowerCase()) ||
    r.email?.toLowerCase().includes(filter.toLowerCase()) ||
    r.city?.toLowerCase().includes(filter.toLowerCase()) ||
    r.company_type?.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) return (
    <div style={{ textAlign:"center", padding:"48px 0", color:"#aaa" }}>
      <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
      <p style={{ fontSize:15, fontWeight:600 }}>No results found</p>
      <p style={{ fontSize:13 }}>Try adjusting your search or filter</p>
    </div>
  );

  return (
    <div style={{ background:"white", borderRadius:14, border:`1.5px solid ${PINK_BORDER}`, boxShadow:"0 4px 20px rgba(232,0,90,0.07)", overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
        <thead>
          <tr style={{ background:PINK }}>
            {["Company","Email","Phone","Website","Location","Company Type","Status"].map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"white", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'Syne', sans-serif", whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i}
              style={{ borderTop:`1px solid ${PINK_PALE}`, background:i%2===0?"white":PINK_PALE, transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FFE8F1"}
              onMouseLeave={e => e.currentTarget.style.background = i%2===0?"white":PINK_PALE}
            >
              <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600, color:"#1a1a1a", maxWidth:180, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name||"—"}</td>
              <td style={{ padding:"10px 14px", fontSize:13 }}>
                {r.email ? <a href={`mailto:${r.email}`} style={{ color:PINK, textDecoration:"none", fontWeight:500 }}>{r.email}</a> : <span style={{ color:"#ccc" }}>—</span>}
              </td>
              <td style={{ padding:"10px 14px", fontSize:13, color:"#444", whiteSpace:"nowrap" }}>{r.phone||<span style={{ color:"#ccc" }}>—</span>}</td>
              <td style={{ padding:"10px 14px", fontSize:13, maxWidth:160, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {r.website
                  ? <a href={r.website} target="_blank" rel="noreferrer" style={{ color:PINK, textDecoration:"none", fontWeight:500 }}>
                      {r.website.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 25)}{r.website.length > 30 ? "…" : ""}
                    </a>
                  : <span style={{ color:"#ccc" }}>—</span>}
              </td>
              <td style={{ padding:"10px 14px", fontSize:13, color:"#666", whiteSpace:"nowrap" }}>{r.city && r.country ? `${r.city}, ${r.country}` : "—"}</td>
              <td style={{ padding:"10px 14px", fontSize:13, color:"#666", whiteSpace:"nowrap" }}>{r.company_type||"—"}</td>
              <td style={{ padding:"10px 14px" }}><StatusBadge status={r.category}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function App() {
  const [tab,      setTab]      = useState("scrape"); // "scrape" | "database"
  const [query,    setQuery]    = useState("");
  const [city,     setCity]     = useState("");
  const [country,  setCountry]  = useState("");
  const [start,    setStart]    = useState(0);
  const [end,      setEnd]      = useState(25);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [loadMsg,  setLoadMsg]  = useState("");
  const [error,    setError]    = useState("");
  const [searched, setSearched] = useState(false);
  const [filter,   setFilter]   = useState("");

  // DB tab state
  const [dbCity,    setDbCity]    = useState("");
  const [dbCountry, setDbCountry] = useState("");
  const [dbQuery,   setDbQuery]   = useState("");
  const [dbResults, setDbResults] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError,   setDbError]   = useState("");
  const [dbFilter,  setDbFilter]  = useState("");

  const pollRef = useRef(null);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleSearch = async () => {
    if (!query || !city || !country) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true); setSearched(false); setResults([]);
    setLoadMsg("Starting search...");
    try {
      const res  = await fetch(`${API}/api/scrape?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&start=${start}&end=${end}`);
      const data = await res.json();
      if (res.status === 429) throw new Error("⏳ A search is already running — please wait for it to finish.");
      if (!res.ok) throw new Error(data.detail || "Failed to start search");
      const jobId = data.job_id;
      const initialMsg = data.queue_position > 0
        ? `⏳ Queued at position ${data.queue_position} — waiting for current search to finish...`
        : "Scraping Google Maps...";
      setLoadMsg(initialMsg);
      pollRef.current = setInterval(async () => {
        try {
          const jobRes  = await fetch(`${API}/api/job/${jobId}`);
          const jobData = await jobRes.json();
          if (jobData.status === "done") {
            clearInterval(pollRef.current);
            setResults(jobData.results || []);
            setSearched(true);
            setLoading(false);
          } else if (jobData.status === "error") {
            clearInterval(pollRef.current);
            setError(jobData.error || "Something went wrong");
            setLoading(false);
          } else if (jobData.status === "queued") {
            const pos = jobData.queue_position;
            setLoadMsg(`⏳ Queued at position ${pos} — waiting for current search to finish...`);
          } else {
            const found = jobData.results?.length || 0;
            setLoadMsg(`Scraping... ${found} companies found so far`);
          }
        } catch {
          clearInterval(pollRef.current);
          setError("Lost connection to backend");
          setLoading(false);
        }
      }, 4000);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleExport = async (q, c, co) => {
    const url = `${API}/api/export?query=${encodeURIComponent(q)}&city=${encodeURIComponent(c)}&country=${encodeURIComponent(co)}`;
    const res  = await fetch(url);
    if (!res.ok) { setError("No data to export"); return; }
    const blob = await res.blob();
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `reachct_${c}_${co}.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleDbPull = async () => {
    if (!dbCity && !dbCountry && !dbQuery) { setDbError("Please enter at least one search field."); return; }
    setDbError(""); setDbLoading(true); setDbResults([]);
    try {
      const params = new URLSearchParams({ city: dbCity, country: dbCountry, ...(dbQuery && { query: dbQuery }) });
      const res    = await fetch(`${API}/api/companies?${params}`);
      const data   = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");
      setDbResults(data.companies || []);
    } catch (e) {
      setDbError(e.message);
    } finally {
      setDbLoading(false);
    }
  };

  const withEmail = results.filter(r => r.email).length;
  const withPhone = results.filter(r => r.phone).length;
  const dbWithEmail = dbResults.filter(r => r.email).length;

  const tabStyle = (t) => ({
    padding: "10px 24px",
    borderRadius: "8px 8px 0 0",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    background: tab === t ? "white" : "rgba(255,255,255,0.2)",
    color: tab === t ? PINK : "white",
    transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight:"100vh", background:"#FFF8FB", fontFamily:"'DM Sans', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* Navbar */}
      <nav style={{ background:PINK, padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(232,0,90,0.18)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo/>
          <span style={{ color:"white", fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.5px" }}>ReachCT</span>
        </div>
        <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12, fontWeight:500 }}>B2B Contact Intelligence</span>
      </nav>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${PINK} 0%, ${PINK_LIGHT} 100%)`, padding:"32px 32px 0", position:"relative", overflow:"hidden" }}>
        {[{s:200,t:-70,r:-50,o:0.08},{s:120,t:15,r:110,o:0.06},{s:80,t:-15,r:190,o:0.1}].map((c,i) => (
          <div key={i} style={{ position:"absolute", top:c.t, right:c.r, width:c.s, height:c.s, borderRadius:"50%", background:"white", opacity:c.o, pointerEvents:"none" }}/>
        ))}

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <h1 style={{ color:"white", fontFamily:"'Syne', sans-serif", fontSize:26, fontWeight:800, margin:"0 0 4px", letterSpacing:"-0.5px" }}>
            Find Company Contacts
          </h1>
          <p style={{ color:"rgba(255,255,255,0.82)", fontSize:13, margin:"0 0 20px" }}>
            Search Google Maps or pull from your existing database.
          </p>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:0 }}>
            <button style={tabStyle("scrape")} onClick={() => setTab("scrape")}>🔍 Scrape Google Maps</button>
            <button style={tabStyle("database")} onClick={() => setTab("database")}>🗄️ Pull from Database</button>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div style={{ background:"white", borderBottom:`1.5px solid ${PINK_BORDER}`, boxShadow:"0 4px 16px rgba(232,0,90,0.08)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 32px" }}>

          {/* Scrape tab */}
          {tab === "scrape" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto", gap:12, alignItems:"flex-end" }}>
                <Field label="Business Type" value={query}   set={setQuery}   placeholder="e.g. agencia de marketing"/>
                <Field label="City"          value={city}    set={setCity}    placeholder="e.g. Madrid"/>
                <Field label="Country"       value={country} set={setCountry} placeholder="e.g. España"/>
                <NumberInput label="Start Index" value={start} set={setStart} min={0}/>
                <NumberInput label="End Index (max +50)" value={end} set={(v) => setEnd(Math.min(v, start + 50))} min={1}/>
                <button
                  onClick={handleSearch} disabled={loading}
                  style={{ background:loading?PINK_BORDER:PINK, color:"white", border:"none", padding:"10px 28px", borderRadius:8, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'Syne', sans-serif", whiteSpace:"nowrap", height:40 }}
                  onMouseEnter={e => { if (!loading) e.target.style.background = PINK_LIGHT; }}
                  onMouseLeave={e => { if (!loading) e.target.style.background = PINK; }}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
              {error && <p style={{ color:"#DC2626", fontSize:12, marginTop:10, fontWeight:500 }}>{error}</p>}
            </div>
          )}

          {/* Database tab */}
          {tab === "database" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto auto", gap:12, alignItems:"flex-end" }}>
                <Field label="Company Type (optional)" value={dbQuery}   set={setDbQuery}   placeholder="e.g. agencia de marketing"/>
                <Field label="City (optional)"          value={dbCity}    set={setDbCity}    placeholder="e.g. Madrid"/>
                <Field label="Country (optional)"       value={dbCountry} set={setDbCountry} placeholder="e.g. España"/>
                <button
                  onClick={handleDbPull} disabled={dbLoading}
                  style={{ background:dbLoading?PINK_BORDER:PINK, color:"white", border:"none", padding:"10px 24px", borderRadius:8, fontSize:13, fontWeight:700, cursor:dbLoading?"not-allowed":"pointer", fontFamily:"'Syne', sans-serif", whiteSpace:"nowrap", height:40 }}
                  onMouseEnter={e => { if (!dbLoading) e.target.style.background = PINK_LIGHT; }}
                  onMouseLeave={e => { if (!dbLoading) e.target.style.background = PINK; }}
                >
                  {dbLoading ? "Loading..." : "Pull Data"}
                </button>
                {dbResults.length > 0 && (
                  <button
                    onClick={() => handleExport(dbQuery, dbCity, dbCountry)}
                    style={{ background:"white", color:PINK, border:`2px solid ${PINK}`, padding:"9px 18px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Syne', sans-serif", whiteSpace:"nowrap", height:40 }}
                    onMouseEnter={e => { e.target.style.background = PINK; e.target.style.color = "white"; }}
                    onMouseLeave={e => { e.target.style.background = "white"; e.target.style.color = PINK; }}
                  >
                    ↓ Export Excel
                  </button>
                )}
              </div>
              {dbError && <p style={{ color:"#DC2626", fontSize:12, marginTop:10, fontWeight:500 }}>{dbError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 32px" }}>

        {/* Scrape results */}
        {tab === "scrape" && (
          <>
            {loading && <Spinner message={loadMsg} queued={loadMsg.includes('Queued')}/>}
            {searched && !loading && (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", gap:12 }}>
                    {[{label:"Total",value:results.length,color:PINK},{label:"Emails",value:withEmail,color:"#059669"},{label:"Phones",value:withPhone,color:"#0369A1"}].map(({label,value,color}) => (
                      <div key={label} style={{ background:"white", border:`1.5px solid ${PINK_BORDER}`, borderRadius:10, padding:"7px 16px", textAlign:"center", boxShadow:"0 2px 8px rgba(232,0,90,0.06)" }}>
                        <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"'Syne', sans-serif" }}>{value}</div>
                        <div style={{ fontSize:10, color:"#999", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input
                      placeholder="Filter results..." value={filter}
                      onChange={e => setFilter(e.target.value)}
                      style={{ padding:"7px 12px", borderRadius:7, border:`1.5px solid ${PINK_BORDER}`, fontSize:12, outline:"none", width:160, fontFamily:"'DM Sans', sans-serif" }}
                      onFocus={e => e.target.style.borderColor = PINK}
                      onBlur={e  => e.target.style.borderColor = PINK_BORDER}
                    />
                    <button
                      onClick={() => handleExport(query, city, country)}
                      style={{ background:"white", color:PINK, border:`2px solid ${PINK}`, padding:"7px 16px", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Syne', sans-serif" }}
                      onMouseEnter={e => { e.target.style.background = PINK; e.target.style.color = "white"; }}
                      onMouseLeave={e => { e.target.style.background = "white"; e.target.style.color = PINK; }}
                    >
                      ↓ Export Excel
                    </button>
                  </div>
                </div>
                <ResultsTable results={results} filter={filter}/>
              </>
            )}
            {!searched && !loading && (
              <div style={{ textAlign:"center", padding:"64px 0" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                <p style={{ fontSize:15, fontWeight:600, color:"#bbb" }}>Enter a search above to find companies</p>
                <p style={{ fontSize:12, color:"#ccc" }}>Results will appear here</p>
              </div>
            )}
          </>
        )}

        {/* Database results */}
        {tab === "database" && (
          <>
            {dbLoading && <Spinner message="Fetching from database..."/>}
            {!dbLoading && dbResults.length > 0 && (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", gap:12 }}>
                    {[{label:"Total",value:dbResults.length,color:PINK},{label:"Emails",value:dbWithEmail,color:"#059669"}].map(({label,value,color}) => (
                      <div key={label} style={{ background:"white", border:`1.5px solid ${PINK_BORDER}`, borderRadius:10, padding:"7px 16px", textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"'Syne', sans-serif" }}>{value}</div>
                        <div style={{ fontSize:10, color:"#999", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <input
                    placeholder="Filter results..." value={dbFilter}
                    onChange={e => setDbFilter(e.target.value)}
                    style={{ padding:"7px 12px", borderRadius:7, border:`1.5px solid ${PINK_BORDER}`, fontSize:12, outline:"none", width:160, fontFamily:"'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = PINK}
                    onBlur={e  => e.target.style.borderColor = PINK_BORDER}
                  />
                </div>
                <ResultsTable results={dbResults} filter={dbFilter}/>
              </>
            )}
            {!dbLoading && dbResults.length === 0 && (
              <div style={{ textAlign:"center", padding:"64px 0" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🗄️</div>
                <p style={{ fontSize:15, fontWeight:600, color:"#bbb" }}>Pull from your database</p>
                <p style={{ fontSize:12, color:"#ccc" }}>Enter a city and country to retrieve saved companies</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
