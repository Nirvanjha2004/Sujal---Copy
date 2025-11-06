/**
 * Design System Tokens
 * 
 * This file exports design tokens for programmatic access in components.
 * These values should match the CSS custom properties defined in index.css
 */

export const colors = {
  // Primary Colors
  primary: 'hsl(221.2 83.2% 53.3%)',
  primaryForeground: 'hsl(210 40% 98%)',
  primaryMuted: 'hsl(221.2 83.2% 53.3% / 0.1)',

  // Secondary Colors
  secondary: 'hsl(210 40% 96%)',
  secondaryForeground: 'hsl(222.2 84% 4.9%)',

  // Accent Colors
  accent: 'hsl(210 40% 96%)',
  accentForeground: 'hsl(222.2 84% 4.9%)',

  // Neutral Colors
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(222.2 84% 4.9%)',
  muted: 'hsl(210 40% 96%)',
  mutedForeground: 'hsl(215.4 16.3% 46.9%)',

  // Border and Dividers
  border: 'hsl(214.3 31.8% 91.4%)',
  input: 'hsl(214.3 31.8% 91.4%)',
  ring: 'hsl(221.2 83.2% 53.3%)',

  // Card Colors
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(222.2 84% 4.9%)',

  // Popover Colors
  popover: 'hsl(0 0% 100%)',
  popoverForeground: 'hsl(222.2 84% 4.9%)',

  // Status Colors
  success: 'hsl(142.1 76.2% 36.3%)',
  warning: 'hsl(47.9 95.8% 53.1%)',
  destructive: 'hsl(0 84.2% 60.2%)',
  info: 'hsl(204 94% 94%)',
} as const;

export const typography = {
  fontFamily: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const;

export const borderRadius = {
  sm: '0.375rem',  // 6px
  default: '0.5rem', // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  transforms: {
    hover: {
      lift: 'translateY(-2px)',
      liftSubtle: 'translateY(-1px)',
      scale: 'scale(1.02)',
      scaleSubtle: 'scale(1.01)',
    },
    press: {
      scale: 'scale(0.98)',
      scaleSubtle: 'scale(0.99)',
    },
  },
} as const;

// CSS Custom Property References (for use with CSS-in-JS)
export const cssVars = {
  colors: {
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    primaryMuted: 'var(--primary-muted)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',
    popover: 'var(--popover)',
    popoverForeground: 'var(--popover-foreground)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    destructive: 'var(--destructive)',
    info: 'var(--info)',
  },
  spacing: {
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
    10: 'var(--space-10)',
    12: 'var(--space-12)',
    16: 'var(--space-16)',
    20: 'var(--space-20)',
  },
  borderRadius: {
    sm: 'var(--radius-sm)',
    default: 'var(--radius)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    default: 'var(--shadow)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  typography: {
    fontHeading: 'var(--font-heading)',
    fontBody: 'var(--font-body)',
    fontMono: 'var(--font-mono)',
    textXs: 'var(--text-xs)',
    textSm: 'var(--text-sm)',
    textBase: 'var(--text-base)',
    textLg: 'var(--text-lg)',
    textXl: 'var(--text-xl)',
    text2xl: 'var(--text-2xl)',
    text3xl: 'var(--text-3xl)',
    text4xl: 'var(--text-4xl)',
    fontNormal: 'var(--font-normal)',
    fontMedium: 'var(--font-medium)',
    fontSemibold: 'var(--font-semibold)',
    fontBold: 'var(--font-bold)',
  },
} as const;

// Utility functions for responsive design
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

// Type definitions for better TypeScript support
export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
export type BreakpointKey = keyof typeof breakpoints;