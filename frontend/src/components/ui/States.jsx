import { Sparkle } from "./Decorations.jsx";

/** Sand skeleton with soft shimmer. */
export function Skeleton({ width = "100%", height = 16, className = "", style }) {
  return (
    <div
      className={`gh-skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

/** Sparkle-shaped spinner for loading. */
export function Spinner({ size = 40, label = "Loading" }) {
  return (
    <div className="gh-spinner" role="status" aria-label={label}>
      <Sparkle size={size} color="var(--coral)" className="gh-spinner__sparkle" />
      <Sparkle size={size * 0.55} color="var(--marigold)" className="gh-spinner__sparkle gh-spinner__sparkle--inner" />
    </div>
  );
}

export function LoadingState({ message = "Loading…" }) {
  return (
    <div className="gh-state gh-state--loading">
      <Spinner />
      <p className="gh-state__msg">{message}</p>
      <div className="gh-skeleton-stack">
        <Skeleton height={14} width="70%" />
        <Skeleton height={14} width="55%" />
        <Skeleton height={14} width="62%" />
      </div>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "Try another search or add something new." }) {
  return (
    <div className="gh-state gh-state--empty">
      <Sparkle size={36} color="var(--periwinkle)" />
      <h3 className="gh-state__title">{title}</h3>
      <p className="gh-state__msg">{message}</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message = "Please try again." }) {
  return (
    <div className="gh-state gh-state--error" role="alert">
      <div className="gh-state__error-mark" aria-hidden="true">!</div>
      <h3 className="gh-state__title">{title}</h3>
      <p className="gh-state__msg">{message}</p>
    </div>
  );
}
