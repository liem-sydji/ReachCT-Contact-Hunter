import { useState } from "react";
import { Link } from "react-router-dom";
import PillLabel from "./PillLabel.jsx";
import Rule from "./Rule.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({
  logoLabel = "ReachCT",
  centerLabel = "STYLE GUIDE",
  year = "26 / 2026",
  links = [],
  theme,
  onThemeChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="y2k-nav">
      <div className="y2k-nav__bar">
        <Link to="/" className="y2k-nav__logo">
          Reach<span>CT</span>
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
            {logoLabel}
          </span>
        </Link>

        <div className="y2k-nav__center">
          <PillLabel>{centerLabel}</PillLabel>
        </div>

        <div className="y2k-nav__actions">
          <span className="y2k-nav__year" aria-hidden="true">
            {year}
          </span>
          {onThemeChange && (
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          )}
        </div>

        <button
          type="button"
          className="y2k-nav__menu-btn"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          MENU
        </button>
      </div>
      <Rule variant="double" />

      {open && (
        <div className="y2k-nav__overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="y2k-nav__close"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
          {onThemeChange && (
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          )}
          {(links.length
            ? links
            : [
                { to: "/style-guide-y2k", label: "Style guide" },
                { to: "/", label: "Home" },
              ]
          ).map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className="y2k-nav__link"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </header>
  );
}
