# Enhanced Design System Foundation

This directory contains the enhanced design system foundation for the SaaS UI enhancement project. The design system provides consistent styling, spacing, colors, and utilities across the entire application.

## Files Overview

- `designTokens.ts` - Design tokens and CSS custom property references
- `utils.ts` - Utility functions and common style combinations
- `index.ts` - Central export point for all design system utilities

## Usage

### Importing Design System Utilities

```typescript
// Import everything
import { cn, colors, spacing, componentStyles } from '@/shared/styles';

// Import specific utilities
import { cn } from '@/shared/styles/utils';
import { colors, cssVars } from '@/shared/styles/designTokens';
```

### Using CSS Custom Properties

The design system defines CSS custom properties that can be used directly in CSS or through Tailwind classes:

```css
/* Direct CSS usage */
.my-component {
  background: hsl(var(--primary));
  padding: var(--space-4);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
```

```tsx
// Tailwind classes (automatically use the custom properties)
<div className="bg-primary p-4 rounded shadow">
  Content
</div>
```

### Component Style Utilities

Use pre-defined component styles for consistency:

```tsx
import { cn, componentStyles } from '@/shared/styles';

// Button example
<button className={cn(componentStyles.button.base, componentStyles.button.primary)}>
  Primary Button
</button>

// Card example
<div className={componentStyles.card.elevated}>
  Card content
</div>
```

### Responsive Design

Use responsive utilities for mobile-first design:

```tsx
import { responsive } from '@/shared/styles';

// Responsive grid
<div className={responsive.grid({ base: 1, md: 2, lg: 3 })}>
  Grid items
</div>

// Responsive spacing
<div className={responsive.spacing('p', { base: 4, md: 6, lg: 8 })}>
  Responsive padding
</div>
```

### Status Styling

Apply consistent status colors:

```tsx
import { statusStyles } from '@/shared/styles';

<div className={statusStyles.success.bg}>Success message</div>
<div className={statusStyles.error.text}>Error text</div>
```

### Focus and Transitions

Apply consistent focus states and transitions:

```tsx
import { focusStyles, transitionStyles } from '@/shared/styles';

<button className={cn(
  'btn',
  focusStyles.ring,
  transitionStyles.all
)}>
  Interactive button
</button>
```

## Design Tokens

### Colors

The color system is based on HSL values and supports both light and dark themes:

- **Primary**: Main brand color (blue)
- **Secondary**: Light gray for backgrounds
- **Accent**: Subtle accent color
- **Muted**: Muted backgrounds and text
- **Status**: Success, warning, error, and info colors

### Typography

- **Font Families**: Inter for headings and body, JetBrains Mono for code
- **Font Sizes**: xs (12px) to 4xl (36px)
- **Font Weights**: normal (400) to bold (700)

### Spacing

Based on a 4px grid system:
- `space-1` = 4px
- `space-2` = 8px
- `space-4` = 16px
- `space-6` = 24px
- etc.

### Shadows

Five levels of shadows from subtle to prominent:
- `shadow-sm`: Subtle shadow
- `shadow`: Default shadow
- `shadow-md`: Medium shadow
- `shadow-lg`: Large shadow
- `shadow-xl`: Extra large shadow

## Responsive Breakpoints

Mobile-first approach with these breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Best Practices

1. **Use CSS Custom Properties**: Prefer using the CSS custom properties over hardcoded values
2. **Mobile-First**: Always design for mobile first, then enhance for larger screens
3. **Consistent Spacing**: Use the spacing scale for margins, padding, and gaps
4. **Component Styles**: Use the pre-defined component styles for consistency
5. **Status Colors**: Use the status color utilities for success, warning, error states
6. **Focus States**: Always include proper focus states for accessibility
7. **Transitions**: Add smooth transitions for better user experience

## Examples

### Dashboard Card

```tsx
import { cn, componentStyles, hoverEffects } from '@/shared/styles';

function StatsCard({ title, value, trend }) {
  return (
    <div className={cn(
      componentStyles.dashboard.statsCard,
      hoverEffects.lift
    )}>
      <h3 className={componentStyles.text.heading}>{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <span className={cn(
        componentStyles.text.small,
        trend > 0 ? statusStyles.success.text : statusStyles.error.text
      )}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </span>
    </div>
  );
}
```

### Form Input

```tsx
import { cn, componentStyles, focusStyles } from '@/shared/styles';

function FormInput({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className={componentStyles.text.body}>{label}</label>
      <input
        className={cn(
          componentStyles.input.base,
          error && componentStyles.input.error,
          focusStyles.ring
        )}
        {...props}
      />
      {error && (
        <p className={statusStyles.error.text}>{error}</p>
      )}
    </div>
  );
}
```

This design system foundation provides a solid base for building consistent, accessible, and maintainable UI components throughout the application.