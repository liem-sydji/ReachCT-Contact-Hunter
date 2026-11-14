import HalftoneImage from "./HalftoneImage.jsx";

export default function PosterCard({
  header = "UNIT 01",
  pinkHeader = false,
  imageSrc,
  imageAlt = "",
  duotone = "cobalt",
  torn = false,
  meta = ["REF 01", "HALFTONE", "A3"],
  children,
  className = "",
}) {
  return (
    <article className={`y2k-poster ${className}`.trim()}>
      <header
        className={`y2k-poster__header ${pinkHeader ? "y2k-poster__header--pink" : ""}`.trim()}
      >
        {header}
      </header>
      <div className="y2k-poster__media">
        {children || (
          <HalftoneImage
            src={imageSrc}
            alt={imageAlt}
            duotone={duotone}
            torn={torn}
            style={{ height: "100%", border: 0 }}
          />
        )}
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
