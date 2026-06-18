import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { ReachCTLogo } from "../components/icons.jsx";

// ─── Shared styles ────────────────────────────────────────────────────────────
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
    }}>
      {icon} {label}
    </button>
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

// ─── Connect Card ─────────────────────────────────────────────────────────────
function ConnectCard({ onConnected, token }) {
  const [apiKey,  setApiKey]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/mailrelay/connect`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({api_key: apiKey.trim()}),
      });
      if (!res.ok) { const e=await res.json(); throw new Error(e.detail||"Connection failed"); }
      onConnected();
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flex:1, padding:40 }}>
      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:20,
        padding:"40px 48px", maxWidth:460, width:"100%", textAlign:"center",
        boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
          color:"#111", marginBottom:8 }}>Link Mailrelay Account</h2>
        <p style={{ fontSize:14, color:"#888", marginBottom:28, lineHeight:1.6 }}>
          Connect your Mailrelay account to create email campaigns from your ReachCT contacts.
          Find your API key in <strong>Mailrelay → Settings → API Keys</strong>.
        </p>
        <input value={apiKey} onChange={e=>setApiKey(e.target.value)}
          placeholder="Paste your Mailrelay API key" type="password"
          style={{ ...inputStyle, marginBottom:16 }}
          onFocus={e=>e.target.style.borderColor="#E8005A"}
          onBlur={e=>e.target.style.borderColor="#e8e8e8"}
          onKeyDown={e=>e.key==="Enter"&&handleConnect()} />
        {error && <div style={{ fontSize:13, color:"#E8005A", marginBottom:12 }}>{error}</div>}
        <button onClick={handleConnect} disabled={!apiKey.trim()||loading}
          style={{ ...primaryBtnStyle, width:"100%", padding:"12px 0", opacity:apiKey.trim()?1:0.5 }}>
          {loading?"Connecting…":"Connect Mailrelay"}
        </button>
      </div>
    </div>
  );
}

// ─── Quill Editor ─────────────────────────────────────────────────────────────
function RichEditor({ value, onChange, height=280 }) {
  const containerRef = useRef(null);
  const quillRef     = useRef(null);
  const onChangeRef  = useRef(onChange);
  onChangeRef.current = onChange;
  const initialValue = useRef(value);

  useEffect(() => {
    if (quillRef.current) return;

    // Load CSS first, then init Quill
    const loadQuill = () => {
      import("quill").then(({ default: Quill }) => {
        if (quillRef.current) return;
        quillRef.current = new Quill(containerRef.current, {
          theme:"snow",
          modules:{ toolbar:[
            [{header:[1,2,3,false]}],
            ["bold","italic","underline","strike"],
            [{color:[]},{background:[]}],
            [{list:"ordered"},{list:"bullet"}],
            [{align:[]}],
            ["link","image"],
            ["clean"],
          ]},
          placeholder:"Write your email here, paste content, or use ReachAI below…",
        });
        if (initialValue.current) {
          quillRef.current.root.innerHTML = initialValue.current;
        }
        quillRef.current.on("text-change", () => {
          onChangeRef.current(quillRef.current.root.innerHTML);
        });
      });
    };

    if (!document.getElementById("quill-css")) {
      const link = document.createElement("link");
      link.id  = "quill-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css";
      link.onload = loadQuill;
      document.head.appendChild(link);
    } else {
      loadQuill();
    }
  }, []);

  // Sync external value changes (e.g. AI append)
  useEffect(() => {
    if (quillRef.current) {
      const current = quillRef.current.root.innerHTML;
      if (value !== current) {
        quillRef.current.root.innerHTML = value || "";
        // Move cursor to end
        const len = quillRef.current.getLength();
        quillRef.current.setSelection(len, 0);
      }
    }
  }, [value]);

  return (
    <div style={{ border:"1.5px solid #e8e8e8", borderRadius:10, overflow:"hidden",
      background:"#fff" }}>
      <div ref={containerRef} style={{ height, fontFamily:"'DM Sans',sans-serif",
        fontSize:14, color:"#111", background:"#fff" }} />
      <style>{`
        .ql-container { font-family: 'DM Sans', sans-serif !important; color: #111 !important; }
        .ql-editor { color: #111 !important; min-height: ${height}px; }
        .ql-editor.ql-blank::before { color: #bbb !important; }
        .ql-toolbar { border-bottom: 1px solid #eee !important; background: #fafafa; }
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #eee !important; }
      `}</style>
    </div>
  );
}

// ─── Step 1 — Name + Groups ───────────────────────────────────────────────────
function Step1({ groups, setGroups, token, onNext, onClose }) {
  const [databases,    setDatabases]    = useState([]);
  const [selectedDb,   setSelectedDb]   = useState(null);
  const [entries,      setEntries]      = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/databases`, { headers:{Authorization:`Bearer ${token}`} })
      .then(r=>r.json())
      .then(async dbs => {
        if (!Array.isArray(dbs)) return;
        const withCounts = await Promise.all(dbs.map(async db => {
          try {
            const res  = await fetch(`${API}/api/databases/${db.id}/entries`, { headers:{Authorization:`Bearer ${token}`} });
            const rows = await res.json();
            const real = Array.isArray(rows) ? rows.filter(e=>Object.values(e.data||{}).some(v=>v&&String(v).trim())) : [];
            return { ...db, rowCount: real.length };
          } catch { return { ...db, rowCount:0 }; }
        }));
        setDatabases(withCounts);
      }).catch(()=>{});
  }, []);

  const loadEntries = async (dbId) => {
    setSelectedDb(dbId);
    const res  = await fetch(`${API}/api/databases/${dbId}/entries`, { headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json();
    const real = Array.isArray(data) ? data.filter(e=>Object.values(e.data||{}).some(v=>v&&String(v).trim())) : [];
    setEntries(real);
  };

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    setGroups(prev => [...prev, { name: newGroupName.trim(), emails: new Set() }]);
    setNewGroupName(""); setShowAddGroup(false);
  };

  const addEmailToGroup = (groupIdx, email) => {
    setGroups(prev => prev.map((g, i) => i===groupIdx
      ? { ...g, emails: new Set([...g.emails, email]) }
      : g
    ));
  };

  const removeEmailFromGroup = (groupIdx, email) => {
    setGroups(prev => prev.map((g, i) => i===groupIdx
      ? { ...g, emails: new Set([...g.emails].filter(e=>e!==email)) }
      : g
    ));
  };

  const addAllEmails = (groupIdx) => {
    const emails = entries.filter(e=>e.data?.email?.includes("@")).map(e=>e.data.email);
    setGroups(prev => prev.map((g, i) => i===groupIdx
      ? { ...g, emails: new Set([...g.emails, ...emails]) }
      : g
    ));
  };

  const totalEmails = groups.reduce((sum, g) => sum + g.emails.size, 0);

  const handleNext = () => {
    if (groups.length === 0) { setError("Add at least one group."); return; }
    if (totalEmails === 0) { setError("Add at least one email to a group."); return; }
    onNext();
  };

  return (
    <>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
        color:"#111", margin:"0 0 20px" }}>Create Contact Groups</h2>

      {/* Groups */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <label style={labelStyle}>Contact Groups ({totalEmails} emails total)</label>
          <button onClick={()=>setShowAddGroup(true)} style={{
            background:"none", border:"1px solid #E8005A", borderRadius:6,
            padding:"4px 12px", fontSize:12, color:"#E8005A", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif" }}>+ New Group</button>
        </div>

        {showAddGroup && (
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input autoFocus value={newGroupName} onChange={e=>setNewGroupName(e.target.value)}
              placeholder="Group name e.g. Real Estate Valencia"
              style={{ ...inputStyle, flex:1 }}
              onKeyDown={e=>{ if(e.key==="Enter") addGroup(); if(e.key==="Escape") setShowAddGroup(false); }} />
            <button onClick={addGroup} style={{ ...primaryBtnStyle, padding:"10px 16px" }}>Add</button>
            <button onClick={()=>setShowAddGroup(false)} style={cancelBtnStyle}>Cancel</button>
          </div>
        )}

        {groups.length === 0 && (
          <div style={{ border:"1.5px dashed #eee", borderRadius:10, padding:"20px",
            textAlign:"center", color:"#bbb", fontSize:13 }}>
            No groups yet — create a group to add contacts
          </div>
        )}

        {groups.map((group, gi) => (
          <div key={gi} style={{ border:"1px solid #eee", borderRadius:12, marginBottom:12, overflow:"hidden" }}>
            <div style={{ background:"#f8f8f8", padding:"10px 16px", display:"flex",
              alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontWeight:600, color:"#111", fontSize:14 }}>
                {group.name} <span style={{ color:"#999", fontWeight:400, fontSize:12 }}>({group.emails.size} emails)</span>
              </span>
              <button onClick={()=>setGroups(prev=>prev.filter((_,i)=>i!==gi))} style={{
                background:"none", border:"none", color:"#ccc", cursor:"pointer", fontSize:16 }}
                onMouseEnter={e=>e.target.style.color="#E8005A"}
                onMouseLeave={e=>e.target.style.color="#ccc"}>×</button>
            </div>

            {/* Select database to add from */}
            <div style={{ padding:"12px 16px" }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                {databases.map(db => (
                  <button key={db.id} onClick={()=>loadEntries(db.id)} style={{
                    background: selectedDb===db.id ? "rgba(232,0,90,0.08)" : "#fff",
                    border: selectedDb===db.id ? "1.5px solid #E8005A" : "1px solid #eee",
                    borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer",
                    color: selectedDb===db.id ? "#E8005A" : "#666",
                    fontFamily:"'DM Sans',sans-serif" }}>
                    {db.name}
                  </button>
                ))}
              </div>

              {selectedDb && entries.length > 0 && (
                <div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}>
                    <button onClick={()=>addAllEmails(gi)} style={{
                      fontSize:11, color:"#E8005A", background:"none", border:"none",
                      cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      Add all with email
                    </button>
                  </div>
                  <div style={{ maxHeight:150, overflowY:"auto", border:"1px solid #f0f0f0", borderRadius:8 }}>
                    {entries.filter(e=>e.data?.email?.includes("@")).map((entry, ei) => {
                      const email = entry.data.email;
                      const inGroup = group.emails.has(email);
                      return (
                        <div key={ei} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"7px 12px", borderBottom:"1px solid #f5f5f5",
                          background: inGroup ? "rgba(232,0,90,0.03)" : "#fff" }}>
                          <div>
                            <div style={{ fontSize:13, color:"#111", fontWeight:500 }}>{entry.data?.name||email}</div>
                            <div style={{ fontSize:11, color:"#E8005A" }}>{email}</div>
                          </div>
                          <button onClick={()=> inGroup ? removeEmailFromGroup(gi,email) : addEmailToGroup(gi,email)}
                            style={{ background: inGroup?"#fff":"#E8005A", border: inGroup?"1px solid #E8005A":"none",
                              borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer",
                              color: inGroup?"#E8005A":"#fff", fontFamily:"'DM Sans',sans-serif" }}>
                            {inGroup?"Remove":"Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show added emails */}
              {group.emails.size > 0 && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>Added emails:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {[...group.emails].slice(0,8).map(email => (
                      <span key={email} style={{ background:"rgba(232,0,90,0.08)", border:"1px solid rgba(232,0,90,0.2)",
                        borderRadius:6, padding:"2px 8px", fontSize:11, color:"#E8005A",
                        display:"flex", alignItems:"center", gap:4 }}>
                        {email}
                        <button onClick={()=>removeEmailFromGroup(gi,email)} style={{
                          background:"none", border:"none", cursor:"pointer", color:"#E8005A",
                          fontSize:12, padding:0, lineHeight:1 }}>×</button>
                      </span>
                    ))}
                    {group.emails.size > 8 && (
                      <span style={{ fontSize:11, color:"#999" }}>+{group.emails.size-8} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ fontSize:13, color:"#E8005A", marginBottom:12 }}>{error}</div>}

      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
        <button onClick={handleNext} style={primaryBtnStyle}>Next → Write Email</button>
      </div>
    </>
  );
}

// ─── Step 2 — Write Email ─────────────────────────────────────────────────────
function Step2({ name, subject, setSubject, body, setBody, totalEmails, groups, token, onBack, onNext, onSkip }) {
  const [templates,     setTemplates]     = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiInput,       setAiInput]       = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiMessages,    setAiMessages]    = useState([]);
  const [error,         setError]         = useState("");

  useEffect(() => {
    fetch(`${API}/api/templates`, { headers:{Authorization:`Bearer ${token}`} })
      .then(r=>r.json()).then(d=>setTemplates(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  const importTemplate = (t) => {
    setSubject(t.subject||"");
    setBody(t.body||"");
    setShowTemplates(false);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()||aiLoading) return;
    const instruction = aiInput.trim();
    setAiInput(""); setAiLoading(true);
    setAiMessages(prev=>[...prev,{role:"user",text:instruction}]);
    try {
      const res  = await fetch(`${API}/api/campaigns/enhance`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({current_body:body, instruction, subject}),
      });
      const data = await res.json();
      const appended = (body||"") + (body?"<br><br>":"") + data.body;
      setBody(appended);
      setAiMessages(prev=>[...prev,{role:"ai",text:"✅ Added to your email — review and edit as needed."}]);
    } catch {
      setAiMessages(prev=>[...prev,{role:"ai",text:"❌ Failed — please try again."}]);
    }
    setAiLoading(false);
  };

  return (
    <>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
        color:"#111", margin:"0 0 4px" }}>Write Your Email</h2>
      <p style={{ fontSize:13, color:"#999", marginBottom:16 }}>
        Sending to <strong style={{ color:"#111" }}>{totalEmails}</strong> contacts across <strong style={{ color:"#111" }}>{groups?.length||1}</strong> group{(groups?.length||1)!==1?"s":""}.
      </p>

      {/* Import template */}
      <div style={{ position:"relative", marginBottom:16 }}>
        <button onClick={()=>setShowTemplates(!showTemplates)} style={{
          background:"none", border:"1px solid #e8e8e8", borderRadius:8,
          padding:"7px 14px", fontSize:12, cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif", color:"#666",
          display:"flex", alignItems:"center", gap:6 }}>
          📝 Import Template {templates.length>0?`(${templates.length})`:""} ▾
        </button>
        {showTemplates && (
          <div style={{ position:"absolute", top:"100%", left:0, zIndex:200,
            background:"#fff", border:"1px solid #eee", borderRadius:10,
            boxShadow:"0 8px 24px rgba(0,0,0,0.1)", minWidth:280, marginTop:4,
            maxHeight:200, overflowY:"auto" }}>
            {templates.length===0 ? (
              <div style={{ padding:"16px 20px", fontSize:13, color:"#999" }}>
                No templates yet — create some in Email Templates
              </div>
            ) : templates.map(t=>(
              <div key={t.id} onClick={()=>importTemplate(t)} style={{
                padding:"10px 16px", cursor:"pointer", borderBottom:"1px solid #f5f5f5" }}
                onMouseEnter={e=>e.currentTarget.style.background="#f9f9f9"}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <div style={{ fontSize:13, fontWeight:600, color:"#111" }}>{t.name}</div>
                {t.subject&&<div style={{ fontSize:11, color:"#999" }}>{t.subject}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subject */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Subject Line</label>
        <input value={subject} onChange={e=>setSubject(e.target.value)}
          placeholder="e.g. Oportunidad de prácticas para tu empresa"
          style={inputStyle} />
      </div>

      {/* Rich editor */}
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Email Body</label>
        <RichEditor value={body} onChange={setBody} height={240} />
      </div>

            {error&&<div style={{ fontSize:13, color:"#E8005A", marginBottom:12 }}>{error}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <button onClick={onBack} style={cancelBtnStyle}>← Back</button>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onSkip} style={{ ...cancelBtnStyle, color:"#E8005A", borderColor:"rgba(232,0,90,0.3)" }}>
            Skip → Mailrelay
          </button>
          <button onClick={()=>{ if(!subject){setError("Please add a subject line.");return;} onNext(); }}
            style={primaryBtnStyle}>
            Next → Review
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Step 3 — Review & Send ───────────────────────────────────────────────────
function Step3({ name, subject, body, groups, token, onBack, onCreate, onClose }) {
  const [senders,    setSenders]    = useState([]);
  const [senderId,   setSenderId]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const totalEmails = groups.reduce((sum, g) => sum + g.emails.size, 0);

  useEffect(() => {
    fetch(`${API}/api/mailrelay/senders`, { headers:{Authorization:`Bearer ${token}`} })
      .then(r=>r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setSenders(list);
        if (list.length > 0) setSenderId(list[0].id);
      }).catch(()=>{});
  }, []);

  const handleCreate = async () => {
    if (!senderId) { setError("Please select a sender."); return; }
    setLoading(true); setError("");
    try {
      const contacts = [];
      groups.forEach(g => g.emails.forEach(email => contacts.push({ email })));

      const res = await fetch(`${API}/api/campaigns`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({
          name: subject || groups[0]?.name || "ReachCT Campaign",
          subject,
          body: body || "<p>Email body — edit in Mailrelay before sending.</p>",
          contacts,
          sender_id: Number(senderId),
          groups: groups.map(g => ({ name: g.name, emails: [...g.emails] })),
        }),
      });
      if (!res.ok) { const e=await res.json(); throw new Error(e.detail||"Failed"); }
      const data = await res.json();
      onCreate(data);
      onClose();
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
        color:"#111", margin:"0 0 8px" }}>Review & Create Campaign</h2>
      <p style={{ fontSize:13, color:"#999", marginBottom:20 }}>
        ReachCT will create groups and a campaign draft in Mailrelay. You confirm and send from Mailrelay.
      </p>

      <div style={{ background:"#f8f8f8", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontWeight:600, color:"#111", marginBottom:6, fontSize:14 }}>Subject: {subject}</div>
        <div style={{ color:"#666", fontSize:13 }}>
          {groups.length} group{groups.length!==1?"s":""} · {totalEmails} contacts total
        </div>
        <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:6 }}>
          {groups.map((g,i)=>(
            <span key={i} style={{ background:"rgba(232,0,90,0.08)", border:"1px solid rgba(232,0,90,0.2)",
              borderRadius:6, padding:"2px 8px", fontSize:11, color:"#E8005A" }}>
              {g.name} ({g.emails.size})
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Select Sender *</label>
        {senders.length === 0 ? (
          <div style={{ fontSize:13, color:"#999", padding:"10px 0" }}>
            Loading senders… Make sure you have configured senders in Mailrelay → Campaigns → Senders
          </div>
        ) : (
          <select value={senderId} onChange={e=>setSenderId(e.target.value)}
            style={{ ...inputStyle, cursor:"pointer", appearance:"none" }}>
            {senders.map(s=>(
              <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10,
        padding:"12px 16px", fontSize:13, color:"#166534", marginBottom:16 }}>
        ℹ️ After creating, go to <strong>spain-internship.ipzmarketing.com</strong> to review and send.
      </div>

      {error && <div style={{ fontSize:13, color:"#E8005A", marginBottom:12 }}>{error}</div>}

      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <button onClick={onBack} style={cancelBtnStyle}>← Back</button>
        <button onClick={handleCreate} disabled={!senderId||loading}
          style={{ ...primaryBtnStyle, opacity:senderId?1:0.5 }}>
          {loading?"Creating…":"Create Campaign in Mailrelay"}
        </button>
      </div>
    </>
  );
}

// ─── Create Campaign Modal ────────────────────────────────────────────────────
function CreateCampaignModal({ onClose, onCreate, token }) {
  const [step,    setStep]    = useState(1);
  const [name,    setName]    = useState("");
  const [groups,  setGroups]  = useState([]); // [{name, emails: Set}]
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");

  const totalEmails = groups.reduce((sum, g) => sum + g.emails.size, 0);

  const handleSkip = () => {
    // Just open Mailrelay directly — group + contacts already created in step 1
    window.open("https://spain-internship.ipzmarketing.com/admin/campaigns","_blank");
    onClose();
  };

  const stepLabel = ["Create Groups","Write Email","Review & Send"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:640,
        maxHeight:"92vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={e=>e.stopPropagation()}>

        {/* Step indicators */}
        <div style={{ display:"flex", gap:8, marginBottom:28 }}>
          {stepLabel.map((label, i) => (
            <div key={i} style={{ flex:1, textAlign:"center" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", margin:"0 auto 4px",
                background: step===i+1?"#E8005A":step>i+1?"#111":"#eee",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, color:step>=i+1?"#fff":"#999" }}>
                {step>i+1?"✓":i+1}
              </div>
              <div style={{ fontSize:11, color:step===i+1?"#E8005A":"#999",
                fontFamily:"'DM Sans',sans-serif", fontWeight:step===i+1?600:400 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {step===1 && <Step1 groups={groups} setGroups={setGroups}
          token={token} onNext={()=>setStep(2)} onClose={onClose} />}
        {step===2 && <Step2 name={name} subject={subject} setSubject={setSubject}
          body={body} setBody={setBody} totalEmails={totalEmails} groups={groups} token={token}
          onBack={()=>setStep(1)} onNext={()=>setStep(3)} onSkip={handleSkip} />}
        {step===3 && <Step3 name={name} subject={subject} body={body} groups={groups}
          token={token} onBack={()=>setStep(2)} onCreate={onCreate} onClose={onClose} />}
      </div>
    </div>
  );
}

// ─── Mail Campaigns Page ──────────────────────────────────────────────────────
export default function MailCampaignsPage() {
  const { user, token }           = useAuth();
  const navigate                  = useNavigate();
  const [connected,   setConnected]   = useState(false);
  const [campaigns,   setCampaigns]   = useState([]);
  const [showCreate,  setShowCreate]  = useState(false);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    checkStatus();
  }, [token]);

  const checkStatus = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`${API}/api/mailrelay/status`,  { headers:{Authorization:`Bearer ${token}`} }),
        fetch(`${API}/api/campaigns`,          { headers:{Authorization:`Bearer ${token}`} }),
      ]);
      const status    = await sRes.json();
      const campaigns = await cRes.json();
      setConnected(status.connected);
      setCampaigns(Array.isArray(campaigns)?campaigns:[]);
    } catch {}
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect your Mailrelay account?")) return;
    await fetch(`${API}/api/mailrelay/disconnect`, { method:"DELETE", headers:{Authorization:`Bearer ${token}`} });
    setConnected(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this campaign record?")) return;
    await fetch(`${API}/api/campaigns/${id}`, { method:"DELETE", headers:{Authorization:`Bearer ${token}`} });
    setCampaigns(prev=>prev.filter(c=>c.id!==id));
  };

  const handleNav = (p) => {
    if (p==="/")           navigate("/");
    else if (p==="databases")  navigate("/dashboard");
    else if (p==="templates")  navigate("/templates");
    // "campaigns" = current page, do nothing
  };

  if (loading) return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0a0a" }}>
      <LeftPanel user={user} activePage="campaigns" onNav={handleNav}/>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #333",
          borderTopColor:"#E8005A", animation:"spin 0.8s linear infinite" }} />
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0a0a0a" }}>
      <LeftPanel user={user} activePage="campaigns" onNav={handleNav} />

      <main style={{ flex:1, padding:"36px 40px", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800,
              color:"#fff", letterSpacing:"-0.5px", margin:0 }}>Mail Campaigns</h1>
            <p style={{ color:"#444", fontSize:13, marginTop:4 }}>
              {connected ? (
                <span>Connected to Mailrelay ✅ &nbsp;
                  <button onClick={handleDisconnect} style={{ background:"none", border:"none",
                    color:"#555", fontSize:12, cursor:"pointer", textDecoration:"underline",
                    fontFamily:"'DM Sans',sans-serif" }}>Disconnect</button>
                </span>
              ) : "Connect your Mailrelay account to get started"}
            </p>
          </div>
          {connected && (
            <button onClick={()=>setShowCreate(true)} style={{
              ...primaryBtnStyle, display:"flex", alignItems:"center", gap:6 }}>
              + Create Campaign
            </button>
          )}
        </div>

        {!connected ? (
          <ConnectCard onConnected={()=>setConnected(true)} token={token} />
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
            <div onClick={()=>setShowCreate(true)} style={{ border:"1.5px dashed #333",
              borderRadius:12, padding:"24px 20px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:10, minHeight:150, transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E8005A"; e.currentTarget.style.background="rgba(232,0,90,0.04)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="#333"; e.currentTarget.style.background="none"; }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(232,0,90,0.1)",
                border:"1px solid rgba(232,0,90,0.2)", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:20, color:"#E8005A" }}>+</div>
              <span style={{ fontSize:12, fontWeight:600, color:"#555", fontFamily:"'DM Sans',sans-serif" }}>
                Create Campaign</span>
            </div>

            {campaigns.map(c=>(
              <div key={c.id} style={{ background:"#111", border:"1px solid #1e1e1e",
                borderRadius:12, padding:20, transition:"all 0.2s",
                display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:150 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#333"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e1e"}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:600, color:"#E8005A",
                      textTransform:"uppercase", letterSpacing:"0.06em" }}>{c.status||"draft"}</span>
                    <span style={{ fontSize:11, color:"#555" }}>{c.contact_count} contacts</span>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
                    color:"#fff", marginBottom:6 }}>{c.name}</div>
                  <div style={{ fontSize:12, color:"#555", overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.subject}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14 }}>
                  <span style={{ fontSize:11, color:"#444" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                  <div style={{ display:"flex", gap:8 }}>
                    <a href="https://app.mailrelay.com/campaigns" target="_blank" rel="noreferrer"
                      style={{ fontSize:12, color:"#E8005A", textDecoration:"none",
                        fontFamily:"'DM Sans',sans-serif" }}>Open in Mailrelay →</a>
                    <button onClick={()=>handleDelete(c.id)} style={{ background:"none", border:"none",
                      color:"#444", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>e.target.style.color="#E8005A"} onMouseLeave={e=>e.target.style.color="#444"}>
                      Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateCampaignModal
          onClose={()=>setShowCreate(false)}
          onCreate={data=>{ if(data?.campaign) setCampaigns(prev=>[data.campaign,...prev]); }}
          token={token}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}