export default function PillLabel({
  children,
  filled = false,
  tone = "ink",
  className = "",
  as: Tag = "span",
}) {
  const toneClass =
    filled && tone === "pink"
      ? "y2k-pill--pink"
      : filled && tone === "orange"
        ? "y2k-pill--orange"
        : filled
          ? "y2k-pill--filled"
          : "";

  return (
    <Tag className={`y2k-pill ${toneClass} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
