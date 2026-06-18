import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { InnerHeader } from "../components/shared.jsx";
import { ReachCTLogo } from "../components/icons.jsx";

const AIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/>
  </svg>
);

const SUGGESTIONS = [
  "Search for 25 Marketing Agencies in Madrid, Spain and save to my database",
  "How many companies do I have in total?",
  "Pull all IT companies from Germany and show me the ones with emails",
  "What countries have the most companies in the database?",
  "Create a database called 'Barcelona Leads' and pull all companies from Barcelona into it",
];

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const text   = typeof msg.content === "string" ? msg.content
    : Array.isArray(msg.content) ? msg.content.filter(b => b.type === "text").map(b => b.text).join(" ")
    : "";
  if (!text) return null;

  // Convert /dashboard/db/123 links to clickable
  const parts = text.split(/(\/?dashboard\/db\/\d+)/g);

  return (
    <div style={{ display:"flex", justifyContent: isUser?"flex-end":"flex-start", marginBottom:16 }}>
      {!isUser && (
        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#E8005A,#ff6b9d)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          marginRight:10, marginTop:2 }}>
          <span style={{ fontSize:14 }}>✦</span>
        </div>
      )}
      <div style={{
        maxWidth:"70%", padding:"12px 16px", borderRadius: isUser?"16px 16px 4px 16px":"16px 16px 16px 4px",
        background: isUser?"#E8005A":"#f0f0f0",
        color: isUser?"#fff":"#111",
        fontSize:14, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif",
        whiteSpace:"pre-wrap", wordBreak:"break-word",
      }}>
        {parts.map((part, i) => {
          if (part.match(/\/?dashboard\/db\/\d+/)) {
            const href = part.startsWith("/") ? part : "/" + part;
            return (
              <a key={i} href={href} style={{ color: isUser?"#ffe0ec":"#E8005A",
                textDecoration:"underline", fontWeight:600 }}>
                {href}
              </a>
            );
          }
          return part;
        })}
      </div>
      {isUser && (
        <div style={{ width:32, height:32, borderRadius:"50%", background:"#333",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, marginLeft:10, marginTop:2, fontSize:14, color:"#fff" }}>
          👤
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#E8005A,#ff6b9d)",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ fontSize:14 }}>✦</span>
      </div>
      <div style={{ background:"#f0f0f0", borderRadius:"16px 16px 16px 4px", padding:"12px 16px",
        display:"flex", gap:4, alignItems:"center" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#aaa",
            animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  );
}

export default function ReachAIPage() {
  const { user, token }     = useAuth();
  const navigate            = useNavigate();
  const [messages, setMessages] = useState([]); // full history sent to API
  const [display,  setDisplay]  = useState([]); // display-only (user + assistant text)
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [display, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(""); setError("");

    const userMsg = { role:"user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDisplay(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res  = await fetch(`${API}/api/ai/chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) { const e=await res.json(); throw new Error(e.detail||"Request failed"); }
      const data = await res.json();

      const assistantMsg = { role:"assistant", content: data.reply };
      setMessages(data.messages);
      setDisplay(prev => [...prev, assistantMsg]);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestion = (s) => { setInput(s); textareaRef.current?.focus(); };

  const clearChat = () => { setMessages([]); setDisplay([]); setError(""); };

  return (
    <div className="inner-page" style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <InnerHeader title="ReachAI" />

      {/* Chat area */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 0" }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px" }}>

          {/* Empty state */}
          {display.length === 0 && (
            <div style={{ textAlign:"center", paddingTop:40 }}>
              <div style={{ width:60, height:60, borderRadius:"50%",
                background:"linear-gradient(135deg,#E8005A,#ff6b9d)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 16px", fontSize:26 }}>✦</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
                color:"#111", margin:"0 0 8px" }}>ReachAI</h2>
              <p style={{ color:"#999", fontSize:14, marginBottom:32, maxWidth:400, margin:"0 auto 32px" }}>
                Your AI assistant for ReachCT. Search companies, manage your databases, and get insights — just by asking.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, maxWidth:600, margin:"0 auto" }}>
                {SUGGESTIONS.map((s, i) => (
                  <div key={i} onClick={()=>handleSuggestion(s)} style={{
                    background:"#f8f8f8", border:"1px solid #eee", borderRadius:12,
                    padding:"12px 16px", cursor:"pointer", fontSize:13, color:"#444",
                    textAlign:"left", lineHeight:1.4, transition:"all 0.15s",
                    gridColumn: i===4?"1/-1":undefined,
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E8005A"; e.currentTarget.style.background="rgba(232,0,90,0.02)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="#eee"; e.currentTarget.style.background="#f8f8f8"; }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {display.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          {error && (
            <div style={{ background:"#FFF1F2", border:"1px solid #FECDD3", borderRadius:10,
              padding:"10px 16px", fontSize:13, color:"#9F1239", marginBottom:16 }}>
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{ background:"#fff", borderTop:"1px solid #eee", padding:"16px 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          {display.length > 0 && (
            <button onClick={clearChat} style={{ fontSize:12, color:"#bbb", background:"none",
              border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              marginBottom:8, padding:0 }}
              onMouseEnter={e=>e.target.style.color="#666"} onMouseLeave={e=>e.target.style.color="#bbb"}>
              Clear conversation
            </button>
          )}
          <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
            <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Ask ReachAI anything… e.g. 'Search 25 IT companies in Berlin and save to my Tech Leads database'"
              rows={2} style={{ flex:1, padding:"12px 16px", border:"1.5px solid #e8e8e8",
                borderRadius:12, fontSize:14, fontFamily:"'DM Sans',sans-serif",
                color:"#111", outline:"none", resize:"none", lineHeight:1.5,
                transition:"border-color 0.15s" }}
              onFocus={e=>e.target.style.borderColor="#E8005A"}
              onBlur={e=>e.target.style.borderColor="#e8e8e8"} />
            <button onClick={handleSend} disabled={!input.trim()||loading} style={{
              background:"#E8005A", border:"none", borderRadius:10, width:44, height:44,
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              transition:"all 0.15s", flexShrink:0,
              opacity:input.trim()&&!loading?1:0.4,
            }}
              onMouseEnter={e=>e.currentTarget.style.background="#cc004f"}
              onMouseLeave={e=>e.currentTarget.style.background="#E8005A"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize:11, color:"#ccc", marginTop:8, textAlign:"center" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
