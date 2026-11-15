import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { InnerHeader } from "../components/shared.jsx";
import { PageTransition, PaperHeatmapField } from "../components/ui/index.js";
import ReachAIBug from "../components/ReachAIBug.jsx";

const SUGGESTIONS = [
  "Search for 25 Marketing Agencies in Madrid, Spain and save to my database",
  "How many companies do I have in total?",
  "Pull all IT companies from Germany and show me the ones with emails",
  "What countries have the most companies in the database?",
  "Create a database called 'Barcelona Leads' and pull all companies from Barcelona into it",
];

function MessageBubble({ msg, bugMood = "idle" }) {
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
        <div style={{ flexShrink:0, marginRight:10, marginTop:2 }}>
          <ReachAIBug mood={bugMood} size={40} />
        </div>
      )}
      <div style={{
        maxWidth:"70%", padding:"12px 16px", borderRadius: isUser?"16px 16px 4px 16px":"16px 16px 16px 4px",
        background: isUser?"var(--coral)":"var(--cream)",
        color: isUser?"#fff":"var(--ink)",
        fontSize:14, lineHeight:1.6, fontFamily:"var(--font-body)",
        whiteSpace:"pre-wrap", wordBreak:"break-word",
        border: isUser ? "none" : "var(--border-chunky)",
        boxShadow: isUser ? "none" : "3px 3px 0 rgba(45,43,44,0.35)",
      }}>
        {parts.map((part, i) => {
          if (part.match(/\/?dashboard\/db\/\d+/)) {
            const href = part.startsWith("/") ? part : "/" + part;
            return (
              <a key={i} href={href} style={{ color: isUser?"#ffe0ec":"var(--coral)",
                textDecoration:"underline", fontWeight:600 }}>
                {href}
              </a>
            );
          }
          return part;
        })}
      </div>
      {isUser && (
        <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--ink)",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, marginLeft:10, marginTop:2, fontSize:14, color:"var(--cream)",
          border:"2px solid var(--cream)" }}>
          👤
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <ReachAIBug mood="thinking" size={40} />
      <div style={{ background:"var(--cream)", borderRadius:"16px 16px 16px 4px", padding:"12px 16px",
        display:"flex", gap:4, alignItems:"center",
        border:"var(--border-chunky)", boxShadow:"3px 3px 0 rgba(45,43,44,0.35)" }}>
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
  const [celebrate, setCelebrate] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const celebrateTimer = useRef(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [display, loading, celebrate]);

  useEffect(() => () => {
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
  }, []);

  const startCelebrate = () => {
    setCelebrate(true);
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    celebrateTimer.current = setTimeout(() => setCelebrate(false), 2800);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(""); setError(""); setCelebrate(false);

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
      startCelebrate();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestion = (s) => { setInput(s); textareaRef.current?.focus(); };

  const clearChat = () => {
    setMessages([]); setDisplay([]); setError(""); setCelebrate(false);
  };

  const lastAssistantIdx = (() => {
    for (let i = display.length - 1; i >= 0; i--) {
      if (display[i].role === "assistant") return i;
    }
    return -1;
  })();

  return (
    <PageTransition>
    <div className="inner-page" style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <InnerHeader title="ReachAI" />

      {/* Chat area */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 0" }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px" }}>

          {/* Empty state */}
          {display.length === 0 && (
            <div className="reachai-empty">
              <PaperHeatmapField />
              <div className="reachai-empty__content">
                <div className="reachai-empty__mark" aria-hidden="true">
                  <ReachAIBug mood="idle" size={72} />
                </div>
                <h2 className="reachai-empty__title">ReachAI</h2>
                <p className="reachai-empty__sub">
                  Your AI assistant for ReachCT. Search companies, manage your databases, and get insights — just by asking.
                </p>
                <div className="reachai-empty__grid">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`reachai-suggest${i === 4 ? " reachai-suggest--wide" : ""}`}
                      onClick={() => handleSuggestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {display.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              bugMood={
                msg.role === "assistant" && i === lastAssistantIdx && celebrate
                  ? "happy"
                  : "idle"
              }
            />
          ))}
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
      <div style={{ background:"var(--cream-light)", borderTop:"1px solid var(--sand)", padding:"16px 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          {display.length > 0 && (
            <button onClick={clearChat} style={{ fontSize:12, color:"#bbb", background:"none",
              border:"none", cursor:"pointer", fontFamily:"var(--font-body)",
              marginBottom:8, padding:0 }}
              onMouseEnter={e=>e.target.style.color="#666"} onMouseLeave={e=>e.target.style.color="#bbb"}>
              Clear conversation
            </button>
          )}
          <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
            <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Ask ReachAI anything… e.g. 'Search 25 IT companies in Berlin and save to my Tech Leads database'"
              rows={2} style={{ flex:1, padding:"12px 16px", border:"1.5px solid var(--sand)",
                borderRadius:12, fontSize:14, fontFamily:"var(--font-body)",
                color:"var(--ink)", outline:"none", resize:"none", lineHeight:1.5,
                transition:"border-color 0.15s" }}
              onFocus={e=>e.target.style.borderColor="var(--coral)"}
              onBlur={e=>e.target.style.borderColor="#e8e8e8"} />
            <button onClick={handleSend} disabled={!input.trim()||loading} style={{
              background:"var(--coral)", border:"none", borderRadius:10, width:44, height:44,
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              transition:"all 0.15s", flexShrink:0,
              opacity:input.trim()&&!loading?1:0.4,
            }}
              onMouseEnter={e=>e.currentTarget.style.background="var(--hot-pink)"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--coral)"}>
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
    </PageTransition>
  );
}
