import { Link } from "react-router-dom";
import MetaStrip from "./MetaStrip.jsx";

export default function Footer({
  links = [
    { to: "/", label: "Home" },
    { to: "/style-guide-y2k", label: "Style guide" },
  ],
  code = "REACH-Y2K-26",
  year = "2026",
}) {
  return (
    <footer className="y2k-footer">
      <MetaStrip code={code} year={year} />
      <nav className="y2k-footer__links" aria-label="Footer">
        {links.map((l) =>
          l.to ? (
            <Link key={l.label} to={l.to}>
              {l.label}
            </Link>
          ) : (
            <a key={l.label} href={l.href || "#"}>
              {l.label}
            </a>
          )
        )}
      </nav>
    </footer>
  );
}
