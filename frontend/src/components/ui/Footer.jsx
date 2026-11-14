import { Link } from "react-router-dom";
import HalftoneSurface from "./HalftoneSurface.jsx";
import Ribbon from "./Ribbon.jsx";
import { Sparkle } from "./Decorations.jsx";

export default function Footer({
  headline = "Keep the contacts growing.",
  links = [
    { to: "/", label: "Home" },
    { to: "/info", label: "How it works" },
    { to: "/style-guide", label: "Style guide" },
  ],
  className = "",
}) {
  return (
    <footer className={`gh-footer ${className}`}>
      <HalftoneSurface className="gh-footer__surface" dotSize={5} intensity={0.38}>
        <div className="gh-footer__inner">
          <h2 className="gh-footer__headline">
            {headline} <Sparkle size={28} color="var(--marigold)" />
          </h2>
          <nav className="gh-footer__links" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="gh-footer__link">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="gh-footer__ribbon" aria-hidden="true">
            <Ribbon preset="gentle" height={72} thickness={8} />
          </div>
        </div>
      </HalftoneSurface>
    </footer>
  );
}
