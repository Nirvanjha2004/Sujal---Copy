import { useEffect, useRef, useState, useCallback } from 'react';
import {
  generateId,
  trapFocus,
  announceToScreenReader,
  getFocusableElements,
  FocusManager,
  prefersReducedMotion,
  prefersHighContrast,
  getPreferredColorScheme,
  KEYS
} from '../utils/accessibility';

/**
 * Hook for managing focus trapping (useful for modals, dropdowns)
 */
export function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return {
    containerRef,
    activate: () => setIsActive(true),
    deactivate: () => setIsActive(false),
    isActive
  };
}

/**
 * Hook for managing focus restoration
 */
export function useFocusManager() {
  const focusManager = useRef(new FocusManager());

  return {
    saveFocus: useCallback(() => {
      focusManager.current.saveFocus();
    }, []),
    restoreFocus: useCallback(() => {
      focusManager.current.restoreFocus();
    }, []),
    setFocus: useCallback((element: HTMLElement) => {
      focusManager.current.setFocus(element);
    }, [])
  };
}

/**
 * Hook for generating stable IDs for accessibility
 */
export function useId(prefix?: string): string {
  const [id] = useState(() => generateId(prefix));
  return id;
}

/**
 * Hook for managing ARIA attributes
 */
export function useAriaAttributes(initialAttributes: Record<string, any> = {}) {
  const [attributes, setAttributes] = useState(initialAttributes);

  const updateAttribute = useCallback((key: string, value: any) => {
    setAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeAttribute = useCallback((key: string) => {
    setAttributes(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    attributes,
    updateAttribute,
    removeAttribute,
    setAttributes
  };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  options: {
    onEnter?: (element: T, index: number) => void;
    onSpace?: (element: T, index: number) => void;
    onArrowUp?: (element: T, index: number) => void;
    onArrowDown?: (element: T, index: number) => void;
    onArrowLeft?: (element: T, index: number) => void;
    onArrowRight?: (element: T, index: number) => void;
    onHome?: (element: T, index: number) => void;
    onEnd?: (element: T, index: number) => void;
    onEscape?: (element: T, index: number) => void;
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
  } = {}
) {
  const {
    onEnter,
    onSpace,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onEscape,
    loop = true,
    orientation = 'both'
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elements, setElements] = useState<T[]>([]);

  // Update elements when container changes
  useEffect(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current) as T[];
    setElements(focusableElements);
    
    if (focusableElements.length > 0 && currentIndex >= focusableElements.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (elements.length === 0) return;

    const currentElement = elements[currentIndex];
    let newIndex = currentIndex;

    switch (event.key) {
      case KEYS.ENTER:
        event.preventDefault();
        onEnter?.(currentElement, currentIndex);
        break;

      case KEYS.SPACE:
        event.preventDefault();
        onSpace?.(currentElement, currentIndex);
        break;

      case KEYS.ARROW_UP:
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop 
            ? (currentIndex - 1 + elements.length) % elements.length 
            : Math.max(currentIndex - 1, 0);
          onArrowUp?.(elements[newIndex], newIndex);
        }
        break;

      case KEYS.ARROW_DOWN:
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop 
            ? (currentIndex + 1) % elements.length 
            : Math.min(currentIndex + 1, elements.length - 1);
          onArrowDown?.(elements[newIndex], newIndex);
        }
        break;

      case KEYS.ARROW_LEFT:
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop 
            ? (currentIndex - 1 + elements.length) % elements.length 
            : Math.max(currentIndex - 1, 0);
          onArrowLeft?.(elements[newIndex], newIndex);
        }
        break;

      case KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = loop 
            ? (currentIndex + 1) % elements.length 
            : Math.min(currentIndex + 1, elements.length - 1);
          onArrowRight?.(elements[newIndex], newIndex);
        }
        break;

      case KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        onHome?.(elements[newIndex], newIndex);
        break;

      case KEYS.END:
        event.preventDefault();
        newIndex = elements.length - 1;
        onEnd?.(elements[newIndex], newIndex);
        break;

      case KEYS.ESCAPE:
        event.preventDefault();
        onEscape?.(currentElement, currentIndex);
        break;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      elements[newIndex]?.focus();
    }
  }, [elements, currentIndex, loop, orientation, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onHome, onEnd, onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    containerRef,
    currentIndex,
    setCurrentIndex,
    elements
  };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  return { announce };
}

/**
 * Hook for detecting user preferences
 */
