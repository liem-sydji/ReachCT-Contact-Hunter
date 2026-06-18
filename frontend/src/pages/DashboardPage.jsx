import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { ReachCTLogo } from "../components/icons.jsx";

function LeftPanel({ user, onNav }) {
  return (
    <aside style={{ width:200, minHeight:"100vh", background:"#111", borderRight:"1px solid #1e1e1e",
      display:"flex", flexDirection:"column", padding:"20px 0", flexShrink:0 }}>
      <div style={{ padding:"0 16px 20px", borderBottom:"1px solid #1e1e1e", cursor:"pointer" }}
        onClick={()=>onNav("/")}>
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
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <button onClick={()=>onNav("databases")} style={{ display:"flex", alignItems:"center", gap:8,
            background:"rgba(232,0,90,0.12)", border:"1px solid rgba(232,0,90,0.2)", borderRadius:8,
            padding:"8px 12px", cursor:"pointer", color:"#E8005A", fontSize:12, fontWeight:600,
            fontFamily:"'DM Sans',sans-serif", width:"100%", textAlign:"left" }}>
            🗄️ Databases
          </button>
          <button onClick={()=>onNav("campaigns")} style={{ display:"flex", alignItems:"center", gap:8,
            background:"none", border:"1px solid transparent", borderRadius:8,
            padding:"8px 12px", cursor:"pointer", color:"#888", fontSize:12, fontWeight:400,
            fontFamily:"'DM Sans',sans-serif", width:"100%", textAlign:"left", transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#888"; e.currentTarget.style.background="none"; }}>
            📧 Mail Campaigns
          </button>
          <button onClick={()=>onNav("templates")} style={{ display:"flex", alignItems:"center", gap:8,
            background:"none", border:"1px solid transparent", borderRadius:8,
            padding:"8px 12px", cursor:"pointer", color:"#888", fontSize:12, fontWeight:400,
            fontFamily:"'DM Sans',sans-serif", width:"100%", textAlign:"left", transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#888"; e.currentTarget.style.background="none"; }}>
            📝 Email Templates
          </button>
        </div>
      </div>
    </aside>
  );
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
      flex:1, border: kind===value ? "2px solid #E8005A" : "1.5px solid #333",
      borderRadius:12, padding:"14px 12px", cursor:"pointer",
      background: kind===value ? "rgba(232,0,90,0.08)" : "#111", transition:"all 0.15s" }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:700, color: kind===value ? "#E8005A" : "#fff" }}>{label}</div>
      <div style={{ fontSize:11, color:"#888", marginTop:2, lineHeight:1.4 }}>{desc}</div>
    </div>
  );
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:16,
        padding:32, width:420 }} onClick={e=>e.stopPropagation()}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
          color:"#fff", marginBottom:8, letterSpacing:"-0.4px" }}>New Database</h2>
        <p style={{ fontSize:13, color:"#666", marginBottom:16 }}>Choose a type and give it a name.</p>

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {kindCard("maps", "🗺️", "Maps", "Companies — name, email, phone, website")}
          {kindCard("linkedin", "🔗", "LinkedIn", "People — name, title, company, email")}
        </div>

        <input autoFocus placeholder={kind==="linkedin"?"e.g. HR Managers Spain":"e.g. IT Companies Germany"} value={name}
          onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()}
          style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #333",
            background:"#111", color:"#fff", fontSize:14, fontFamily:"'DM Sans',sans-serif",
            outline:"none", marginBottom:24, boxSizing:"border-box" }}
          onFocus={e=>e.target.style.borderColor="#E8005A"} onBlur={e=>e.target.style.borderColor="#333"} />
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #333", borderRadius:8,
            padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()||loading} style={{ background:"#E8005A",
            border:"none", borderRadius:8, padding:"9px 20px", color:"#fff", fontSize:13, fontWeight:600,
            cursor:name.trim()?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif",
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
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0a0a" }}>
      <LeftPanel user={user} onNav={handleNav} />

      <main style={{ flex:1, padding:"36px 40px", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800,
              color:"#fff", letterSpacing:"-0.5px", margin:0 }}>My Databases</h1>
            <p style={{ color:"#444", fontSize:13, marginTop:4 }}>
              {databases.length} database{databases.length!==1?"s":""}
            </p>
          </div>
          {/* Search bar */}
          <div style={{ position:"relative" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search databases…"
              style={{ padding:"9px 16px 9px 36px", border:"1px solid #333", borderRadius:10,
                background:"#1a1a1a", color:"#fff", fontSize:13, outline:"none",
                fontFamily:"'DM Sans',sans-serif", width:220, transition:"border-color 0.15s" }}
              onFocus={e=>e.target.style.borderColor="#E8005A"} onBlur={e=>e.target.style.borderColor="#333"} />
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
              color:"#555", fontSize:14 }}>🔍</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #333",
              borderTopColor:"#E8005A", animation:"spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
            gap:14, overflowY:"auto" }}>
            {/* Create card */}
            <div onClick={()=>setShowCreate(true)} style={{ border:"1.5px dashed #333", borderRadius:12,
              padding:"24px 20px", cursor:"pointer", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:10, minHeight:130, transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E8005A"; e.currentTarget.style.background="rgba(232,0,90,0.04)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="#333"; e.currentTarget.style.background="none"; }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(232,0,90,0.1)",
                border:"1px solid rgba(232,0,90,0.2)", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:20, color:"#E8005A" }}>+</div>
              <span style={{ fontSize:12, fontWeight:600, color:"#555", fontFamily:"'DM Sans',sans-serif" }}>
                Create Database</span>
            </div>

            {/* Database cards */}
            {filtered.map(db => (
              <div key={db.id} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:12,
                padding:"20px", cursor:"pointer", transition:"all 0.2s", position:"relative",
                minHeight:130, display:"flex", flexDirection:"column", justifyContent:"space-between" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="#333"; e.currentTarget.style.background="#161616"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e1e1e"; e.currentTarget.style.background="#111"; }}
                onClick={()=>navigate(`/dashboard/db/${db.id}`)}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:10, color:"#E8005A", fontWeight:600,
                      textTransform:"uppercase", letterSpacing:"0.06em" }}>
                      {db.role==="owner"?"Owner":db.role}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:"1px 7px", borderRadius:5,
                      background: (db.kind==="linkedin") ? "rgba(10,102,194,0.15)" : "rgba(232,0,90,0.12)",
                      color: (db.kind==="linkedin") ? "#4a9eff" : "#E8005A" }}>
                      {db.kind==="linkedin" ? "🔗 LinkedIn" : "🗺️ Maps"}</span>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
                    color:"#fff", letterSpacing:"-0.3px", lineHeight:1.3 }}>{db.name}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14 }}>
                  <span style={{ fontSize:11, color:"#444" }}>
                    {new Date(db.created_at).toLocaleDateString()}</span>
                  {db.role==="owner" && (
                    <button onClick={e=>{ e.stopPropagation(); handleDelete(db.id); }} style={{
                      background:"none", border:"none", color:"#444", fontSize:12, cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif", padding:"2px 6px", borderRadius:4 }}
                      onMouseEnter={e=>e.target.style.color="#E8005A"} onMouseLeave={e=>e.target.style.color="#444"}>
                      Delete</button>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && search && (
              <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#444", fontSize:14,
                padding:"40px 0", fontStyle:"italic" }}>
                No databases matching "{search}"</div>
            )}
          </div>
        )}
      </main>

      {showCreate && <CreateDBModal onClose={()=>setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}