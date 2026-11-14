export default function Rule({ variant = "single", label, className = "" }) {
  if (variant === "labelled") {
    return (
      <div className={`y2k-rule y2k-rule--labelled ${className}`.trim()} role="separator">
        <span className="y2k-rule__label">{label || "SPEC"}</span>
      </div>
    );
  }

  if (variant === "double") {
    return <hr className={`y2k-rule y2k-rule--double ${className}`.trim()} />;
  }

  if (variant === "zigzag") {
    return <hr className={`y2k-rule y2k-rule--zigzag ${className}`.trim()} aria-hidden="true" />;
  }

  return <hr className={`y2k-rule ${className}`.trim()} />;
}
