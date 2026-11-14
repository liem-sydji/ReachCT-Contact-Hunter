import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReachCTLogo } from "../icons.jsx";
import Button from "./Button.jsx";

/**
 * Night navbar: logo left, links center, pill actions right.
 * Sticky; blurred ink background after scroll.
 * Backward-compatible: existing InnerHeader stays; this is additive.
 */
export default function Navbar({
  links = [],
  actions,
  title,
  showBack = false,
  className = "",
}) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`gh-nav ${scrolled ? "gh-nav--scrolled" : ""} ${className}`}>
      <div className="gh-nav__inner">
        <div className="gh-nav__left">
          {showBack && (
            <button type="button" className="gh-nav__back" onClick={() => navigate("/")}>
              ← Back
            </button>
          )}
          <Link to="/" className="gh-nav__logo">
            <ReachCTLogo size={22} />
            <span className="gh-nav__brand">
              Reach<span className="gh-accent-word">CT</span>
            </span>
          </Link>
          {title && (
            <>
              <span className="gh-nav__divider" aria-hidden="true" />
              <span className="gh-nav__title">{title}</span>
            </>
          )}
        </div>

        {links.length > 0 && (
          <nav className="gh-nav__links" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="gh-nav__link">
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="gh-nav__actions">
          {actions || (
            <Button variant="ghost-on-dark" onClick={() => navigate("/style-guide")}>
              Style guide
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
