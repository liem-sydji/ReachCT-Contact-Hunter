/** Creative addition: sticker-style rotated badge. */
export default function StickerBadge({ children = "LIMITED RUN", className = "" }) {
  return (
    <span className={`y2k-sticker ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  );
}
