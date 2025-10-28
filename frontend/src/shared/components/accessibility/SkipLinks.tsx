import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' }
];

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link focus-visible-enhanced"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

// Hook to register skip link targets
export function useSkipLinkTarget(id: string) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.id = id;
      // Make the element focusable for skip links
      if (!ref.current.hasAttribute('tabindex')) {
        ref.current.setAttribute('tabindex', '-1');
      }
    }
  }, [id]);

  return ref;
}