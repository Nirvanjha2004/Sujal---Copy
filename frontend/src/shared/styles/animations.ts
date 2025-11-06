/**
 * Animation Utilities
 * 
 * Provides utility functions and classes for consistent animations across the platform
 */

import { animations } from './designTokens';

// Animation class generators
export const createHoverEffect = (type: 'lift' | 'scale' | 'glow' | 'border' = 'lift') => {
  const baseClasses = 'transition-all duration-200 ease-smooth';
  
  switch (type) {
    case 'lift':
      return `${baseClasses} hover-lift`;
    case 'scale':
      return `${baseClasses} hover-scale`;
    case 'glow':
      return `${baseClasses} hover-glow`;
    case 'border':
      return `${baseClasses} hover-border`;
    default:
      return `${baseClasses} hover-lift`;
  }
};

export const createPressEffect = (subtle = false) => {
  return subtle ? 'press-scale-subtle' : 'press-scale';
};

export const createFocusEffect = () => {
  return 'focus-ring';
};

// Animation timing utilities
export const getAnimationDuration = (speed: 'fast' | 'normal' | 'slow' | 'slower' = 'normal') => {
  return animations.duration[speed];
};

export const getAnimationEasing = (type: keyof typeof animations.easing = 'smooth') => {
  return animations.easing[type];
};

// Stagger animation helper
export const createStaggeredAnimation = (
  children: number,
  delay: number = 100,
  animationClass: string = 'animate-slide-up'
) => {
  return {
    containerClass: 'stagger-children',
    containerStyle: { '--stagger-delay': `${delay}ms` },
    childClass: animationClass,
    getChildStyle: (index: number) => ({ '--stagger-index': index.toString() })
  };
};

// Interactive element class combinations
export const interactiveClasses = {
  // Button-like elements
  button: 'hover-lift press-scale focus-ring',
  buttonSubtle: 'hover-lift-subtle press-scale-subtle focus-ring',
  
  // Card-like elements
  card: 'card-interactive',
  cardSubtle: 'hover-lift-subtle hover-border',
  
  // Navigation items
  navItem: 'nav-item',
  
  // Input elements
  input: 'input-enhanced focus-ring',
  
  // General interactive elements
  interactive: 'hover-scale-subtle press-scale-subtle focus-ring',
} as const;

// Animation state management
export const animationStates = {
  entering: 'animate-fade-in animate-slide-up',
  exiting: 'animate-fade-out animate-slide-down',
  loading: 'animate-pulse-subtle',
  floating: 'animate-float',
  bouncing: 'animate-bounce-in',
} as const;

// CSS-in-JS animation styles
export const animationStyles = {
  hoverLift: {
    transition: `all ${animations.duration.normal} ${animations.easing.smooth}`,
    '&:hover': {
      transform: animations.transforms.hover.lift,
      boxShadow: 'var(--shadow-md)',
    },
  },
  
  hoverScale: {
    transition: `all ${animations.duration.normal} ${animations.easing.smooth}`,
    '&:hover': {
      transform: animations.transforms.hover.scale,
    },
  },
  
  pressScale: {
    transition: `all ${animations.duration.fast} ${animations.easing.smooth}`,
    '&:active': {
      transform: animations.transforms.press.scale,
    },
  },
  
  focusRing: {
    transition: `all ${animations.duration.fast} ${animations.easing.smooth}`,
    '&:focus-visible': {
      outline: '2px solid hsl(var(--ring))',
      outlineOffset: '2px',
      boxShadow: '0 0 0 4px hsl(var(--ring) / 0.1)',
    },
  },
} as const;

// Utility functions for dynamic animations
export const createCustomAnimation = (
  duration: string = animations.duration.normal,
  easing: string = animations.easing.smooth,
  transform?: string,
  additionalProps?: Record<string, string>
) => {
  return {
    transition: `all ${duration} ${easing}`,
    ...(transform && { transform }),
    ...additionalProps,
  };
};

export const createKeyframeAnimation = (
  name: string,
  keyframes: Record<string, Record<string, string>>,
  duration: string = animations.duration.normal,
  easing: string = animations.easing.smooth,
  iterationCount: string = '1'
) => {
  return {
    animation: `${name} ${duration} ${easing} ${iterationCount}`,
    '@keyframes': {
      [name]: keyframes,
    },
  };
};

// Performance optimization utilities
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getOptimizedAnimation = (
  normalAnimation: string,
  reducedAnimation: string = 'transition-none'
) => {
  return shouldReduceMotion() ? reducedAnimation : normalAnimation;
};

// Animation event handlers
export const createAnimationHandlers = () => {
  return {
    onAnimationStart: (callback: () => void) => (e: AnimationEvent) => {
      if (e.target === e.currentTarget) callback();
    },
    onAnimationEnd: (callback: () => void) => (e: AnimationEvent) => {
      if (e.target === e.currentTarget) callback();
    },
    onTransitionEnd: (callback: () => void) => (e: TransitionEvent) => {
      if (e.target === e.currentTarget) callback();
    },
  };
};

export type InteractiveClass = keyof typeof interactiveClasses;
export type AnimationState = keyof typeof animationStates;