/** Raw colour values, mirrored from src/global.css, for places that cannot take a class. */
export const COLORS = {
  background: '#f8fafc',
  surface: '#f1f5f9',
  foreground: '#0f172a',
  primary: '#047857',
  primaryForeground: '#ffffff',
  secondary: '#d1fae5',
  muted: '#f1f5f9',
  mutedForeground: '#475569',
  gold: '#a16207',
  goldSoft: '#fef3c7',
  destructive: '#b91c1c',
  border: '#e2e8f0',
  card: '#ffffff',
  white: '#ffffff',
  black: '#000000',
  sun: '#fde047',
  sky300: '#7dd3fc',
  sky200: '#bae6fd',
  sky500: '#0ea5e9',
  sky600: '#0284c7',
  emerald300: '#6ee7b7',
  emerald400: '#34d399',
} as const;

export type ColorName = keyof typeof COLORS;

/** A soft slate shadow for cards, and a deeper green one for the weather card. */
export const SHADOW = {
  soft: '0px 8px 24px -14px rgba(15, 23, 42, 0.22)',
  lift: '0px 22px 40px -20px rgba(6, 78, 59, 0.55)',
} as const;

/** The weather card's dark green, top left to bottom right. */
export const FIELD_CARD_GRADIENT = ['#047857', '#065f46', '#0b3b30', '#0f2a2a'] as const;

/**
 * The bright tiles of the quick menu (and the week's rows): a pale fill, a matching border and a
 * saturated square behind a white icon. The label beside it is always dark text, so the colour only helps.
 */
export const TILE_TONES = {
  emerald: { bg: '#ecfdf5', line: '#a7f3d0', solid: '#059669', ink: '#047857' },
  sky: { bg: '#f0f9ff', line: '#bae6fd', solid: '#0ea5e9', ink: '#0369a1' },
  indigo: { bg: '#eef2ff', line: '#c7d2fe', solid: '#4f46e5', ink: '#4338ca' },
  amber: { bg: '#fffbeb', line: '#fde68a', solid: '#f59e0b', ink: '#92400e' },
  teal: { bg: '#f0fdfa', line: '#99f6e4', solid: '#0d9488', ink: '#0f766e' },
  purple: { bg: '#faf5ff', line: '#e9d5ff', solid: '#9333ea', ink: '#7e22ce' },
  orange: { bg: '#fff7ed', line: '#fed7aa', solid: '#f97316', ink: '#c2410c' },
  rose: { bg: '#fff1f2', line: '#fecdd3', solid: '#e11d48', ink: '#be123c' },
} as const;

export type TileTone = keyof typeof TILE_TONES;

/** Farm-task kinds: icon tile background, icon colour and the dot under a calendar day (Tailwind's palette, as on the website). */
export const KIND_COLORS = {
  analiz: { tile: '#e0f2fe', icon: '#075985', dot: '#0284c7' },
  toprak: { tile: '#fef3c7', icon: '#78350f', dot: '#b45309' },
  gubre: { tile: '#dcfce7', icon: '#15803d', dot: '#15803d' },
  ilac: { tile: '#ede9fe', icon: '#5b21b6', dot: '#7c3aed' },
  ekim: { tile: '#fef3c7', icon: '#a16207', dot: '#a16207' },
  sulama: { tile: '#dbeafe', icon: '#1e40af', dot: '#2563eb' },
  hasat: { tile: '#ffedd5', icon: '#7c2d12', dot: '#ea580c' },
  uyari: { tile: '#fee2e2', icon: '#b91c1c', dot: '#b91c1c' },
} as const;

/** Tints for people's initials (avatars), from the same Tailwind palette. */
export const AVATAR_TONES = [
  { bg: '#dcfce7', fg: '#15803d' },
  { bg: '#fef3c7', fg: '#a16207' },
  { bg: '#e0f2fe', fg: '#075985' },
  { bg: '#ede9fe', fg: '#5b21b6' },
  { bg: '#ffedd5', fg: '#9a3412' },
] as const;
