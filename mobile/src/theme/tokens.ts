/** Raw colour values, mirrored from src/global.css, for places that cannot take a class. */
export const COLORS = {
  background: '#f7f0e3',
  foreground: '#3b2a1e',
  card: '#efe4cf',
  popover: '#fbf6ec',
  primary: '#3b2a1e',
  primaryForeground: '#f7f0e3',
  secondary: '#e6d8bd',
  muted: '#e9dec9',
  mutedForeground: '#6e5e4e',
  accent: '#c0643b',
  accentForeground: '#fff8ee',
  border: '#dccdb0',
  olive: '#6b7a3a',
  amber: '#d98e2b',
  brick: '#b3361f',
  sand: '#a08262',
  wheat: '#c9b79a',
  white: '#ffffff',
} as const;

export type ColorName = keyof typeof COLORS;
