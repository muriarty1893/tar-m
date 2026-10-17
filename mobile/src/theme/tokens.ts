/** Raw colour values, mirrored from src/global.css, for places that cannot take a class. */
export const COLORS = {
  background: '#ffffff',
  surface: '#f4faf5',
  foreground: '#14532d',
  primary: '#15803d',
  primaryForeground: '#ffffff',
  secondary: '#dcfce7',
  muted: '#e8f0f1',
  mutedForeground: '#475569',
  gold: '#a16207',
  goldSoft: '#fef3c7',
  destructive: '#b91c1c',
  border: '#bbf7d0',
  white: '#ffffff',
  black: '#000000',
  sun: '#fde047',
  sky300: '#7dd3fc',
  sky200: '#bae6fd',
  sky500: '#0ea5e9',
  sky600: '#0284c7',
} as const;

export type ColorName = keyof typeof COLORS;

/** The demo's two shadows ("soft" and "lift"). */
export const SHADOW = {
  soft: '0px 10px 30px -14px rgba(21, 128, 61, 0.35)',
  lift: '0px 24px 48px -20px rgba(21, 128, 61, 0.45)',
} as const;

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
