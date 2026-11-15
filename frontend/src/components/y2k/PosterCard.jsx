import HalftoneImage from "./HalftoneImage.jsx";
import PlasmaWash from "./PlasmaWash.jsx";

export default function PosterCard({
  header = "UNIT 01",
  pinkHeader = false,
  imageSrc,
  imageAlt = "",
  duotone = "cobalt",
  torn = false,
  plasma = false,
  meta = ["REF 01", "HALFTONE", "A3"],
  children,
  className = "",
}) {
  return (
    <article className={`y2k-poster ${className}`.trim()}>
      <header
        className={`y2k-poster__header ${
          plasma || pinkHeader ? "y2k-poster__header--plasma" : ""
        }`.trim()}
      >
        {header}
      </header>
      <div className="y2k-poster__media">
        {children ||
          (plasma ? (
            <div style={{ position: "relative", height: "100%", minHeight: 160 }}>
              <PlasmaWash intensity="punch" position="40% 55%" />
            </div>
          ) : (
            <HalftoneImage
              src={imageSrc}
              alt={imageAlt}
              duotone={duotone}
              torn={torn}
              style={{ height: "100%", border: 0 }}
            />
          ))}
      </div>
      <footer className="y2k-poster__footer">
        {meta.map((item) => (
          <div key={item} className="y2k-poster__meta">
            {item}
          </div>
        ))}
      </footer>
    </article>
  );
}
