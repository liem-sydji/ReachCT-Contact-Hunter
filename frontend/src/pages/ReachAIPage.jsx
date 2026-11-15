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

const EMPTY_SUGGESTIONS = SUGGESTIONS.slice(0, 3);

function MessageBubble({ msg, bugMood = "idle" }) {
  const isUser = msg.role === "user";
  const text   = typeof msg.content === "string" ? msg.content
    : Array.isArray(msg.content) ? msg.content.filter(b => b.type === "text").map(b => b.text).join(" ")
    : "";
  if (!text) return null;

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

function Composer({
  input,
  setInput,
  onSend,
  onKeyDown,
  loading,
  textareaRef,
  hint = true,
}) {
  return (
    <div className="reachai-composer">
      <div className="reachai-composer__row">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask ReachAI anything…"
          rows={2}
          className="reachai-composer__input"
        />
        <button
          type="button"
          className="reachai-composer__send"
          onClick={onSend}
          disabled={!input.trim() || loading}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
          </svg>
        </button>
      </div>
      {hint && (
        <p className="reachai-composer__hint">Press Enter to send · Shift+Enter for new line</p>
      )}
    </div>
  );
}

export default function ReachAIPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [display,  setDisplay]  = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const celebrateTimer = useRef(null);

  const isEmpty = display.length === 0;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    if (!isEmpty) bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [display, loading, celebrate, isEmpty]);

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

  const handleSuggestion = (s) => {
    setInput(s);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

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
      <div className={`inner-page reachai-page${isEmpty ? " reachai-page--empty" : ""}`}>
        {isEmpty && <PaperHeatmapField className="reachai-page__heat" />}

        <InnerHeader title="ReachAI" />

        {isEmpty ? (
          <div className="reachai-home">
            <div className="reachai-home__mark" aria-hidden="true">
              <ReachAIBug mood="idle" size={88} />
            </div>
            <h1 className="reachai-home__title">ReachAI</h1>
            <p className="reachai-home__sub">
              Search companies, manage databases, and get insights — just by asking.
            </p>

            <div className="reachai-home__composer">
              <Composer
                input={input}
                setInput={setInput}
                onSend={handleSend}
                onKeyDown={handleKeyDown}
                loading={loading}
                textareaRef={textareaRef}
              />
            </div>

            <div className="reachai-home__suggestions">
              {EMPTY_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="reachai-suggest"
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="reachai-chat">
              <div className="reachai-chat__inner">
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
                  <div className="reachai-error">{error}</div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="reachai-dock">
              <div className="reachai-dock__inner">
                <button type="button" className="reachai-dock__clear" onClick={clearChat}>
                  Clear conversation
                </button>
                <Composer
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  onKeyDown={handleKeyDown}
                  loading={loading}
                  textareaRef={textareaRef}
                />
              </div>
            </div>
          </>
        )}

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
