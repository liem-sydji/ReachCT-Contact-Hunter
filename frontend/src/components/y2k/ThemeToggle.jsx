/** Light / dark toggle for the Y2K root (`data-theme`). */
export default function ThemeToggle({ theme = "light", onChange, className = "" }) {
  const next = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? "Light" : "Dark";

  return (
    <button
      type="button"
      className={`y2k-theme-toggle ${className}`.trim()}
      aria-pressed={theme === "dark"}
      aria-label={`Switch to ${next} mode`}
      onClick={() => onChange?.(next)}
    >
      {label}
    </button>
  );
}
