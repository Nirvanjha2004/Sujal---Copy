import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, separator = '/' }: BreadcrumbProps) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-foreground font-medium' : ''}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-muted-foreground">{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}