import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReachCTLogo, SearchIcon, DatabaseIcon, DashboardIcon } from "../components/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PageTransition, SparkleField, LandingWaveField } from "../components/ui/index.js";

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout, loginDev } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);

  async function signIn() {
    if (!import.meta.env.DEV) {
      navigate("/login");
      return;
    }
    setError(null);
    setSigningIn(true);
    try {
      await loginDev();
    } catch (err) {
      setError(err.message || "Login failed — please try again.");
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <PageTransition>
      <div className="landing">
        <LandingWaveField />
        <SparkleField count={8} className="gh-hero__stars" />

        {user ? (
          <div className="landing-user-chip">
            {user.picture
              ? <img src={user.picture} alt="" referrerPolicy="no-referrer" className="landing-user-chip__avatar" />
              : <div className="landing-user-chip__fallback">
                  {(user.name || "?")[0].toUpperCase()}
                </div>
            }
            <span className="landing-user-chip__name">{user.name || user.email}</span>
            <button type="button" className="landing-user-chip__out" onClick={logout}>Sign out</button>
          </div>
        ) : (
          <button className="landing-signin-btn" onClick={signIn} disabled={signingIn}>
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
        )}
        {error && <div className="auth-error">{error}</div>}

        <div className="landing-logo">
          <ReachCTLogo size={44} />
          <span className="landing-title">Reach<span>CT</span></span>
        </div>
        <p className="landing-tagline">B2B Contact Intelligence — Find companies, extract emails, close deals.</p>

        <div className="landing-cards">
          <div className="landing-card" onClick={() => navigate("/search")}>
            <div className="card-icon"><SearchIcon size={28} /></div>
            <div>
              <div className="card-title">Start New Search</div>
              <div className="card-desc">Scrape Google Maps for company contacts in any city</div>
            </div>
          </div>
          <div className="landing-card" onClick={() => navigate("/database")}>
            <div className="card-icon"><DatabaseIcon size={28} /></div>
            <div>
              <div className="card-title">Push / Pull Database</div>
              <div className="card-desc">Query, export, or upload contacts to the shared database</div>
            </div>
          </div>
          {user && (
            <div className="landing-card" onClick={() => navigate("/dashboard")}>
              <div className="card-icon"><DashboardIcon size={28} /></div>
              <div>
                <div className="card-title">My Dashboard</div>
                <div className="card-desc">Your personal databases and saved contact lists</div>
              </div>
            </div>
          )}
          {user && (
            <div className="landing-card landing-card--featured" onClick={() => navigate("/ai")}>
              <div className="card-icon card-icon--ai"><span aria-hidden="true">✦</span></div>
              <div>
                <div className="card-title">Ask ReachAI</div>
                <div className="card-desc">Search, manage databases and get insights by just asking</div>
              </div>
            </div>
          )}
        </div>

        <button className="landing-info-link" onClick={() => navigate("/info")}>
          How to use ReachCT?
        </button>
      </div>
    </PageTransition>
  );
}
