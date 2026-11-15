export default function BracketLabel({ children, className = "" }) {
  const text = typeof children === "string" ? children : String(children ?? "");
  return (
    <span className={`y2k-bracket ${className}`.trim()}>
      [ {text} ]
    </span>
  );
}
