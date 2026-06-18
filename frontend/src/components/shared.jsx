import { useNavigate } from "react-router-dom";
import { ReachCTLogo, ArrowLeftIcon } from "./icons.jsx";

// ─── INNER PAGE HEADER ────────────────────────────────────────────────────────
export function InnerHeader({ title }) {
  const navigate = useNavigate();
  return (
    <header className="inner-header">
      <button className="back-btn" onClick={() => navigate("/")}><ArrowLeftIcon /> Back</button>
      <div className="inner-header-divider" />
      <div className="inner-header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <ReachCTLogo size={22} />Reach<span>CT</span>
      </div>
      <div className="inner-header-divider" />
      <span className="inner-header-title">{title}</span>
    </header>
  );
}

// ─── RESULTS TABLE ────────────────────────────────────────────────────────────
export function ResultsTable({ data }) {
  if (!data.length) return (
    <div style={{ textAlign: "center", padding: "48px", color: "#999", fontSize: 14 }}>
      No results found.
    </div>
  );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Company Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Location</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td style={{ color: "#bbb", fontSize: 12 }}>{i + 1}</td>
              <td style={{ fontWeight: 500, color: "#111" }}>{r.name || <span className="no-data">—</span>}</td>
              <td className={r.email ? "email-cell" : ""}>{r.email || <span className="no-data">—</span>}</td>
              <td>{r.phone || <span className="no-data">—</span>}</td>
              <td>{r.website
                ? <a href={r.website} target="_blank" rel="noreferrer" style={{ color: "#666", fontSize: 12 }}>{r.website.replace(/https?:\/\/(www\.)?/, "").slice(0, 30)}</a>
                : <span className="no-data">—</span>}</td>
              <td style={{ fontSize: 12, color: "#666" }}>{[r.city, r.country].filter(Boolean).join(", ") || <span className="no-data">—</span>}</td>
              <td style={{ fontSize: 12, color: "#888" }}>{r.company_type || <span className="no-data">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
