/**
 * Card with hard offset shadow.
 * @param {string} [band] - accent palette key for optional header band
 * @param {boolean} [featured] - halftone gradient + cream text
 */
export default function Card({
  children,
  band,
  featured = false,
  title,
  className = "",
  as: Tag = "div",
  ...rest
}) {
  return (
    <Tag
      className={`gh-card ${featured ? "gh-card--featured" : ""} ${className}`}
      {...rest}
    >
      {band && !featured && (
        <div className={`gh-card__band gh-card__band--${band}`} aria-hidden="true" />
      )}
      {title && <div className="gh-card__title">{title}</div>}
      <div className="gh-card__body">{children}</div>
    </Tag>
  );
}
