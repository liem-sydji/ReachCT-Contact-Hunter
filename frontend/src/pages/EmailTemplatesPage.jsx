import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { ReachCTLogo } from "../components/icons.jsx";

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel({ user, activePage, onNav }) {
  const navItem = (label, page, icon) => (
    <button onClick={() => onNav(page)} style={{
      display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left",
      background: activePage===page ? "rgba(232,0,90,0.12)" : "none",
      border: activePage===page ? "1px solid rgba(232,0,90,0.2)" : "1px solid transparent",
      borderRadius:8, padding:"8px 12px", cursor:"pointer",
      color: activePage===page ? "#E8005A" : "#888", fontSize:12,
      fontWeight: activePage===page ? 600 : 400,
      fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
    }}>{icon} {label}</button>
  );
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
                fontSize:13, fontWeight:700, color:"#fff" }}>
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
          {navItem("Databases",       "databases",  "🗄️")}
          {navItem("Mail Campaigns",  "campaigns",  "📧")}
          {navItem("Email Templates", "templates",  "📝")}
        </div>
      </div>
    </aside>
  );
}

// ─── Quill Editor ─────────────────────────────────────────────────────────────
function RichEditor({ value, onChange, height = 300 }) {
  const containerRef = useRef(null);
  const quillRef     = useRef(null);
  const onChangeRef  = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (quillRef.current) return;

    const initQuill = () => {
      import("quill").then(({ default: Quill }) => {
        if (quillRef.current) return;
        quillRef.current = new Quill(containerRef.current, {
          theme: "snow",
          modules: {
            toolbar: [
              [{ header: [1,2,3,false] }],
              ["bold","italic","underline","strike"],
              [{ color:[] },{ background:[] }],
              [{ list:"ordered" },{ list:"bullet" }],
              [{ align:[] }],
              ["link","image"],
              ["clean"],
            ],
          },
          placeholder: "Write your email here…",
        });
        if (value) quillRef.current.root.innerHTML = value;
        quillRef.current.on("text-change", () => {
          onChangeRef.current(quillRef.current.root.innerHTML);
        });
      });
    };

    if (!document.getElementById("quill-css")) {
      const link = document.createElement("link");
      link.id    = "quill-css";
      link.rel   = "stylesheet";
      link.href  = "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css";
      link.onload = initQuill;
      document.head.appendChild(link);
    } else {
      initQuill();
    }
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div style={{ border:"1.5px solid #e8e8e8", borderRadius:10, overflow:"hidden", background:"#fff" }}>
      <div ref={containerRef} style={{ height, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#111" }} />
      <style>{`
        .ql-container { font-family: 'DM Sans', sans-serif !important; color: #111 !important; }
        .ql-editor { color: #111 !important; }
        .ql-editor.ql-blank::before { color: #bbb !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #eee !important; background: #fafafa; }
      `}</style>
    </div>
  );
}

// ─── Template Editor Modal ────────────────────────────────────────────────────
function TemplateModal({ template, onClose, onSave }) {
  const [name,    setName]    = useState(template?.name    || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body,    setBody]    = useState(template?.body    || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onSave({ name: name.trim(), subject, body });
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:700,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={e=>e.stopPropagation()}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
          color:"#111", margin:"0 0 20px" }}>
          {template ? "Edit Template" : "New Template"}
        </h2>
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Template Name</label>
          <input value={name} onChange={e=>setName(e.target.value)}
            placeholder="e.g. Spanish Warm Outreach"
            style={inputStyle} autoFocus />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Subject Line</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)}
            placeholder="e.g. Oportunidad de prácticas para tu empresa"
            style={inputStyle} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={labelStyle}>Email Body</label>
          <RichEditor value={body} onChange={setBody} height={300} />
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()||loading}
            style={{ ...primaryBtnStyle, opacity:name.trim()?1:0.5 }}>
            {loading?"Saving…":"Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display:"block", fontSize:11, fontWeight:600, color:"#999",
  letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6,
  fontFamily:"'DM Sans',sans-serif",
};
const inputStyle = {
  width:"100%", padding:"10px 14px", border:"1.5px solid #e8e8e8",
  borderRadius:10, fontSize:14, fontFamily:"'DM Sans',sans-serif",
  color:"#111", background:"#fff", outline:"none", boxSizing:"border-box",
};
const primaryBtnStyle = {
  background:"#E8005A", border:"none", borderRadius:8, padding:"9px 20px",
  color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
  fontFamily:"'DM Sans',sans-serif",
};
const cancelBtnStyle = {
  background:"none", border:"1px solid #e8e8e8", borderRadius:8,
  padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer",
  fontFamily:"'DM Sans',sans-serif",
};

