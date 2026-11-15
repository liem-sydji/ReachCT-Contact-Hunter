import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import {
  FolderIcon,
  MapsKindIcon,
  LinkedInKindIcon,
  InternshipKindIcon,
} from "../components/icons.jsx";
import DashboardLeftPanel from "../components/DashboardLeftPanel.jsx";
import { PageTransition } from "../components/ui/index.js";

function kindMeta(kind) {
  if (kind === "linkedin") return { label: "LinkedIn", Icon: LinkedInKindIcon, cls: "linkedin" };
  if (kind === "internships") return { label: "Internships", Icon: InternshipKindIcon, cls: "internships" };
  return { label: "Maps", Icon: MapsKindIcon, cls: "maps" };
}

function CreateDBModal({ onClose, onCreate }) {
  const [name, setName]       = useState("");
  const [kind, setKind]       = useState("maps");
  const [loading, setLoading] = useState(false);
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true); await onCreate(name.trim(), kind); setLoading(false);
  };
  const kindCard = (value, icon, label, desc) => (
    <div onClick={()=>setKind(value)} style={{
      flex:1, border: kind===value ? "2px solid var(--coral)" : "1.5px solid rgba(246,235,217,0.18)",
      borderRadius:12, padding:"14px 12px", cursor:"pointer",
      background: kind===value ? "rgba(238,104,94,0.08)" : "#111", transition:"all 0.15s" }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:700, color: kind===value ? "var(--coral)" : "#fff" }}>{label}</div>
      <div style={{ fontSize:11, color:"#888", marginTop:2, lineHeight:1.4 }}>{desc}</div>
    </div>
  );
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"var(--ink-soft)", border:"1px solid rgba(246,235,217,0.14)", borderRadius:16,
        padding:32, width:420 }} onClick={e=>e.stopPropagation()}>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800,
          color:"var(--cream)", marginBottom:8, letterSpacing:"-0.4px" }}>New Database</h2>
        <p style={{ fontSize:13, color:"#666", marginBottom:16 }}>Choose a type and give it a name.</p>

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {kindCard("maps", "🗺️", "Maps", "Companies — name, email, phone, website")}
          {kindCard("linkedin", "🔗", "LinkedIn", "People — name, title, company, email")}
          {kindCard("internships", "🎓", "Internships", "Listings — internship, company, email")}
        </div>

        <input autoFocus
          placeholder={kind==="linkedin"?"e.g. HR Managers Spain":kind==="internships"?"e.g. Marketing Internships CT":"e.g. IT Companies Germany"}
          value={name}
          onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()}
          style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid rgba(246,235,217,0.18)",
            background:"var(--ink)", color:"var(--cream)", fontSize:14, fontFamily:"var(--font-body)",
            outline:"none", marginBottom:24, boxSizing:"border-box" }}
          onFocus={e=>e.target.style.borderColor="var(--coral)"} onBlur={e=>e.target.style.borderColor="rgba(246,235,217,0.14)"} />
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(246,235,217,0.14)", borderRadius:8,
            padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer", fontFamily:"var(--font-body)" }}>
            Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()||loading} style={{ background:"var(--coral)",
            border:"none", borderRadius:8, padding:"9px 20px", color:"var(--cream)", fontSize:13, fontWeight:600,
            cursor:name.trim()?"pointer":"not-allowed", fontFamily:"var(--font-body)",
            opacity:name.trim()?1:0.5 }}>{loading?"Creating…":"Create"}</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token }           = useAuth();
  const navigate                  = useNavigate();
  const [databases, setDatabases] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchDatabases();
  }, [token]);

  const handleNav = (p) => {
    if (p === "/") navigate("/");
    else if (p === "databases") navigate("/dashboard");
    else if (p === "campaigns") navigate("/campaigns");
    else if (p === "templates") navigate("/templates");
  };

  const fetchDatabases = async () => {
    try {
      const res  = await fetch(`${API}/api/databases`, { headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json();
      setDatabases(Array.isArray(data)?data:[]);
    } catch { setDatabases([]); }
    setLoading(false);
  };

  const handleCreate = async (name, kind="maps") => {
    try {
      const res = await fetch(`${API}/api/databases`, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({name, kind}),
      });
      const db = await res.json();
      setDatabases(prev=>[db,...prev]); setShowCreate(false);
    } catch { alert("Failed to create database"); }
  };

  const handleDelete = async (dbId) => {
    if (!confirm("Delete this database? This cannot be undone.")) return;
    try {
      await fetch(`${API}/api/databases/${dbId}`, { method:"DELETE", headers:{Authorization:`Bearer ${token}`} });
      setDatabases(prev=>prev.filter(d=>d.id!==dbId));
    } catch { alert("Failed to delete database"); }
  };

  const filtered = databases.filter(db => db.name.toLowerCase().includes(search.toLowerCase()));

  return (

    <PageTransition>
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-night)" }}>
      <DashboardLeftPanel user={user} activePage="databases" onNav={handleNav} />

      <main style={{ flex:1, padding:"36px 40px", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:800,
              color:"var(--cream)", letterSpacing:"-0.5px", margin:0 }}>My Databases</h1>
            <p style={{ color:"#444", fontSize:13, marginTop:4 }}>
              {databases.length} database{databases.length!==1?"s":""}
            </p>
          </div>
          {/* Search bar */}
          <div style={{ position:"relative" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search databases…"
              style={{ padding:"9px 16px 9px 36px", border:"1px solid rgba(246,235,217,0.14)", borderRadius:10,
                background:"var(--ink-soft)", color:"var(--cream)", fontSize:13, outline:"none",
                fontFamily:"var(--font-body)", width:220, transition:"border-color 0.15s" }}
              onFocus={e=>e.target.style.borderColor="var(--coral)"} onBlur={e=>e.target.style.borderColor="rgba(246,235,217,0.14)"} />
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
              color:"#555", fontSize:14 }}>🔍</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid rgba(246,235,217,0.2)",
              borderTopColor:"var(--coral)", animation:"spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div className="dash-db-grid">
            <button type="button" className="dash-db-card dash-db-card--create" onClick={() => setShowCreate(true)}>
              <div className="dash-db-card__plus" aria-hidden="true">
                <FolderIcon size={26} />
              </div>
              <span className="dash-db-card__create-label">Create Database</span>
            </button>

            {filtered.map(db => {
              const kind = kindMeta(db.kind);
              const KindIcon = kind.Icon;
              return (
                <div
                  key={db.id}
                  className="dash-db-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/dashboard/db/${db.id}`)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/dashboard/db/${db.id}`); } }}
                >
                  <div>
                    <div className="dash-db-card__meta">
                      <span className="dash-db-card__role">{db.role === "owner" ? "Owner" : db.role}</span>
                      <span className={`dash-db-card__kind dash-db-card__kind--${kind.cls}`}>
                        <KindIcon size={16} />
                        {kind.label}
                      </span>
                    </div>
                    <h3 className="dash-db-card__title">{db.name}</h3>
                  </div>
                  <div className="dash-db-card__footer">
                    <span className="dash-db-card__date">{new Date(db.created_at).toLocaleDateString()}</span>
                    {db.role === "owner" && (
                      <button
                        type="button"
                        className="dash-db-card__delete"
                        onClick={e => { e.stopPropagation(); handleDelete(db.id); }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && search && (
              <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#888", fontSize:14,
                padding:"40px 0", fontStyle:"italic" }}>
                No databases matching "{search}"</div>
            )}
          </div>
        )}
      </main>

      {showCreate && <CreateDBModal onClose={()=>setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  

    </PageTransition>

  );
}