/**
 * Groovy Halftone pill button.
 * Variants: primary | secondary | ghost-on-dark | halftone | danger
 * Existing call sites can keep className="btn-primary" — this is additive.
 */
export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`gh-btn gh-btn--${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
