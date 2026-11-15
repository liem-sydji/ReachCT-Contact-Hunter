import { useState, useEffect } from "react";
import { API, ADMIN_PASSWORD } from "../styles.js";
import { ReachCTLogo } from "../components/icons.jsx";
import { PageTransition } from "../components/ui/index.js";

export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [password, setPassword] = useState("");
  const [jobs,     setJobs]     = useState([]);
  const [error,    setError]    = useState("");
  const [msg,      setMsg]      = useState("");

  const login = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else setError("Wrong password");
  };

  const fetchJobs = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/jobs`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch { setError("Failed to fetch jobs"); }
  };

  const cancelJob = async (jobId) => {
    try {
      await fetch(`${API}/api/job/${jobId}/cancel`, { method: "POST" });
      setMsg(`Job ${jobId} cancelled`);
      fetchJobs();
    } catch { setError("Failed to cancel job"); }
  };

  const cancelAll = async () => {
    try {
      await fetch(`${API}/api/admin/cancel-all`, { method: "POST" });
      setMsg("All running jobs cancelled");
      fetchJobs();
    } catch { setError("Failed to cancel all"); }
  };

  useEffect(() => {
    if (authed) {
      fetchJobs();
      const interval = setInterval(fetchJobs, 5000);
      return () => clearInterval(interval);
    }
  }, [authed]);

  if (!authed) return (
    <PageTransition>
    <div style={{ minHeight: "100vh", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--ink-soft)", border: "1px solid rgba(246,235,217,0.14)", borderRadius: 16, padding: 40, width: 320, textAlign: "center" }}>
        <ReachCTLogo size={40} />
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", marginTop: 16, marginBottom: 8, fontSize: 20 }}>Admin Access</h2>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>ReachCT Control Panel</p>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(246,235,217,0.18)", background: "var(--ink)", color: "var(--cream)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "var(--coral)", fontSize: 12, marginBottom: 12 }}>{error}</p>}
        <button onClick={login} style={{ width: "100%", background: "var(--coral)", color: "var(--cream)", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
          Login
        </button>
      </div>
    </div>
    </PageTransition>
  );

  const running = jobs.filter(j => ["running", "queued", "starting", "cancelling"].includes(j.status));
  const done    = jobs.filter(j => ["done", "cancelled", "error"].includes(j.status));

  return (
    <PageTransition>
    <div style={{ minHeight: "100vh", background: "var(--ink)", padding: 40 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ReachCTLogo size={32} />
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: 24, margin: 0 }}>ReachCT <span style={{ color: "var(--coral)" }}>Admin</span></h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchJobs} style={{ background: "var(--ink-soft)", color: "var(--cream)", border: "1px solid rgba(246,235,217,0.14)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Refresh
            </button>
            {running.length > 0 && (
              <button onClick={cancelAll} style={{ background: "var(--coral)", color: "var(--cream)", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                Cancel All
              </button>
            )}
          </div>
        </div>

        {msg   && <div style={{ background: "#052e16", border: "1px solid #16a34a", color: "#4ade80", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>{msg}</div>}
        {error && <div style={{ background: "#2d0a0a", border: "1px solid var(--coral)", color: "var(--coral)", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <h3 style={{ color: "var(--cream)", fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Active Jobs ({running.length})
        </h3>

        {running.length === 0 ? (
          <div style={{ background: "var(--ink-soft)", border: "1px solid rgba(246,235,217,0.14)", borderRadius: 12, padding: 24, color: "#666", fontSize: 14, textAlign: "center", marginBottom: 32 }}>
            No active jobs
          </div>
        ) : (
          <div style={{ marginBottom: 32 }}>
            {running.map(job => (
              <div key={job.id} style={{ background: "var(--ink-soft)", border: "1px solid rgba(246,235,217,0.14)", borderRadius: 12, padding: 20, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ background: job.status === "running" ? "#052e16" : "#1c1917", color: job.status === "running" ? "#4ade80" : "#f59e0b", border: `1px solid ${job.status === "running" ? "#16a34a" : "#d97706"}`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                      {job.status.toUpperCase()}
                    </span>
                    <span style={{ color: "var(--cream)", fontSize: 14, fontWeight: 600 }}>{job.query}</span>
                    <span style={{ color: "#666", fontSize: 13 }}>{job.city}, {job.country}</span>
                  </div>
                  <div style={{ color: "#555", fontSize: 12 }}>
                    Job ID: {job.id} · {job.results?.length || 0} results so far
                    {job.total_on_maps ? ` · ${job.total_on_maps} listings on Maps` : ""}
                  </div>
                </div>
                <button onClick={() => cancelJob(job.id)} style={{ background: "none", color: "var(--coral)", border: "1.5px solid var(--coral)", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ color: "var(--cream)", fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Recent Jobs ({done.length})
        </h3>
        <div>
          {done.slice(0, 10).map(job => (
            <div key={job.id} style={{ background: "var(--ink)", border: "1px solid #222", borderRadius: 10, padding: "14px 20px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ background: job.status === "done" ? "#052e16" : "#2d0a0a", color: job.status === "done" ? "#4ade80" : "#f87171", border: `1px solid ${job.status === "done" ? "#16a34a" : "#dc2626"}`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, marginRight: 10 }}>
                  {job.status.toUpperCase()}
                </span>
                <span style={{ color: "#888", fontSize: 13 }}>{job.query} · {job.city}, {job.country}</span>
              </div>
              <span style={{ color: "#555", fontSize: 12 }}>{job.results?.length || 0} results</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
