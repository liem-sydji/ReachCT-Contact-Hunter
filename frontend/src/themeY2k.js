/** Print poster × Y2K design tokens — mirror of CSS custom properties in y2kStyles.js. */
export const y2kPalette = {
  paper: "#EDEAE2",
  cream: "#EEE6CF",
  fog: "#D6D7DB",
  ink: "#2E2F3D",
  inkDeep: "#0A0F1F",
  inkVoid: "#05070F",
};

export const y2kTokens = {
  paper: y2kPalette.paper,
  cream: y2kPalette.cream,
  fog: y2kPalette.fog,
  ink: y2kPalette.ink,
  inkDeep: y2kPalette.inkDeep,
  pink: "#E12963",
  pinkDeep: "#C21E55",
  orange: "#E85018",
  cobalt: "#1B4C95",
  mint: "#A4D7CE",
  ringCoral: "#F96346",
  ringPink: "#F94E60",
  ringYellow: "#F9CB53",
  chrome: "linear-gradient(105deg, #FFFFFF 0%, #B9C0C9 28%, #5D6670 52%, #F4F6F8 76%, #8A929C 100%)",
};

/** Semantic surfaces when `data-theme="dark"` on `.y2k-root`. Accents stay; cobalt/mint lift for AA on ink-deep. */
export const y2kTokensDark = {
  paper: y2kPalette.inkDeep,
  cream: "#12182A",
  fog: "#1A2238",
  ink: y2kPalette.paper,
  inkDeep: y2kPalette.inkVoid,
  pink: y2kTokens.pink,
  pinkDeep: y2kTokens.pinkDeep,
  orange: y2kTokens.orange,
  cobalt: "#6B9AE8",
  mint: "#B8E6DD",
  ringCoral: y2kTokens.ringCoral,
  ringPink: y2kTokens.ringPink,
  ringYellow: y2kTokens.ringYellow,
  chrome: y2kTokens.chrome,
};

export const y2kFonts = {
  display: "'Unbounded', system-ui, sans-serif",
  condensed: "'Anton', Impact, sans-serif",
  stencil: "'Big Shoulders Stencil Display', Impact, sans-serif",
  mono: "'Space Mono', ui-monospace, monospace",
  body: "'DM Sans', system-ui, sans-serif",
};

const THEME_KEY = "reachct-y2k-theme";

export function getPreferredY2kTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.sessionStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function persistY2kTheme(theme) {
  try {
    window.sessionStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}