export function useUserPreferences() {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());
  const [highContrast, setHighContrast] = useState(prefersHighContrast());
  const [colorScheme, setColorScheme] = useState(getPreferredColorScheme());

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    const handleColorChange = (e: MediaQueryListEvent) => setColorScheme(e.matches ? 'dark' : 'light');

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    colorQuery.addEventListener('change', handleColorChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      colorQuery.removeEventListener('change', handleColorChange);
    };
  }, []);

  return {
    reducedMotion,
    highContrast,
    colorScheme
  };
}

/**
 * Hook for managing live regions
 */
export function useLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
    }
  }, []);

  return { announce };
}

/**
 * Hook for managing modal accessibility
 */
export function useModalAccessibility() {
  const modalRef = useRef<HTMLDivElement>(null);
  const { saveFocus, restoreFocus } = useFocusManager();
  const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap();

  const openModal = useCallback(() => {
    saveFocus();
    activateFocusTrap();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Set focus to modal
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, [saveFocus, activateFocusTrap]);

  const closeModal = useCallback(() => {
    deactivateFocusTrap();
    restoreFocus();
    
    // Restore body scroll
    document.body.style.overflow = '';
  }, [deactivateFocusTrap, restoreFocus]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === KEYS.ESCAPE) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    modalRef,
    openModal,
    closeModal
  };
}

/**
 * Hook for managing tooltip accessibility
 */
export function useTooltipAccessibility() {
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLElement>(null);
  const tooltipId = useId('tooltip');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    
    if (!trigger || !tooltip) return;

    // Set up ARIA attributes
    tooltip.id = tooltipId;
    tooltip.setAttribute('role', 'tooltip');
    trigger.setAttribute('aria-describedby', tooltipId);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    trigger.addEventListener('mouseenter', showTooltip);
    trigger.addEventListener('mouseleave', hideTooltip);
    trigger.addEventListener('focus', showTooltip);
    trigger.addEventListener('blur', hideTooltip);

    return () => {
      trigger.removeEventListener('mouseenter', showTooltip);
      trigger.removeEventListener('mouseleave', hideTooltip);
      trigger.removeEventListener('focus', showTooltip);
      trigger.removeEventListener('blur', hideTooltip);
    };
  }, [tooltipId]);

  return {
    triggerRef,
    tooltipRef,
    tooltipId,
    isVisible,
    triggerProps: {
      'aria-describedby': tooltipId
    },
    tooltipProps: {
      id: tooltipId,
      role: 'tooltip',
      'aria-hidden': !isVisible
    }
  };
}

/**
 * Hook for managing form accessibility
 */
export function useFormAccessibility() {
  const fieldId = useId('field');
  const errorId = useId('error');
  const descriptionId = useId('description');

  const getFieldProps = useCallback((hasError: boolean, hasDescription: boolean) => ({
    id: fieldId,
    'aria-invalid': hasError,
    'aria-describedby': [
      hasError ? errorId : null,
      hasDescription ? descriptionId : null
    ].filter(Boolean).join(' ') || undefined
  }), [fieldId, errorId, descriptionId]);

  const getLabelProps = useCallback(() => ({
    htmlFor: fieldId
  }), [fieldId]);

  const getErrorProps = useCallback(() => ({
    id: errorId,
    role: 'alert',
    'aria-live': 'polite'
  }), [errorId]);

  const getDescriptionProps = useCallback(() => ({
    id: descriptionId
  }), [descriptionId]);

  return {
    fieldId,
    errorId,
    descriptionId,
    getFieldProps,
    getLabelProps,
    getErrorProps,
    getDescriptionProps
  };
}

/**
 * Hook for managing table accessibility
 */
export function useTableAccessibility() {
  const tableId = useId('table');
  const captionId = useId('caption');

  const getTableProps = useCallback(() => ({
    id: tableId,
    role: 'table',
    'aria-labelledby': captionId
  }), [tableId, captionId]);

  const getCaptionProps = useCallback(() => ({
    id: captionId
  }), [captionId]);

  const getColumnHeaderProps = useCallback((sortable: boolean, sortDirection?: 'asc' | 'desc' | 'none') => ({
    role: 'columnheader',
    ...(sortable && {
      'aria-sort': sortDirection || 'none',
      tabIndex: 0
    })
  }), []);

  const getRowProps = useCallback((isSelected?: boolean) => ({
    role: 'row',
    ...(isSelected !== undefined && {
      'aria-selected': isSelected
    })
  }), []);

  const getCellProps = useCallback(() => ({
    role: 'gridcell'
  }), []);

  return {
    tableId,
    captionId,
    getTableProps,
    getCaptionProps,
    getColumnHeaderProps,
    getRowProps,
    getCellProps
  };
}