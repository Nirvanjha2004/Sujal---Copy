import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface GridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 6 | 'full';
  className?: string;
}

export function DashboardGrid({
  children,
  columns = 3,
  gap = 'md',
  className
}: DashboardGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 6:
        return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getGap = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4';
      case 'md':
        return 'gap-6';
      case 'lg':
        return 'gap-8';
      default:
        return 'gap-6';
    }
  };

  return (
    <div className={cn('grid', getGridCols(), getGap(), className)}>
      {children}
    </div>
  );
}

export function GridItem({ children, span = 1, className }: GridItemProps) {
  const getColSpan = () => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-1 md:col-span-2';
      case 3:
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 4:
        return 'col-span-1 md:col-span-2 lg:col-span-4';
      case 6:
        return 'col-span-1 md:col-span-3 lg:col-span-6';
      case 'full':
        return 'col-span-full';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div className={cn(getColSpan(), className)}>
      {children}
    </div>
  );
}