# Layout Components

This directory contains all the core layout components for the Real Estate Portal frontend. These components provide a consistent structure and responsive design across the application.

## Components Overview

### Layout Components

#### `Layout`
The main layout wrapper that provides the basic page structure with header and footer.

```tsx
import { Layout } from '@/components/layout';

<Layout 
  headerVariant="landing" // or "default"
  showFooter={true}
  showBreadcrumb={true}
  breadcrumbItems={[...]}
  containerSize="lg"
>
  {children}
</Layout>
```

#### `PageLayout`
An enhanced layout component that includes page title, description, breadcrumbs, and action buttons.

```tsx
import { PageLayout } from '@/components/layout';

<PageLayout
  title="Page Title"
  description="Page description"
  breadcrumbItems={breadcrumbConfigs.profile}
  actions={<Button>Action</Button>}
  containerSize="md"
>
  {children}
</PageLayout>
```

### Navigation Components

#### `Header`
Responsive header with navigation and user menu.

- **Landing variant**: Used on the homepage with gradient background
- **Default variant**: Used on internal pages with solid background
- Includes mobile navigation toggle
- Shows different content based on authentication state

#### `Footer`
Comprehensive footer with links, contact information, and social media.

#### `MobileNav`
Slide-out mobile navigation menu with:
- User profile information
- Navigation links organized by category
- Authentication actions
- Responsive overlay

#### `Breadcrumb`
Navigation breadcrumbs with predefined configurations.

```tsx
import { Breadcrumb, breadcrumbConfigs } from '@/components/layout';

// Using predefined config
<Breadcrumb items={breadcrumbConfigs.profile} />

// Custom breadcrumb
<Breadcrumb items={[
  { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
  { label: 'Current Page' }
]} />
```

### Sidebar Components

#### `Sidebar`
Generic sidebar component with overlay support.

#### `FilterSidebar`
Specialized sidebar for search filters with clear all functionality.

#### `UserMenuSidebar`
User menu sidebar with profile information and account links.

### Container Components

#### `Container`
Responsive container with different size options.

```tsx
import { Container } from '@/components/layout';

<Container size="lg"> // sm, md, lg, xl, full
  {children}
</Container>
```

#### `Section`
Page section wrapper with background variants.

```tsx
import { Section } from '@/components/layout';

<Section background="muted"> // default, muted, accent
  {children}
</Section>
```

#### `Grid`
Responsive grid layout with configurable columns and gaps.

```tsx
import { Grid } from '@/components/layout';

<Grid cols={4} gap="md"> // cols: 1-6, gap: sm, md, lg
  {children}
</Grid>
```

### Utility Components

#### `ErrorBoundary`
React error boundary with user-friendly error display and recovery options.

## Loading Components

Located in `@/components/ui/loading`, these components provide consistent loading states:

- `LoadingSpinner`: Configurable spinner component
- `PageLoading`: Full page loading state
- `ButtonLoading`: Loading state for buttons
- `PropertyCardSkeleton`: Skeleton for property cards
- `PropertyGridSkeleton`: Skeleton for property grids
- `PropertyDetailsSkeleton`: Skeleton for property details
- `SearchFiltersSkeleton`: Skeleton for search filters
- `DashboardSkeleton`: Skeleton for dashboard content

## Usage Examples

### Basic Page Layout

```tsx
import { PageLayout, breadcrumbConfigs } from '@/components/layout';

export function MyPage() {
  return (
    <PageLayout
      title="My Page"
      description="Page description"
      breadcrumbItems={breadcrumbConfigs.dashboard}
    >
      <div>Page content</div>
    </PageLayout>
  );
}
```

### Page with Sidebar

```tsx
import { Layout, FilterSidebar, Container } from '@/components/layout';

export function SearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout>
      <div className="flex">
        <FilterSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        >
          {/* Filter content */}
        </FilterSidebar>
        
        <Container className="flex-1">
          {/* Main content */}
        </Container>
      </div>
    </Layout>
  );
}
```

### Grid Layout

```tsx
import { PageLayout, Grid, Container } from '@/components/layout';

export function PropertiesPage() {
  return (
    <PageLayout title="Properties">
      <Container>
        <Grid cols={4} gap="lg">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </Grid>
      </Container>
    </PageLayout>
  );
}
```

## Responsive Design

All layout components are built with mobile-first responsive design:

- **Mobile (< 768px)**: Single column layouts, collapsible navigation
- **Tablet (768px - 1024px)**: Two-column layouts, expanded navigation
- **Desktop (> 1024px)**: Multi-column layouts, full navigation

## Accessibility

Layout components include accessibility features:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management for modals and sidebars
- Screen reader friendly content structure

## Customization

Components use Tailwind CSS classes and can be customized through:

- CSS custom properties for colors and spacing
- Tailwind configuration for breakpoints and utilities
- Component props for behavior and appearance
- CSS modules for component-specific styles

## Best Practices

1. **Use PageLayout for standard pages** - Provides consistent structure
2. **Implement loading states** - Use skeleton components during data fetching
3. **Handle responsive design** - Test on different screen sizes
4. **Maintain accessibility** - Follow ARIA guidelines and keyboard navigation
5. **Keep components focused** - Each component should have a single responsibility