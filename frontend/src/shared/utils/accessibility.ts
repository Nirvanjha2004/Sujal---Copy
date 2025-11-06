/**
 * Accessibility utilities and helpers
 */

// ARIA role constants
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary',
  SEARCH: 'search',
  FORM: 'form',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  LOG: 'log',
  MARQUEE: 'marquee',
  TIMER: 'timer',
  TABLIST: 'tablist',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  MENU: 'menu',
  MENUBAR: 'menubar',
  MENUITEM: 'menuitem',
  MENUITEMCHECKBOX: 'menuitemcheckbox',
  MENUITEMRADIO: 'menuitemradio',
  LISTBOX: 'listbox',
  OPTION: 'option',
  COMBOBOX: 'combobox',
  TREE: 'tree',
  TREEITEM: 'treeitem',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  ROWGROUP: 'rowgroup',
  COLUMNHEADER: 'columnheader',
  ROWHEADER: 'rowheader',
  TABLE: 'table',
  CAPTION: 'caption',
  PRESENTATION: 'presentation',
  NONE: 'none'
} as const;

// ARIA properties
export const ARIA_PROPS = {
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  EXPANDED: 'aria-expanded',
  HIDDEN: 'aria-hidden',
  CURRENT: 'aria-current',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  DISABLED: 'aria-disabled',
  READONLY: 'aria-readonly',
  REQUIRED: 'aria-required',
  INVALID: 'aria-invalid',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  RELEVANT: 'aria-relevant',
  BUSY: 'aria-busy',
  CONTROLS: 'aria-controls',
  OWNS: 'aria-owns',
  ACTIVEDESCENDANT: 'aria-activedescendant',
  HASPOPUP: 'aria-haspopup',
  LEVEL: 'aria-level',
  POSINSET: 'aria-posinset',
  SETSIZE: 'aria-setsize',
  ORIENTATION: 'aria-orientation',
  SORT: 'aria-sort',
  VALUEMIN: 'aria-valuemin',
  VALUEMAX: 'aria-valuemax',
  VALUENOW: 'aria-valuenow',
  VALUETEXT: 'aria-valuetext'
} as const;

// Live region politeness levels
export const LIVE_REGIONS = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive'
} as const;

// Keyboard key constants
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const;

/**
 * Generate a unique ID for accessibility purposes
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create ARIA attributes object
 */
export function createAriaAttributes(attributes: Record<string, any>): Record<string, any> {
  const ariaAttrs: Record<string, any> = {};
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      ariaAttrs[key] = value;
    }
  });
  
  return ariaAttrs;
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

/**
 * Trap focus within a container (useful for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === KEYS.TAB) {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Focus the first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Convert colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  // Calculate relative luminance
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  // Calculate contrast ratio
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if contrast meets WCAG AA standards
 */
export function meetsWCAGAA(color1: string, color2: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standards
 */
export function meetsWCAGAAA(color1: string, color2: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Create keyboard navigation handler
 */
export function createKeyboardNavigation(
  elements: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    onActivate?: (element: HTMLElement, index: number) => void;
  } = {}
) {
  const { loop = true, orientation = 'both', onActivate } = options;
  let currentIndex = 0;
  
  const handleKeyDown = (event: KeyboardEvent) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case KEYS.ARROW_DOWN:
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop ? (currentIndex + 1) % elements.length : Math.min(currentIndex + 1, elements.length - 1);
        }
        break;
        
      case KEYS.ARROW_UP:
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop ? (currentIndex - 1 + elements.length) % elements.length : Math.max(currentIndex - 1, 0);
        }
        break;
        
      case KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop ? (currentIndex + 1) % elements.length : Math.min(currentIndex + 1, elements.length - 1);
        }
        break;
        
      case KEYS.ARROW_LEFT:
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop ? (currentIndex - 1 + elements.length) % elements.length : Math.max(currentIndex - 1, 0);
        }
        break;
        
      case KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
        
      case KEYS.END:
        event.preventDefault();
        newIndex = elements.length - 1;
        break;
        
      case KEYS.ENTER:
      case KEYS.SPACE:
        event.preventDefault();
        onActivate?.(elements[currentIndex], currentIndex);
        break;
    }
    
    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      elements[currentIndex]?.focus();
    }
  };
  
  // Set initial focus
  elements[0]?.focus();
  
  // Add event listeners
  elements.forEach(element => {
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('focus', () => {
      currentIndex = elements.indexOf(element);
    });
  });
  
  // Return cleanup function
  return () => {
    elements.forEach(element => {
      element.removeEventListener('keydown', handleKeyDown);
    });
  };
}

/**
 * Manage focus restoration
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;
  
  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }
  
  restoreFocus(): void {
    if (this.previousFocus && document.contains(this.previousFocus)) {
      this.previousFocus.focus();
    }
  }
  
  setFocus(element: HTMLElement): void {
    element.focus();
  }
}

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(
  trigger: HTMLElement,
  tooltip: HTMLElement,
  options: {
    delay?: number;
    hideOnEscape?: boolean;
  } = {}
): () => void {
  const { delay = 500, hideOnEscape = true } = options;
  const tooltipId = generateId('tooltip');
  
  tooltip.id = tooltipId;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');
  
  trigger.setAttribute('aria-describedby', tooltipId);
  
  let showTimeout: NodeJS.Timeout;
  let hideTimeout: NodeJS.Timeout;
  
  const show = () => {
    clearTimeout(hideTimeout);
    showTimeout = setTimeout(() => {
      tooltip.setAttribute('aria-hidden', 'false');
      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = '1';
    }, delay);
  };
  
  const hide = () => {
    clearTimeout(showTimeout);
    hideTimeout = setTimeout(() => {
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    }, 100);
  };
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (hideOnEscape && event.key === KEYS.ESCAPE) {
      hide();
    }
  };
  
  // Event listeners
  trigger.addEventListener('mouseenter', show);
  trigger.addEventListener('mouseleave', hide);
  trigger.addEventListener('focus', show);
  trigger.addEventListener('blur', hide);
  document.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    trigger.removeEventListener('mouseenter', show);
    trigger.removeEventListener('mouseleave', hide);
    trigger.removeEventListener('focus', show);
    trigger.removeEventListener('blur', hide);
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get user's preferred color scheme
 */
export function getPreferredColorScheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}