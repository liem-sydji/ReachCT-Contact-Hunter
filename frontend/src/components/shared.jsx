import { useNavigate } from "react-router-dom";
import { ReachCTLogo, ArrowLeftIcon } from "./icons.jsx";

// ─── INNER PAGE HEADER ────────────────────────────────────────────────────────
export function InnerHeader({ title }) {
  const navigate = useNavigate();
  return (
    <header className="inner-header">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <ArrowLeftIcon size={16} /> Back
      </button>
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
  if (!data.length) {
    return (
      <div className="gh-state gh-state--empty">
        <h3 className="gh-state__title">No results found</h3>
        <p className="gh-state__msg">Try another search or adjust your filters.</p>
      </div>
    );
  }
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
              <td style={{ color: "var(--sand)", fontSize: 12 }}>{i + 1}</td>
              <td style={{ fontWeight: 500, color: "var(--ink)" }}>{r.name || <span className="no-data">—</span>}</td>
              <td className={r.email ? "email-cell" : ""}>{r.email || <span className="no-data">—</span>}</td>
              <td>{r.phone || <span className="no-data">—</span>}</td>
              <td>{r.website
                ? <a href={r.website} target="_blank" rel="noreferrer" style={{ color: "#5a524c", fontSize: 12 }}>{r.website.replace(/https?:\/\/(www\.)?/, "").slice(0, 30)}</a>
                : <span className="no-data">—</span>}</td>
              <td style={{ fontSize: 12, color: "#5a524c" }}>{[r.city, r.country].filter(Boolean).join(", ") || <span className="no-data">—</span>}</td>
              <td style={{ fontSize: 12, color: "#6b625a" }}>{r.company_type || <span className="no-data">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
