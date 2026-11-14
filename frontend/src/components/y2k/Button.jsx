export default function Button({
  children,
  variant = "solid",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`y2k-btn y2k-btn--${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
