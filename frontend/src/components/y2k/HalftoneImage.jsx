export default function HalftoneImage({
  src,
  alt = "",
  duotone = "cobalt",
  torn = false,
  className = "",
  style,
}) {
  return (
    <div
      className={`y2k-ht-img ${torn ? "y2k-ht-img--torn" : ""} ${className}`.trim()}
      style={style}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: 160,
            background: "var(--fog)",
          }}
          aria-hidden="true"
        />
      )}
      <div
        className={`y2k-ht-img__duotone y2k-ht-img__duotone--${duotone}`}
        aria-hidden="true"
      />
      <div className="y2k-ht-img__dots" aria-hidden="true" />
    </div>
  );
}
