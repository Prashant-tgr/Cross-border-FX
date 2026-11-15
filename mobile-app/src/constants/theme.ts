// ─────────────────────────────────────────────────────────────────
// Design Tokens
// Replaces Tailwind CSS — single source of truth for all styling
// ─────────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: '#020617',          // slate-950
  surface: '#0f172a',     // slate-900
  surfaceMid: '#1e293b',  // slate-800
  border: '#1e293b',      // slate-800
  borderLight: '#334155', // slate-700

  // Text
  text: '#f1f5f9',        // slate-100
  textMuted: '#94a3b8',   // slate-400
  textDim: '#64748b',     // slate-500
  textFaint: '#475569',   // slate-600

  // Brand
  emerald: '#10b981',
  emeraldLight: '#34d399',
  emeraldDark: '#059669',
  emeraldBg: 'rgba(16,185,129,0.1)',
  emeraldBorder: 'rgba(16,185,129,0.3)',

  // Admin / danger
  purple: '#a855f7',
  purpleLight: '#c084fc',
  purpleBg: 'rgba(168,85,247,0.15)',
  purpleBorder: 'rgba(168,85,247,0.3)',

  // Alerts
  rose: '#f43f5e',
  roseBg: 'rgba(244,63,94,0.1)',
  roseBorder: 'rgba(244,63,94,0.3)',

  // Info / rail types
  cyan: '#06b6d4',
  cyanBg: 'rgba(6,182,212,0.1)',
  amber: '#f59e0b',
  amberBg: 'rgba(245,158,11,0.1)',
  amberBorder: 'rgba(245,158,11,0.2)',
  yellow: '#eab308',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
};

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