// ─── Email Templates Page ─────────────────────────────────────────────────────
export default function EmailTemplatesPage() {
  const { user, token }           = useAuth();
  const navigate                  = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // null | "create" | template object
  const [search, setSearch]       = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchTemplates();
  }, [token]);

  const fetchTemplates = async () => {
    try {
      const res  = await fetch(`${API}/api/templates`, { headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json();
      setTemplates(Array.isArray(data)?data:[]);
    } catch {}
    setLoading(false);
  };

  const handleSave = async ({ name, subject, body }) => {
    try {
      if (modal?.id) {
        // Edit existing
        const res = await fetch(`${API}/api/templates/${modal.id}`, {
          method:"PATCH",
          headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
          body:JSON.stringify({name,subject,body}),
        });
        const updated = await res.json();
        setTemplates(prev => prev.map(t => t.id===modal.id ? updated : t));
      } else {
        // Create new
        const res = await fetch(`${API}/api/templates`, {
          method:"POST",
          headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
          body:JSON.stringify({name,subject,body}),
        });
        const created = await res.json();
        setTemplates(prev => [created, ...prev]);
      }
      setModal(null);
    } catch { alert("Failed to save template"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`${API}/api/templates/${id}`, {
      method:"DELETE", headers:{Authorization:`Bearer ${token}`},
    });
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNav = (p) => {
    if (p === "/") navigate("/");
    else if (p === "databases") navigate("/dashboard");
    else if (p === "campaigns") navigate("/campaigns");
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0a0a" }}>
      <LeftPanel user={user} activePage="templates" onNav={handleNav} />

      <main style={{ flex:1, padding:"36px 40px", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800,
              color:"#fff", letterSpacing:"-0.5px", margin:0 }}>Email Templates</h1>
            <p style={{ color:"#444", fontSize:13, marginTop:4 }}>
              {templates.length} template{templates.length!==1?"s":""}
            </p>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search templates…"
                style={{ padding:"9px 16px 9px 36px", border:"1px solid #333", borderRadius:10,
                  background:"#1a1a1a", color:"#fff", fontSize:13, outline:"none",
                  fontFamily:"'DM Sans',sans-serif", width:200 }}
                onFocus={e=>e.target.style.borderColor="#E8005A"}
                onBlur={e=>e.target.style.borderColor="#333"} />
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                color:"#555", fontSize:14 }}>🔍</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #333",
              borderTopColor:"#E8005A", animation:"spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:14 }}>
            {/* Create card */}
            <div onClick={()=>setModal("create")} style={{ border:"1.5px dashed #333",
              borderRadius:12, padding:"24px 20px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:10, minHeight:160, transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E8005A"; e.currentTarget.style.background="rgba(232,0,90,0.04)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="#333"; e.currentTarget.style.background="none"; }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(232,0,90,0.1)",
                border:"1px solid rgba(232,0,90,0.2)", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:20, color:"#E8005A" }}>+</div>
              <span style={{ fontSize:12, fontWeight:600, color:"#555", fontFamily:"'DM Sans',sans-serif" }}>
                Create Template</span>
            </div>

            {/* Template cards */}
            {filtered.map(t => (
              <div key={t.id} style={{ background:"#111", border:"1px solid #1e1e1e",
                borderRadius:12, padding:20, transition:"all 0.2s",
                display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:160 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#333"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e1e"}>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
                    color:"#fff", marginBottom:6, letterSpacing:"-0.3px" }}>{t.name}</div>
                  {t.subject && (
                    <div style={{ fontSize:12, color:"#555", overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.subject}</div>
                  )}
                  {t.body && (
                    <div style={{ fontSize:11, color:"#444", marginTop:6,
                      overflow:"hidden", display:"-webkit-box",
                      WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}
                      dangerouslySetInnerHTML={{ __html: t.body.replace(/<[^>]*>/g,"").slice(0,80)+"…" }} />
                  )}
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14 }}>
                  <span style={{ fontSize:11, color:"#444" }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={()=>setModal(t)} style={{ background:"none", border:"none",
                      color:"#666", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#666"}>
                      Edit
                    </button>
                    <button onClick={()=>handleDelete(t.id)} style={{ background:"none", border:"none",
                      color:"#444", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>e.target.style.color="#E8005A"} onMouseLeave={e=>e.target.style.color="#444"}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length===0 && search && (
              <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#444",
                fontSize:14, padding:"40px 0", fontStyle:"italic" }}>
                No templates matching "{search}"
              </div>
            )}
          </div>
        )}
      </main>

      {modal && (
        <TemplateModal
          template={modal==="create" ? null : modal}
          onClose={()=>setModal(null)}
          onSave={handleSave}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
