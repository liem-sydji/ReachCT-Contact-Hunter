import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";
import { ReachCTLogo } from "../components/icons.jsx";

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [error, setError] = useState(null);

  async function handleSuccess(credentialResponse) {
    try {
      await login(credentialResponse.credential);
      navigate("/");
    } catch {
      setError("Login failed — please try again.");
    }
  }

  return (
    <div className="landing">
      <div className="landing-logo">
        <ReachCTLogo size={44} />
        <span className="landing-title">Reach<span>CT</span></span>
      </div>
      <p className="landing-tagline">Sign in to create your account.</p>

      <div className="auth-card">
        <h2 className="auth-card-title">Welcome</h2>
        <p className="auth-card-sub">Use your Gmail to sign in or create an account.</p>
        <div className="auth-google-btn">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Login failed — please try again.")}
            theme="filled_black"
            size="large"
            width="280"
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
      </div>

      <button className="landing-info-link" style={{ marginTop: 28 }} onClick={() => navigate("/")}>
        Back to home
      </button>
    </div>
  );
}
