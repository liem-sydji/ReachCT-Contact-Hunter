import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";

export default function AddToDBModal({ rows, onClose, dbKind = "maps" }) {
  const { token }               = useAuth();
  const [databases, setDatabases] = useState([]);
  const [selected, setSelected]   = useState([]);   // selected row indices
  const [chosenDb, setChosenDb]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [step, setStep]           = useState(1);     // 1=select rows, 2=choose DB

  useEffect(() => {
    fetch(`${API}/api/databases`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json())
      .then(data=>{
        const all = Array.isArray(data) ? data : [];
        // Only show databases matching this kind (maps or linkedin)
        setDatabases(all.filter(db => (db.kind || "maps") === dbKind));
      }).catch(()=>{});
  }, [token, dbKind]);

  const toggleRow = (i) => setSelected(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
  const selectAll = () => setSelected(rows.map((_,i)=>i));
  const clearAll  = () => setSelected([]);

  const handleAdd = async () => {
    if (!chosenDb || selected.length===0) return;
    setLoading(true);
    const selectedRows = selected.map(i => rows[i]);
    try {
      await fetch(`${API}/api/databases/add-rows`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ db_id: chosenDb, rows: selectedRows }),
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch { alert("Failed to add rows"); }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:560,
        maxHeight:"85vh", display:"flex", flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={e=>e.stopPropagation()}>

        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:19, fontWeight:800,
          color:"#111", margin:"0 0 4px", letterSpacing:"-0.4px" }}>
          {step===1?"Select Rows":"Choose Database"}
        </h2>
        <p style={{ fontSize:13, color:"#999", marginBottom:16 }}>
          {step===1
            ? `${selected.length} of ${rows.length} rows selected`
            : `Adding ${selected.length} rows to database`}
        </p>

        {success ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
            flex:1, flexDirection:"column", gap:12, padding:"40px 0" }}>
            <div style={{ fontSize:40 }}>✅</div>
            <div style={{ fontSize:15, fontWeight:600, color:"#111" }}>
              Added {selected.length} rows successfully!</div>
          </div>
        ) : step===1 ? (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <button onClick={selectAll} style={{ fontSize:12, color:"#E8005A", background:"none",
                border:"1px solid rgba(232,0,90,0.2)", borderRadius:6, padding:"4px 10px",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Select all</button>
              <button onClick={clearAll} style={{ fontSize:12, color:"#666", background:"none",
                border:"1px solid #e8e8e8", borderRadius:6, padding:"4px 10px",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Clear</button>
            </div>
            <div style={{ overflowY:"auto", flex:1, border:"1px solid #eee", borderRadius:10 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr>
                    <th style={{ width:36, padding:"10px 12px", background:"#f8f8f8",
                      borderBottom:"2px solid #eee", textAlign:"center" }}>
                      <input type="checkbox" checked={selected.length===rows.length}
                        onChange={selected.length===rows.length?clearAll:selectAll} /></th>
                    <th style={{ padding:"10px 12px", background:"#f8f8f8",
                      borderBottom:"2px solid #eee", textAlign:"left", fontSize:11,
                      fontWeight:600, color:"#999", letterSpacing:"0.06em", textTransform:"uppercase" }}>Company</th>
                    <th style={{ padding:"10px 12px", background:"#f8f8f8",
                      borderBottom:"2px solid #eee", textAlign:"left", fontSize:11,
                      fontWeight:600, color:"#999", letterSpacing:"0.06em", textTransform:"uppercase" }}>Email</th>
                    <th style={{ padding:"10px 12px", background:"#f8f8f8",
                      borderBottom:"2px solid #eee", textAlign:"left", fontSize:11,
                      fontWeight:600, color:"#999", letterSpacing:"0.06em", textTransform:"uppercase" }}>{dbKind==="linkedin"?"Title":"Location"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f5f5f5",
                      background: selected.includes(i) ? "rgba(232,0,90,0.03)" : "none",
                      cursor:"pointer" }} onClick={()=>toggleRow(i)}>
                      <td style={{ padding:"10px 12px", textAlign:"center" }}>
                        <input type="checkbox" checked={selected.includes(i)} onChange={()=>toggleRow(i)}
                          onClick={e=>e.stopPropagation()} /></td>
                      <td style={{ padding:"10px 12px", fontWeight:500, color:"#111",
                        maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {row.name||row.full_name||"—"}</td>
                      <td style={{ padding:"10px 12px", color:"#E8005A", fontSize:12,
                        maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {row.email||"—"}</td>
                      <td style={{ padding:"10px 12px", color:"#888", fontSize:12 }}>
                        {dbKind==="linkedin"
                          ? (row.job_title||"—")
                          : ([row.city,row.country].filter(Boolean).join(", ")||"—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:16 }}>
              <button onClick={onClose} style={{ background:"none", border:"1px solid #e8e8e8",
                borderRadius:8, padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={()=>setStep(2)} disabled={selected.length===0} style={{
                background:"#E8005A", border:"none", borderRadius:8, padding:"9px 20px",
                color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", opacity:selected.length>0?1:0.5 }}>
                Next → Choose Database</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:10 }}>
              {databases.length === 0 && (
                <div style={{ textAlign:"center", color:"#999", fontSize:14, padding:"40px 0" }}>
                  No {dbKind==="linkedin"?"LinkedIn":"Maps"} databases yet — create one in My Dashboard first.</div>
              )}
              {databases.map(db => (
                <div key={db.id} onClick={()=>setChosenDb(db.id)} style={{
                  border: chosenDb===db.id ? "2px solid #E8005A" : "1.5px solid #eee",
                  borderRadius:12, padding:"16px 20px", cursor:"pointer", transition:"all 0.15s",
                  background: chosenDb===db.id ? "rgba(232,0,90,0.03)" : "#fff",
                }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700,
                    color:"#111" }}>{db.name}</div>
                  <div style={{ fontSize:11, color:"#999", marginTop:3 }}>
                    {db.role==="owner"?"Owner":db.role} · {new Date(db.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10, marginTop:16 }}>
              <button onClick={()=>setStep(1)} style={{ background:"none", border:"1px solid #e8e8e8",
                borderRadius:8, padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif" }}>← Back</button>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={onClose} style={{ background:"none", border:"1px solid #e8e8e8",
                  borderRadius:8, padding:"9px 18px", color:"#666", fontSize:13, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                <button onClick={handleAdd} disabled={!chosenDb||loading} style={{
                  background:"#E8005A", border:"none", borderRadius:8, padding:"9px 20px",
                  color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", opacity:chosenDb?1:0.5 }}>
                  {loading?"Adding…":`Add ${selected.length} rows`}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}