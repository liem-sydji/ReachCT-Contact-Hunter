import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API } from "../styles.js";
import { ReachCTLogo } from "../components/icons.jsx";

function LeftPanel({ user, onNav, active }) {
  const item = (key, label, icon) => (
    <button
      onClick={() => onNav(key)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: active === key ? "rgba(232,0,90,0.12)" : "none",
        border: active === key ? "1px solid rgba(232,0,90,0.2)" : "1px solid transparent",
        borderRadius: 8, padding: "8px 12px", cursor: "pointer",
        color: active === key ? "#E8005A" : "#888",
        fontSize: 12, fontWeight: active === key ? 600 : 400,
        fontFamily: "'DM Sans',sans-serif", width: "100%", textAlign: "left",
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <aside style={{
      width: 200, minHeight: "100vh", background: "#111", borderRight: "1px solid #1e1e1e",
      display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0,
    }}>
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #1e1e1e", cursor: "pointer" }}
        onClick={() => onNav("/")}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ReachCTLogo size={20} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff" }}>
            Reach<span style={{ color: "#E8005A" }}>CT</span>
          </span>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {user?.picture
            ? <img src={user.picture} alt="" referrerPolicy="no-referrer"
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid #333" }} />
            : <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "#E8005A",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Syne',sans-serif",
              }}>{(user?.name || "?")[0].toUpperCase()}</div>}
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120,
            }}>{user?.name || "User"}</div>
            <div style={{
              fontSize: 10, color: "#555", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120,
            }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {item("databases", "Databases", "🗄️")}
          {item("campaigns", "Mail Campaigns", "📧")}
          {item("templates", "Email Templates", "📝")}
          {item("settings", "Settings", "⚙️")}
        </div>
      </div>
    </aside>
  );
}

function mcpSnippet(apiUrl, apiKey) {
  const key = apiKey || "YOUR_REACHCT_API_KEY";
  return JSON.stringify({
    mcpServers: {
      reachct: {
        command: "python",
        args: ["-m", "reachct_mcp"],
        env: {
          REACHCT_API_URL: apiUrl,
          REACHCT_API_KEY: key,
        },
      },
    },
  }, null, 2);
}

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [plaintext, setPlaintext] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadMeta();
  }, [token]);

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const loadMeta = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/api-key`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load API key");
      const data = await res.json();
      setMeta(data);
      if (!data.has_key) {
        const mint = await fetch(`${API}/api/auth/api-key`, {
          method: "POST",
          headers: authHeaders(),
        });
        const minted = await mint.json();
        setMeta(minted);
        if (minted.api_key) setPlaintext(minted.api_key);
      }
    } catch (e) {
      setError(e.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!confirm("Regenerate API key? Existing MCP configs will stop working until updated.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/api-key/regenerate`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to regenerate key");
      const data = await res.json();
      setMeta(data);
      setPlaintext(data.api_key || "");
    } catch (e) {
      setError(e.message || "Regenerate failed");
    } finally {
      setBusy(false);
    }
  };

  const copyText = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setError("Clipboard copy failed");
    }
  };

  const handleNav = (p) => {
    if (p === "/") navigate("/");
    else if (p === "databases") navigate("/dashboard");
    else if (p === "campaigns") navigate("/campaigns");
    else if (p === "templates") navigate("/templates");
    else if (p === "settings") navigate("/settings");
  };

  const displayKey = plaintext || (meta?.prefix ? `${meta.prefix}${"•".repeat(20)}` : "—");
  const snippet = mcpSnippet(API, plaintext || undefined);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
      <LeftPanel user={user} onNav={handleNav} active="settings" />

      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", maxWidth: 820 }}>
        <h1 style={{
          fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800,
          color: "#fff", letterSpacing: "-0.5px", margin: 0,
        }}>Settings</h1>
        <p style={{ color: "#444", fontSize: 13, marginTop: 4, marginBottom: 28 }}>
          API key for MCP clients (Claude Desktop, ChatGPT, Cursor).
        </p>

        {error && (
          <div style={{
            background: "rgba(232,0,90,0.1)", border: "1px solid rgba(232,0,90,0.35)",
            borderRadius: 10, padding: "10px 14px", color: "#E8005A", fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", border: "3px solid #333",
              borderTopColor: "#E8005A", animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : (
          <>
            <section style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700,
                color: "#fff", marginBottom: 8,
              }}>API key</h2>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 1.5 }}>
                Stored hashed server-side. Plaintext is shown only when minted or regenerated — copy it now.
              </p>

              <div style={{
                display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
                background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16,
              }}>
                <code style={{
                  flex: 1, minWidth: 220, fontSize: 13, color: plaintext ? "#fff" : "#888",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  wordBreak: "break-all",
                }}>{displayKey}</code>
                <button
                  disabled={!plaintext}
                  onClick={() => copyText("key", plaintext)}
                  style={{
                    background: plaintext ? "#E8005A" : "#222", border: "none", borderRadius: 8,
                    padding: "8px 14px", color: "#fff", fontSize: 12, fontWeight: 600,
                    cursor: plaintext ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif",
                    opacity: plaintext ? 1 : 0.5,
                  }}
                >{copied === "key" ? "Copied" : "Copy"}</button>
                <button
                  disabled={busy}
                  onClick={regenerate}
                  style={{
                    background: "none", border: "1px solid #333", borderRadius: 8,
                    padding: "8px 14px", color: "#ccc", fontSize: 12, fontWeight: 600,
                    cursor: busy ? "wait" : "pointer", fontFamily: "'DM Sans',sans-serif",
                  }}
                >{busy ? "…" : "Regenerate"}</button>
              </div>

              {meta?.created_at && (
                <p style={{ fontSize: 11, color: "#555", marginTop: 10 }}>
                  Created {new Date(meta.created_at).toLocaleString()}
                  {meta.last_used_at ? ` · Last used ${new Date(meta.last_used_at).toLocaleString()}` : ""}
                </p>
              )}
              {!plaintext && meta?.has_key && (
                <p style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
                  Full key is hidden. Regenerate to get a new plaintext key.
                </p>
              )}
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700,
                color: "#fff", marginBottom: 8,
              }}>MCP setup</h2>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 1.5 }}>
                Paste into Claude Desktop <code style={{ color: "#aaa" }}>claude_desktop_config.json</code>
                {" "}or any MCP client. Install the package with{" "}
                <code style={{ color: "#aaa" }}>pip install -e packages/reachct-mcp</code>.
              </p>
              <pre style={{
                background: "#111", border: "1px solid #1e1e1e", borderRadius: 12,
                padding: 16, overflow: "auto", fontSize: 12, color: "#ddd",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", lineHeight: 1.45,
              }}>{snippet}</pre>
              <button
                onClick={() => copyText("snippet", snippet)}
                style={{
                  marginTop: 12, background: "none", border: "1px solid #333", borderRadius: 8,
                  padding: "8px 14px", color: "#ccc", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}
              >{copied === "snippet" ? "Copied" : "Copy snippet"}</button>
            </section>

            <section>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                style={{
                  background: "none", border: "1px solid #333", borderRadius: 8,
                  padding: "9px 16px", color: "#888", fontSize: 13,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}
              >Sign out</button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
