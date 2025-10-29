# Design Document

## Overview

This design document outlines the enhancement of the real estate platform's internal pages (dashboards, profiles, and other user interfaces) to achieve a modern, professional SaaS-like design. The design maintains consistency with the existing PropPortal-inspired landing page while creating a distinctive, brandable identity suitable for a scalable SaaS platform.

The enhancement focuses on:
- Consistent design system based on existing landing page patterns
- Modern card-based layouts with proper spacing and visual hierarchy
- Professional color palette and typography
- Improved user experience with better navigation and feedback
- Responsive design that works across all devices

## Architecture

### Design System Foundation

**Color Palette (Based on existing landing page):**
```css
/* Primary Colors */
--primary: hsl(221.2 83.2% 53.3%)        /* Blue primary from landing */
--primary-foreground: hsl(210 40% 98%)    /* White text on primary */
--primary-muted: hsl(221.2 83.2% 53.3% / 0.1) /* Light primary background */

/* Secondary Colors */
--secondary: hsl(210 40% 96%)             /* Light gray backgrounds */
--secondary-foreground: hsl(222.2 84% 4.9%) /* Dark text on secondary */

/* Accent Colors */
--accent: hsl(210 40% 96%)                /* Subtle accent */
--accent-foreground: hsl(222.2 84% 4.9%) /* Text on accent */

/* Neutral Colors */
--background: hsl(0 0% 100%)              /* Pure white background */
--foreground: hsl(222.2 84% 4.9%)        /* Primary text color */
--muted: hsl(210 40% 96%)                 /* Muted backgrounds */
--muted-foreground: hsl(215.4 16.3% 46.9%) /* Muted text */

/* Border and Dividers */
--border: hsl(214.3 31.8% 91.4%)         /* Subtle borders */
--input: hsl(214.3 31.8% 91.4%)          /* Input borders */
--ring: hsl(221.2 83.2% 53.3%)           /* Focus rings */

/* Status Colors */
--success: hsl(142.1 76.2% 36.3%)        /* Green for success */
--warning: hsl(47.9 95.8% 53.1%)         /* Yellow for warnings */
--error: hsl(0 84.2% 60.2%)              /* Red for errors */
--info: hsl(204 94% 94%)                  /* Light blue for info */
```

**Typography Scale:**
```css
/* Font Families */
--font-heading: 'Inter', system-ui, sans-serif  /* For headings */
--font-body: 'Inter', system-ui, sans-serif     /* For body text */
--font-mono: 'JetBrains Mono', monospace        /* For code/data */

/* Font Sizes */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

**Spacing System:**
```css
/* Spacing Scale (based on 4px base unit) */
--space-1: 0.25rem      /* 4px */
--space-2: 0.5rem       /* 8px */
--space-3: 0.75rem      /* 12px */
--space-4: 1rem         /* 16px */
--space-5: 1.25rem      /* 20px */
--space-6: 1.5rem       /* 24px */
--space-8: 2rem         /* 32px */
--space-10: 2.5rem      /* 40px */
--space-12: 3rem        /* 48px */
--space-16: 4rem        /* 64px */
--space-20: 5rem        /* 80px */
```

**Border Radius:**
```css
--radius-sm: 0.375rem   /* 6px */
--radius: 0.5rem        /* 8px */
--radius-md: 0.75rem    /* 12px */
--radius-lg: 1rem       /* 16px */
--radius-xl: 1.5rem     /* 24px */
```

**Shadows:**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

## Components and Interfaces

### 1. Enhanced Dashboard Layout

#### DashboardLayout Component
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}
```

**Design Features:**
- Clean, modern header with user avatar, notifications, and quick actions
- Responsive sidebar with collapsible navigation
- Main content area with proper padding and max-width constraints
- Breadcrumb navigation for deep pages
- Consistent background colors and spacing

#### Enhanced StatsCard Component
```typescript
interface EnhancedStatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  loading?: boolean;
}
```

**Design Features:**
- Modern card design with subtle shadows and hover effects
- Color-coded backgrounds for different metric types
- Animated trend indicators with icons
- Loading skeleton states
- Responsive sizing for different screen sizes

### 2. Profile Page Components

#### ProfileLayout Component
```typescript
interface ProfileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
```

**Design Features:**
- Two-column layout with navigation sidebar and content area
- Clean header with profile title and action buttons
- Consistent spacing and typography throughout
- Mobile-responsive with collapsible sidebar

#### ProfileSection Component
```typescript
interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}
```

**Design Features:**
- Card-based sections with clear headers
- Optional collapsible functionality
- Consistent padding and spacing
- Clear visual separation between sections

### 3. Enhanced Form Components

#### FormField Component
```typescript
interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

**Design Features:**
- Clear labels with optional descriptions
- Consistent error message styling
- Required field indicators
- Proper spacing and alignment

#### Enhanced Input Components
- Consistent styling across all input types
- Clear focus states with primary color rings
- Proper error states with red borders and messages
- Loading states for async validation
- Placeholder text with proper contrast

### 4. Navigation Components

#### DashboardSidebar Component
```typescript
interface DashboardSidebarProps {
  navigation: NavigationItem[];
  user: User;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  children?: NavigationItem[];
}
```

**Design Features:**
- Clean, organized navigation with proper grouping
- Active state indicators with primary color highlights
- Badge support for notifications and counts
- Collapsible design for mobile and compact views
- Smooth animations for state changes

#### Breadcrumb Component
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}
```

