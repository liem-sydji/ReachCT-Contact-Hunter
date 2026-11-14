/** Creative addition: mono caps marquee. */
export default function MonoTicker({
  text = "PRINT POSTER × Y2K FUTURE  ·  GRAIN  ·  CHROME  ·  HALFTONE  ·  SPEC SHEET  ·  ",
  className = "",
}) {
  const loop = `${text} ${text}`;
  return (
    <div className={`y2k-ticker ${className}`.trim()} aria-hidden="true">
      <div className="y2k-ticker__track">
        <span>{loop}</span>
        <span>{loop}</span>
      </div>
    </div>
  );
}
