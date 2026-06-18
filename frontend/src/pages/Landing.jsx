import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ReachCTLogo, SearchIcon, DatabaseIcon } from "../components/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

export default function Landing() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="landing">
      {/* Auth — top right */}
      {user ? (
        <div style={{ position:"absolute", top:20, right:24, display:"flex", alignItems:"center",
          gap:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:50, padding:"6px 16px 6px 6px", backdropFilter:"blur(10px)" }}>
          {user.picture
            ? <img src={user.picture} alt="" referrerPolicy="no-referrer"
                style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover" }} />
            : <div style={{ width:28, height:28, borderRadius:"50%", background:"#E8005A",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, color:"#fff" }}>
                {(user.name||"?")[0].toUpperCase()}
              </div>
          }
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)", fontWeight:500,
            maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user.name||user.email}
          </span>
          <button onClick={logout} style={{ background:"none", border:"none",
            color:"rgba(255,255,255,0.35)", fontSize:12, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", padding:"0 0 0 4px",
            transition:"color 0.15s" }}
            onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.75)"}
            onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}>
            Sign out
          </button>
        </div>
      ) : (
        <button className="landing-signin-btn" onClick={()=>navigate("/login")}>Sign in</button>
      )}

      <div className="landing-logo">
        <ReachCTLogo size={44} />
        <span className="landing-title">Reach<span>CT</span></span>
      </div>
      <p className="landing-tagline">B2B Contact Intelligence — Find companies, extract emails, close deals.</p>

      <div className="landing-cards">
        <div className="landing-card" onClick={()=>navigate("/search")}>
          <div className="card-icon"><SearchIcon /></div>
          <div>
            <div className="card-title">Start New Search</div>
            <div className="card-desc">Scrape Google Maps for company contacts in any city</div>
          </div>
        </div>
        <div className="landing-card" onClick={()=>navigate("/database")}>
          <div className="card-icon"><DatabaseIcon /></div>
          <div>
            <div className="card-title">Push / Pull Database</div>
            <div className="card-desc">Query, export, or upload contacts to the shared database</div>
          </div>
        </div>
        {user && (
          <div className="landing-card" onClick={()=>navigate("/dashboard")}>
            <div className="card-icon"><DashboardIcon /></div>
            <div>
              <div className="card-title">My Dashboard</div>
              <div className="card-desc">Your personal databases and saved contact lists</div>
            </div>
          </div>
        )}
        {user && (
          <div className="landing-card" onClick={()=>navigate("/ai")} style={{ borderColor:"rgba(232,0,90,0.2)" }}>
            <div className="card-icon" style={{ background:"linear-gradient(135deg,rgba(232,0,90,0.15),rgba(232,0,90,0.05))" }}>
              <span style={{ fontSize:18 }}>✦</span>
            </div>
            <div>
              <div className="card-title">Ask ReachAI</div>
              <div className="card-desc">Search, manage databases and get insights by just asking</div>
            </div>
          </div>
        )}
      </div>

      <button className="landing-info-link" onClick={()=>navigate("/info")}>
        How to use ReachCT?
      </button>
    </div>
  );
}