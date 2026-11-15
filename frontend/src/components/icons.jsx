/**
 * Sticker icons — thick ink outline + hard offset shadow.
 * Inspired by retro OS desktop icons; fills use Groovy Halftone tokens.
 * Existing export names kept for backward compatibility.
 */

const ink = "var(--ink, #2D2B2C)";
const cream = "var(--cream, #F6EBD9)";
const creamLight = "var(--cream-light, #FAF4E7)";
const coral = "var(--coral, #EE685E)";
const marigold = "var(--marigold, #FCC56D)";
const lavender = "var(--lavender, #B7A6E8)";
const periwinkle = "var(--periwinkle, #7F7BD6)";
const hotPink = "var(--hot-pink, #D63391)";
const peach = "var(--peach, #F7A77C)";

function StickerShell({
  children,
  size = 24,
  viewBox = "0 0 40 40",
  className = "",
  title,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      className={`gh-icon ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      {children}
    </svg>
  );
}

// ─── App icons (existing API) ─────────────────────────────────────────────────

export const SearchIcon = ({ size = 18 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    {/* globe — lavender with grid */}
    <circle cx="18" cy="17" r="11" fill={ink} transform="translate(2.5 2.5)" />
    <circle cx="18" cy="17" r="11" fill={lavender} stroke={ink} strokeWidth="2.5" />
    <ellipse cx="18" cy="17" rx="5" ry="11" fill="none" stroke={ink} strokeWidth="2" />
    <path d="M7 17h22M8.5 11.5h19M8.5 22.5h19" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    {/* cursor accent */}
    <path
      d="M28 26 L28 36 L31.2 33.2 L33.5 38 L36 36.8 L33.6 32 L38 32 Z"
      fill={creamLight}
      stroke={ink}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </StickerShell>
);

export const DatabaseIcon = ({ size = 18 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    {/* yellow folder */}
    <path
      d="M6 14h10l3 3h15v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14z"
      fill={ink}
      transform="translate(2.5 2.5)"
    />
    <path
      d="M6 14h10l3 3h15v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14z"
      fill={marigold}
      stroke={ink}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M6 14V12a2 2 0 0 1 2-2h7l2 2" fill={marigold} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="12" y="18" width="10" height="12" rx="1" fill={creamLight} stroke={ink} strokeWidth="2" />
    <rect x="16" y="16" width="10" height="12" rx="1" fill={cream} stroke={ink} strokeWidth="2" />
  </StickerShell>
);

export const DownloadIcon = ({ size = 15 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    {/* floppy — coral/magenta */}
    <rect x="8" y="6" width="22" height="26" rx="3" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="8" y="6" width="22" height="26" rx="3" fill={coral} stroke={ink} strokeWidth="2.5" />
    <rect x="12" y="6" width="14" height="9" rx="1" fill={ink} />
    <rect x="14" y="7.5" width="6" height="6" rx="0.5" fill={creamLight} stroke={ink} strokeWidth="1.5" />
    <rect x="11" y="20" width="16" height="9" rx="1.5" fill={creamLight} stroke={ink} strokeWidth="2" />
  </StickerShell>
);

export const CopyIcon = ({ size = 15 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    {/* stacked docs */}
    <rect x="12" y="10" width="18" height="22" rx="2" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="8" y="7" width="18" height="22" rx="2" fill={creamLight} stroke={ink} strokeWidth="2.5" />
    <path d="M22 7v6h6" fill={cream} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="14" y="12" width="18" height="22" rx="2" fill={cream} stroke={ink} strokeWidth="2.5" />
    <path d="M28 12v6h6" fill={creamLight} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M18 20h10M18 24h10M18 28h7" stroke={ink} strokeWidth="2" strokeLinecap="round" />
  </StickerShell>
);

export const ArrowLeftIcon = ({ size = 16 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    <path
      d="M22 10 L10 20 L22 30 V24 H30 V16 H22 Z"
      fill={ink}
      transform="translate(2.5 2.5)"
    />
    <path
      d="M22 10 L10 20 L22 30 V24 H30 V16 H22 Z"
      fill={peach}
      stroke={ink}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </StickerShell>
);

export const StopIcon = ({ size = 15 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    <rect x="9" y="9" width="20" height="20" rx="4" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="9" y="9" width="20" height="20" rx="4" fill={hotPink} stroke={ink} strokeWidth="2.5" />
    <rect x="14" y="14" width="10" height="10" rx="1.5" fill={creamLight} stroke={ink} strokeWidth="2" />
  </StickerShell>
);

/**
 * Brand target: coral reticle (center + ring + cardinal ticks),
 * with scalloped cloud-outline strokes instead of hard circles.
 */
export const ReachCTLogo = ({ size = 36 }) => (
  <StickerShell size={size} viewBox="0 0 48 48" title="ReachCT">
    <g
      fill="none"
      stroke={coral}
      strokeWidth="3.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cloud-scalloped ring — puffy outline in place of a hard circle */}
      <path d="M24 11c2.4-2.2 5.8-1.8 7.6.4 2.8-.2 5.2 1.8 5.6 4.6 2.4 1.4 2.8 4.6 1.2 6.8 1.6 2.2 1.2 5.4-1.2 6.8-.4 2.8-2.8 4.8-5.6 4.6-1.8 2.2-5.2 2.6-7.6.4-2.4 2.2-5.8 1.8-7.6-.4-2.8.2-5.2-1.8-5.6-4.6-2.4-1.4-2.8-4.6-1.2-6.8C8.6 17.8 9 14.6 11.4 13.2c.4-2.8 2.8-4.8 5.6-4.6C18.8 9.2 21.6 8.8 24 11z" />
      {/* Cardinal ticks as tiny cloud outlines crossing the ring */}
      <path d="M24 5.2c-1.1.2-1.8 1-1.7 2 .8.4 1.2 1.2 1.7 1.2s.9-.8 1.7-1.2c.1-1-.6-1.8-1.7-2z M22.6 9.2c.4.9.9 1.5 1.4 1.5s1-.6 1.4-1.5" />
      <path d="M42.8 24c-.2 1.1-1 1.8-2 1.7-.4-.8-1.2-1.2-1.2-1.7s.8-.9 1.2-1.7c1 .1 1.8.6 2 1.7z M38.8 22.6c-.9.4-1.5.9-1.5 1.4s.6 1 1.5 1.4" />
      <path d="M24 42.8c1.1-.2 1.8-1 1.7-2-.8-.4-1.2-1.2-1.7-1.2s-.9.8-1.7 1.2c-.1 1 .6 1.8 1.7 2z M25.4 38.8c-.4-.9-.9-1.5-1.4-1.5s-1 .6-1.4 1.5" />
      <path d="M5.2 24c.2-1.1 1-1.8 2-1.7.4.8 1.2 1.2 1.2 1.7s-.8.9-1.2 1.7c-1-.1-1.8-.6-2-1.7z M9.2 25.4c.9-.4 1.5-.9 1.5-1.4s-.6-1-1.5-1.4" />
    </g>
    <circle cx="24" cy="24" r="4.35" fill={coral} />
  </StickerShell>
);

// ─── Extra sticker set (style-guide + future surfaces) ────────────────────────

export const FloppyIcon = ({ size = 40 }) => (
  <StickerShell size={size} viewBox="0 0 48 48">
    <rect x="8" y="6" width="28" height="32" rx="3" fill={ink} transform="translate(3 3)" />
    <rect x="8" y="6" width="28" height="32" rx="3" fill={hotPink} stroke={ink} strokeWidth="2.75" />
    <rect x="13" y="6" width="18" height="11" rx="1" fill={ink} />
    <rect x="16" y="8" width="7" height="7" rx="1" fill={creamLight} stroke={ink} strokeWidth="1.75" />
    <rect x="12" y="24" width="20" height="11" rx="2" fill={creamLight} stroke={ink} strokeWidth="2.25" />
  </StickerShell>
);

export const FolderIcon = ({ size = 40 }) => (
  <StickerShell size={size} viewBox="0 0 48 48">
    <path
      d="M6 16h12l3.5 3.5H40v18a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V16z"
      fill={ink}
      transform="translate(3 3)"
    />
    <path
      d="M6 16h12l3.5 3.5H40v18a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V16z"
      fill={marigold}
      stroke={ink}
      strokeWidth="2.75"
      strokeLinejoin="round"
    />
    <path d="M6 16v-3a2.5 2.5 0 0 1 2.5-2.5H18l2.5 2.5" fill={marigold} stroke={ink} strokeWidth="2.75" strokeLinejoin="round" />
    <rect x="16" y="22" width="12" height="14" rx="1" fill={creamLight} stroke={ink} strokeWidth="2" />
    <rect x="20" y="20" width="12" height="14" rx="1" fill={cream} stroke={ink} strokeWidth="2" />
  </StickerShell>
);

export const DocsIcon = ({ size = 40 }) => (
  <StickerShell size={size} viewBox="0 0 48 48">
    <rect x="14" y="10" width="22" height="28" rx="2.5" fill={ink} transform="translate(3 3)" />
    <rect x="8" y="7" width="22" height="28" rx="2.5" fill={creamLight} stroke={ink} strokeWidth="2.75" />
    <path d="M24 7v8h8" fill={cream} stroke={ink} strokeWidth="2.75" strokeLinejoin="round" />
    <rect x="16" y="12" width="22" height="28" rx="2.5" fill={cream} stroke={ink} strokeWidth="2.75" />
    <path d="M32 12v8h8" fill={creamLight} stroke={ink} strokeWidth="2.75" strokeLinejoin="round" />
    <path d="M21 22h12M21 27h12M21 32h8" stroke={ink} strokeWidth="2.25" strokeLinecap="round" />
  </StickerShell>
);

export const GlobeIcon = ({ size = 40 }) => (
  <StickerShell size={size} viewBox="0 0 48 48">
    <circle cx="22" cy="22" r="15" fill={ink} transform="translate(3 3)" />
    <circle cx="22" cy="22" r="15" fill={lavender} stroke={ink} strokeWidth="2.75" />
    <ellipse cx="22" cy="22" rx="7" ry="15" fill="none" stroke={ink} strokeWidth="2.25" />
    <path d="M7 22h30M9 14h26M9 30h26" stroke={ink} strokeWidth="2.25" strokeLinecap="round" />
  </StickerShell>
);

export const MusicTileIcon = ({ size = 40 }) => (
  <StickerShell size={size} viewBox="0 0 48 48">
    <rect x="8" y="8" width="28" height="28" rx="6" fill={ink} transform="translate(3 3)" />
    <rect x="8" y="8" width="28" height="28" rx="6" fill={creamLight} stroke={ink} strokeWidth="2.75" />
    <rect x="14" y="14" width="16" height="16" rx="3" fill={periwinkle} stroke={ink} strokeWidth="2.5" />
    <path
      d="M20 28V18l8-1.5V26"
      fill="none"
      stroke={ink}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="18.5" cy="28" r="2.5" fill={ink} />
    <circle cx="26.5" cy="26" r="2.5" fill={ink} />
  </StickerShell>
);

export const HeartExeIcon = ({ size = 48 }) => (
  <StickerShell size={size} viewBox="0 0 48 56">
    <rect x="10" y="4" width="24" height="30" rx="2.5" fill={ink} transform="translate(3 3)" />
    <rect x="10" y="4" width="24" height="30" rx="2.5" fill={creamLight} stroke={ink} strokeWidth="2.75" />
    <path d="M28 4v7h7" fill={cream} stroke={ink} strokeWidth="2.75" strokeLinejoin="round" />
    <path
      d="M22 24c-3.2-2.8-5-4.6-5-6.6 0-1.7 1.3-3 3-3 1.1 0 2.1.5 2.7 1.4.6-.9 1.6-1.4 2.7-1.4 1.7 0 3 1.3 3 3 0 2-1.8 3.8-5 6.6z"
      fill={hotPink}
      stroke={ink}
      strokeWidth="2.25"
      strokeLinejoin="round"
    />
    <rect x="14" y="40" width="20" height="10" rx="2" fill={creamLight} stroke={ink} strokeWidth="2.5" />
    <text
      x="24"
      y="47.5"
      textAnchor="middle"
      fontFamily="var(--font-body, Poppins, sans-serif)"
      fontSize="7"
      fontWeight="700"
      fill={ink}
    >
      .EXE
    </text>
  </StickerShell>
);

export const CursorIcon = ({ size = 36 }) => (
  <StickerShell size={size} viewBox="0 0 40 44">
    <path
      d="M8 6 L8 34 L15 28 L20 40 L26 37 L21 25 L32 25 Z"
      fill={ink}
      transform="translate(2.5 2.5)"
    />
    <path
      d="M8 6 L8 34 L15 28 L20 40 L26 37 L21 25 L32 25 Z"
      fill={creamLight}
      stroke={ink}
      strokeWidth="2.75"
      strokeLinejoin="round"
    />
  </StickerShell>
);

export const PaperclipBuddyIcon = ({ size = 40 }) => (
  <StickerShell size={size} viewBox="0 0 48 48">
    <path
      d="M18 10c-4 0-7 3-7 7v14c0 5 4 9 9 9s9-4 9-9V18c0-2.8-2.2-5-5-5s-5 2.2-5 5v12c0 1.1.9 2 2 2s2-.9 2-2V20"
      fill="none"
      stroke={ink}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 10c-4 0-7 3-7 7v14c0 5 4 9 9 9s9-4 9-9V18c0-2.8-2.2-5-5-5s-5 2.2-5 5v12c0 1.1.9 2 2 2s2-.9 2-2V20"
      fill="none"
      stroke={creamLight}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="16" r="2.2" fill={ink} />
    <circle cx="26" cy="16" r="2.2" fill={ink} />
    <path d="M18.5 13.2c.6-.7 1.3-1 2-1M24.5 13.2c.6-.7 1.3-1 2-1" stroke={ink} strokeWidth="1.75" strokeLinecap="round" />
  </StickerShell>
);

export const DashboardIcon = ({ size = 18 }) => (
  <StickerShell size={size} viewBox="0 0 40 40">
    <rect x="6" y="6" width="12" height="12" rx="2.5" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="6" y="6" width="12" height="12" rx="2.5" fill={periwinkle} stroke={ink} strokeWidth="2.5" />
    <rect x="20" y="6" width="12" height="12" rx="2.5" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="20" y="6" width="12" height="12" rx="2.5" fill={marigold} stroke={ink} strokeWidth="2.5" />
    <rect x="6" y="20" width="12" height="12" rx="2.5" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="6" y="20" width="12" height="12" rx="2.5" fill={coral} stroke={ink} strokeWidth="2.5" />
    <rect x="20" y="20" width="12" height="12" rx="2.5" fill={ink} transform="translate(2.5 2.5)" />
    <rect x="20" y="20" width="12" height="12" rx="2.5" fill={lavender} stroke={ink} strokeWidth="2.5" />
  </StickerShell>
);
