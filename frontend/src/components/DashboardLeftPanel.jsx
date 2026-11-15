import { ReachCTLogo, DatabaseIcon, MailIcon, TemplateIcon } from "./icons.jsx";

const NAV = [
  { key: "databases", label: "Databases", Icon: DatabaseIcon },
  { key: "campaigns", label: "Mail Campaigns", Icon: MailIcon },
  { key: "templates", label: "Email Templates", Icon: TemplateIcon },
];

/**
 * Shared app sidebar for Dashboard / Spreadsheet / Campaigns / Templates.
 * Visual-only Groovy Halftone chrome; onNav keys: "/" | "databases" | "campaigns" | "templates".
 */
export default function DashboardLeftPanel({ user, activePage = "databases", onNav }) {
  return (
    <aside className="dash-panel">
      <button type="button" className="dash-panel__brand" onClick={() => onNav("/")}>
        <ReachCTLogo size={22} />
        <span className="dash-panel__brand-title">
          Reach<span>CT</span>
        </span>
      </button>

      <div className="dash-panel__body">
        <div className="dash-panel__user">
          {user?.picture ? (
            <img
              src={user.picture}
              alt=""
              referrerPolicy="no-referrer"
              className="dash-panel__avatar"
            />
          ) : (
            <div className="dash-panel__avatar dash-panel__avatar--fallback">
              {(user?.name || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="dash-panel__user-text">
            <div className="dash-panel__user-name">{user?.name || "User"}</div>
            <div className="dash-panel__user-email">{user?.email}</div>
          </div>
        </div>

        <nav className="dash-panel__nav" aria-label="Workspace">
          {NAV.map(({ key, label, Icon }) => {
            const active = activePage === key;
            return (
              <button
                key={key}
                type="button"
                className={`dash-panel__nav-btn${active ? " is-active" : ""}`}
                onClick={() => onNav(key)}
                aria-current={active ? "page" : undefined}
              >
                <span className="dash-panel__nav-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
