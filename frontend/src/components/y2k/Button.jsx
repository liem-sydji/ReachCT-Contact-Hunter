export default function Button({
  children,
  variant = "solid",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  const variantClass =
    variant === "plasma" ? "y2k-btn--plasma" : `y2k-btn--${variant}`;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`y2k-btn ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
