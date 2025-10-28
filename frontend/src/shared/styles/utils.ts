/**
 * Style Utilities
 * 
 * Common utility functions and class combinations for the design system
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common component style combinations
 */
export const componentStyles = {
  // Card variants
  card: {
    base: 'card',
    elevated: 'card shadow-lg',
    interactive: 'card hover:shadow-md cursor-pointer',
    bordered: 'card border-2',
  },

  // Button variants
  button: {
    base: 'btn',
    primary: 'btn bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'btn bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'btn border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'btn hover:bg-accent hover:text-accent-foreground',
    destructive: 'btn bg-destructive text-destructive-foreground hover:bg-destructive/90',
    
    // Sizes
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  },

  // Input variants
  input: {
    base: 'input',
    error: 'input border-destructive focus:border-destructive',
    success: 'input border-success focus:border-success',
  },

  // Text variants
  text: {
    heading: 'font-heading font-semibold text-foreground',
    body: 'font-body text-foreground',
    muted: 'text-muted-foreground',
    small: 'text-sm text-muted-foreground',
    large: 'text-lg font-semibold',
    
    // Status colors
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    info: 'text-info',
  },

  // Layout utilities
  layout: {
    container: 'container mx-auto px-4 sm:px-6',
    section: 'py-12 sm:py-16 lg:py-20',
    grid: 'grid-responsive',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
  },

  // Dashboard specific
  dashboard: {
    layout: 'dashboard-layout',
    header: 'dashboard-header',
    sidebar: 'dashboard-sidebar',
    main: 'dashboard-main',
    card: 'card p-6',
    statsCard: 'card p-6 hover:shadow-md transition-shadow',
  },

  // Animation classes
  animation: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
  },
} as const;

/**
 * Responsive utility functions
 */
export const responsive = {
  /**
   * Generate responsive classes for different breakpoints
   */
  classes: (base: string, variants: Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string>>) => {
    const classes = [base];
    
    Object.entries(variants).forEach(([breakpoint, className]) => {
      if (className) {
        classes.push(`${breakpoint}:${className}`);
      }
    });
    
    return classes.join(' ');
  },

  /**
   * Generate responsive grid classes
   */
  grid: (cols: Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', number>>) => {
    const classes = [];
    
    if (cols.base) classes.push(`grid-cols-${cols.base}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return `grid gap-4 ${classes.join(' ')}`;
  },

  /**
   * Generate responsive spacing classes
   */
  spacing: (property: 'p' | 'm' | 'px' | 'py' | 'pt' | 'pb' | 'pl' | 'pr' | 'mx' | 'my' | 'mt' | 'mb' | 'ml' | 'mr', 
           values: Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', number>>) => {
    const classes = [];
    
    if (values.base) classes.push(`${property}-${values.base}`);
    if (values.sm) classes.push(`sm:${property}-${values.sm}`);
    if (values.md) classes.push(`md:${property}-${values.md}`);
    if (values.lg) classes.push(`lg:${property}-${values.lg}`);
    if (values.xl) classes.push(`xl:${property}-${values.xl}`);
    if (values['2xl']) classes.push(`2xl:${property}-${values['2xl']}`);
    
    return classes.join(' ');
  },
};

/**
 * Status-based styling utilities
 */
export const statusStyles = {
  success: {
    text: 'text-success',
    bg: 'bg-success/10 text-success',
    border: 'border-success',
    button: 'bg-success text-white hover:bg-success/90',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning/10 text-warning',
    border: 'border-warning',
    button: 'bg-warning text-white hover:bg-warning/90',
  },
  error: {
    text: 'text-destructive',
    bg: 'bg-destructive/10 text-destructive',
    border: 'border-destructive',
    button: 'bg-destructive text-white hover:bg-destructive/90',
  },
  info: {
    text: 'text-info',
    bg: 'bg-info/10 text-info',
    border: 'border-info',
    button: 'bg-info text-white hover:bg-info/90',
  },
};

/**
 * Focus and interaction utilities
 */
export const focusStyles = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  within: 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
};

/**
 * Transition utilities
 */
export const transitionStyles = {
  all: 'transition-all duration-200 ease-smooth',
  colors: 'transition-colors duration-200 ease-smooth',
  transform: 'transition-transform duration-200 ease-smooth',
  opacity: 'transition-opacity duration-200 ease-smooth',
  shadow: 'transition-shadow duration-200 ease-smooth',
};

/**
 * Common component size variants
 */
export const sizeVariants = {
  button: {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg',
  },
  input: {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  },
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
};

/**
 * Utility to create consistent hover effects
 */
export const hoverEffects = {
  lift: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
  glow: 'hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-200',
  scale: 'hover:scale-105 transition-transform duration-200',
  fade: 'hover:opacity-80 transition-opacity duration-200',
};

/**
 * Loading state utilities
 */
export const loadingStyles = {
  skeleton: 'animate-pulse bg-muted rounded',
  spinner: 'animate-spin rounded-full border-2 border-muted border-t-primary',
  overlay: 'absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center',
};