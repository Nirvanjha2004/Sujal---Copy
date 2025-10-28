import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserPreferences } from '@/shared/hooks/useAccessibility';

interface AccessibilityContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  colorScheme: 'light' | 'dark';
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  setKeyboardNavigation: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { reducedMotion, highContrast, colorScheme } = useUserPreferences();
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setKeyboardNavigation(true);
        document.body.classList.add('keyboard-navigation-active');
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
      document.body.classList.remove('keyboard-navigation-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Detect screen reader usage
  useEffect(() => {
    // Check for common screen reader indicators
    const hasScreenReader = 
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis?.getVoices().length > 0;

    if (hasScreenReader) {
      setScreenReaderMode(true);
    }
  }, []);

  // Apply accessibility classes to document
  useEffect(() => {
    const classes = [];
    
    if (reducedMotion) classes.push('reduced-motion');
    if (highContrast) classes.push('high-contrast');
    if (keyboardNavigation) classes.push('keyboard-navigation');
    if (screenReaderMode) classes.push('screen-reader-mode');
    if (colorScheme === 'dark') classes.push('dark-mode');
    
    classes.push(`font-size-${fontSize}`);

    // Remove existing accessibility classes
    document.documentElement.classList.remove(
      'reduced-motion', 'high-contrast', 'keyboard-navigation', 
      'screen-reader-mode', 'dark-mode', 'font-size-small', 
      'font-size-medium', 'font-size-large'
    );

    // Add current classes
    document.documentElement.classList.add(...classes);

    return () => {
      document.documentElement.classList.remove(...classes);
    };
  }, [reducedMotion, highContrast, keyboardNavigation, screenReaderMode, colorScheme, fontSize]);

  // Apply font size CSS custom property
  useEffect(() => {
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };

    document.documentElement.style.setProperty(
      '--accessibility-font-size',
      fontSizeMap[fontSize]
    );
  }, [fontSize]);

  const value: AccessibilityContextType = {
    reducedMotion,
    highContrast,
    colorScheme,
    keyboardNavigation,
    screenReaderMode,
    fontSize,
    setKeyboardNavigation,
    setScreenReaderMode,
    setFontSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Hook for accessibility announcements
export function useAccessibilityAnnouncements() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  };

  return { announcements, announce };
}

// Component for live region announcements
export function LiveRegion() {
  const { announcements } = useAccessibilityAnnouncements();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  );
}