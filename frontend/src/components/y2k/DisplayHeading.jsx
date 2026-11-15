export default function DisplayHeading({
  children,
  size = "lg",
  bleed = false,
  outline = false,
  cut = false,
  cutTone = "paper",
  cutImage,
  pink = false,
  plasma = false,
  as: Tag = "h1",
  className = "",
  style,
}) {
  const classes = [
    "y2k-display",
    `y2k-display--${size}`,
    bleed ? "y2k-display--bleed" : "",
    outline ? "y2k-display--outline" : "",
    cut ? "y2k-display--cut" : "",
    pink ? "y2k-display--pink" : "",
    plasma ? "y2k-display--plasma" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cutClass = [
    "y2k-display__cut",
    cutTone === "ink" ? "y2k-display__cut--ink" : "",
    cutTone === "pink" ? "y2k-display__cut--pink" : "",
    cutImage ? "y2k-display__cut--img" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} style={style}>
      {children}
      {cut && (
        <span
          className={cutClass}
          aria-hidden="true"
          style={cutImage ? { backgroundImage: `url(${cutImage})` } : undefined}
        />
      )}
    </Tag>
  );
}