**Design Features:**
- Clear path indication with proper separators
- Clickable navigation for non-current items
- Consistent typography and spacing
- Mobile-responsive with truncation for long paths

### 5. Data Display Components

#### DataTable Component
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  selection?: SelectionConfig;
  loading?: boolean;
}
```

**Design Features:**
- Clean, scannable table design with proper spacing
- Alternating row colors for better readability
- Sortable column headers with clear indicators
- Pagination controls with consistent styling
- Loading states with skeleton rows

#### PropertyCard Component (Enhanced)
```typescript
interface EnhancedPropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onFavorite?: (id: number) => void;
  onContact?: (id: number) => void;
  className?: string;
}
```

**Design Features:**
- Modern card design with improved image handling
- Better typography hierarchy for property details
- Clear action buttons with consistent styling
- Hover effects and smooth transitions
- Responsive design for different screen sizes

### 6. Notification and Alert Components

#### NotificationPanel Component
```typescript
interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onClear?: (id: number) => void;
}
```

**Design Features:**
- Clean notification list with proper grouping
- Clear read/unread states with visual indicators
- Action buttons for marking as read and clearing
- Smooth animations for state changes

#### Alert Component
```typescript
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
}
```

**Design Features:**
- Color-coded alerts with appropriate icons
- Clear typography hierarchy for title and message
- Optional action buttons with consistent styling
- Smooth dismiss animations

## Data Models

### Enhanced Dashboard Data
```typescript
interface DashboardData {
  user: User;
  stats: DashboardStats;
  recentActivity: Activity[];
  notifications: Notification[];
  quickActions: QuickAction[];
  widgets: DashboardWidget[];
}

interface DashboardStats {
  primary: PrimaryStat[];
  secondary: SecondaryStat[];
  trends: TrendData[];
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'list' | 'metric' | 'activity';
  title: string;
  data: any;
  config: WidgetConfig;
}
```

### Profile Data Models
```typescript
interface UserProfile {
  personal: PersonalInfo;
  contact: ContactInfo;
  preferences: UserPreferences;
  security: SecuritySettings;
  subscription?: SubscriptionInfo;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface ContactInfo {
  email: string;
  phone?: string;
  address?: Address;
  socialLinks?: SocialLink[];
}
```

## Error Handling

### Error Display Strategy
1. **Inline Errors**: Form validation errors displayed directly below fields
2. **Toast Notifications**: Success/error messages for actions
3. **Error Pages**: Full-page errors for critical failures
4. **Loading States**: Skeleton screens and spinners for async operations

### Error Component Design
```typescript
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

## Testing Strategy

### Visual Testing
- Component library documentation with Storybook
- Visual regression testing for design consistency
- Cross-browser compatibility testing
- Responsive design testing across devices

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation
- ARIA label verification

### Performance Testing
- Component rendering performance
- Bundle size optimization
- Image loading optimization
- Animation performance testing

## Implementation Guidelines

### CSS Architecture
```scss
// Use CSS custom properties for theming
:root {
  // Color tokens
  --color-primary: hsl(221.2 83.2% 53.3%);
  --color-primary-foreground: hsl(210 40% 98%);
  
  // Spacing tokens
  --space-4: 1rem;
  --space-6: 1.5rem;
  
  // Typography tokens
  --font-size-base: 1rem;
  --font-weight-medium: 500;
}

// Component-specific styles
.dashboard-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-6);
  box-shadow: var(--shadow);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    transition: all 0.2s ease-in-out;
  }
}
```

### Component Structure
```typescript
// Consistent component structure
export interface ComponentProps {
  // Props interface
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  
  return (
    <div className="component-wrapper">
      {/* Component JSX */}
    </div>
  );
}

// Export with display name for debugging
Component.displayName = 'Component';
```

### Responsive Design Patterns
```css
/* Mobile-first responsive design */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Migration Strategy

### Phase 1: Design System Setup
1. Update CSS custom properties with new design tokens
2. Create enhanced base components (Button, Input, Card, etc.)
3. Set up consistent spacing and typography utilities

### Phase 2: Dashboard Enhancement
1. Update DashboardLayout with new design
2. Enhance StatsCard components with modern styling
3. Improve navigation and sidebar components
4. Add loading states and error handling

### Phase 3: Profile Page Enhancement
1. Create ProfileLayout component
2. Update form components with new styling
3. Enhance profile sections and navigation
4. Add responsive design improvements

### Phase 4: Data Display Enhancement
1. Update table components with modern styling
2. Enhance PropertyCard and list components
3. Improve notification and alert components
4. Add smooth animations and transitions

### Phase 5: Polish and Optimization
1. Add micro-interactions and hover effects
2. Optimize performance and bundle size
3. Ensure accessibility compliance
4. Cross-browser testing and fixes

## Accessibility Considerations

### Color and Contrast
- Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Provide alternative indicators beyond color
- Support high contrast mode

### Keyboard Navigation
- Logical tab order throughout interfaces
- Visible focus indicators
- Keyboard shortcuts for common actions
- Skip links for main content areas

### Screen Reader Support
- Proper heading hierarchy (h1-h6)
- Descriptive ARIA labels and roles
- Live regions for dynamic content updates
- Alternative text for images and icons

### Responsive Design
- Touch-friendly target sizes (44px minimum)
- Readable text at all zoom levels
- Horizontal scrolling avoidance
- Consistent navigation across devices