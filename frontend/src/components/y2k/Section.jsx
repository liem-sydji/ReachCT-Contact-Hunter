import PlasmaWash from "./PlasmaWash.jsx";
import VerticalRail from "./VerticalRail.jsx";

export default function Section({
  children,
  tone = "paper",
  number,
  rail,
  railSide = "left",
  className = "",
  id,
}) {
  const isPlasma = tone === "plasma";

  return (
    <section
      id={id}
      className={`y2k-section y2k-section--${tone} ${className}`.trim()}
    >
      {isPlasma && <PlasmaWash intensity="full" veil position="center" />}
      {number != null && (
        <div className="y2k-section__num" aria-hidden="true">
          {String(number).padStart(2, "0")}
        </div>
      )}
      {rail && <VerticalRail side={railSide}>{rail}</VerticalRail>}
      {children}
    </section>
  );
}
