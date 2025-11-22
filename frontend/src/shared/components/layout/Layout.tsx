import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Container } from './Container';
import { Breadcrumb } from './Breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}
import { cn } from '@/shared/lib/utils';

interface LayoutProps {
  children: ReactNode;
  headerVariant?: 'landing' | 'default';
  showFooter?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Layout({ 
  children, 
  headerVariant = 'default', 
  showFooter = true,
  showBreadcrumb = false,
  breadcrumbItems = [],
  containerSize = 'lg',
  className
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={headerVariant} />
      
      {showBreadcrumb && breadcrumbItems.length > 0 && (
        <div className="bg-muted/30 border-b">
          <Container size={containerSize}>
            <div className="py-3">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </Container>
        </div>
      )}
      
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  breadcrumbItems = [],
  actions,
  containerSize = 'lg'
}: PageLayoutProps) {
  return (
    <Layout 
      showBreadcrumb={breadcrumbItems.length > 0}
      breadcrumbItems={breadcrumbItems}
      containerSize={containerSize}
    >
      <Container size={containerSize} className="py-6">
        {(title || description || actions) && (
          <div className="mb-8">
            {breadcrumbItems.length > 0 && (
              <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-600">
                    {description}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        
        {children}
      </Container>
    </Layout>
  );
}