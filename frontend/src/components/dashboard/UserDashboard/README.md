# User Dashboard Components

This directory contains separate dashboard components for different user types, improving code organization and maintainability.

## Structure

```
UserDashboard/
├── BuyerDashboard.tsx      # Dashboard for property buyers
├── OwnerDashboard.tsx      # Dashboard for property owners
├── AgentDashboard.tsx      # Dashboard for real estate agents
├── BuilderDashboard.tsx    # Dashboard for builders/developers
├── index.ts               # Export all dashboard components
└── README.md              # This documentation
```

## Components

### BuyerDashboard
- **Purpose**: Dashboard for users looking to buy/rent properties
- **Features**:
  - Saved properties count
  - Saved searches count
  - Messages count
  - Quick actions: Search Properties, Saved Properties, Saved Searches, Activity History, Communication
  - Recent activity section

### OwnerDashboard
- **Purpose**: Dashboard for individual property owners
- **Features**:
  - Active/total listings count
  - Property views count
  - Inquiries count
  - Messages count
  - Quick actions: Add New Property, My Properties, Property Analytics, Messages & Inquiries
  - Recent activity section

### AgentDashboard
- **Purpose**: Dashboard for real estate agents managing client properties
- **Features**:
  - Active/total listings count
  - Property views count
  - Inquiries count
  - Messages count
  - Quick actions: Add Client Property, Bulk Upload Properties, Client Portfolio, Lead Management, Client Communication
  - Recent activity section

### BuilderDashboard
- **Purpose**: Dashboard for builders/developers managing construction projects
- **Features**:
  - Active/total projects count
  - Units available/total count
  - Inquiries count
  - Messages count
  - Quick actions: New Project, Project Portfolio, Buyer Communication
  - Recent projects section with detailed project information

## Usage

The main `DashboardPage.tsx` component automatically renders the appropriate dashboard based on the user's role:

```tsx
import { BuyerDashboard, OwnerDashboard, AgentDashboard, BuilderDashboard } from './UserDashboard';

// In DashboardPage component
const renderDashboardContent = () => {
  switch (state.user?.role) {
    case 'builder':
      return <BuilderDashboard stats={builderStats} recentProjects={projects} />;
    case 'owner':
      return <OwnerDashboard stats={ownerStats} />;
    case 'agent':
      return <AgentDashboard stats={agentStats} />;
    case 'buyer':
    default:
      return <BuyerDashboard stats={buyerStats} />;
  }
};
```

## Props Interface

### BuyerDashboard Props
```tsx
interface BuyerDashboardProps {
  stats: {
    savedProperties: number;
    savedSearches: number;
    messages: number;
  };
}
```

### OwnerDashboard Props
```tsx
interface OwnerDashboardProps {
  stats: {
    totalListings: number;
    activeListings: number;
    propertyViews: number;
    inquiries: number;
    messages: number;
  };
}
```

### AgentDashboard Props
```tsx
interface AgentDashboardProps {
  stats: {
    totalListings: number;
    activeListings: number;
    propertyViews: number;
    inquiries: number;
    messages: number;
  };
}
```

### BuilderDashboard Props
```tsx
interface BuilderDashboardProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    unitsListed: number;
    unitsAvailable: number;
    totalInquiries: number;
    messages: number;
  };
  recentProjects: Project[];
}

interface Project {
  id: number;
  name: string;
  location: string;
  phase: string;
  units: number;
  sold: number;
  status: string;
}
```

## Benefits of This Structure

1. **Separation of Concerns**: Each user type has its own dedicated component
2. **Maintainability**: Easier to modify features for specific user types
3. **Reusability**: Components can be reused in other parts of the application
4. **Type Safety**: Each component has its own TypeScript interfaces
5. **Code Organization**: Cleaner and more organized codebase
6. **Performance**: Only the relevant dashboard component is rendered

## Design Consistency

All dashboard components maintain consistent design patterns:
- Welcome message with user's name
- Stats cards with icons and color coding
- Quick actions grid with hover effects
- Recent activity/projects section
- Responsive design for mobile and desktop

## Future Enhancements

- Add loading states for each dashboard
- Implement real-time data updates
- Add customizable dashboard widgets
- Include dashboard preferences/settings
- Add export functionality for stats