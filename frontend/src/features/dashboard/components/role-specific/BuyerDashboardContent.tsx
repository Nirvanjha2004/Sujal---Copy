import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import { ActivityFeed } from '../common/ActivityFeed';
import type { BuyerDashboardStats, QuickAction } from '@/features/dashboard/types/dashboard';

interface BuyerDashboardContentProps {
  stats: BuyerDashboardStats;
  isLoading?: boolean;
}

export function BuyerDashboardContent({ stats, isLoading = false }: BuyerDashboardContentProps) {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();

  // Provide default values for stats to prevent undefined errors
  const safeStats = {
    savedProperties: stats?.savedProperties || 0,
    savedSearches: stats?.savedSearches || 0,
    messages: stats?.messages || 0,
    recentViews: stats?.recentViews || 0,
    totalInquiries: stats?.totalInquiries || 0
  };

  const quickActions: QuickAction[] = [
    {
      id: 'search-properties',
      title: 'Search Properties',
      description: 'Browse available properties',
      icon: 'solar:magnifer-bold',
      action: () => navigate('/'),
      color: 'bg-primary',
      isEnabled: true
    },
    {
      id: 'saved-properties',
      title: 'Saved Properties',
      description: 'View your favorite properties',
      icon: 'solar:heart-bold',
      action: () => navigate('/favorites'),
      color: 'bg-red-500',
      isEnabled: true,
      badge: safeStats.savedProperties > 0 ? safeStats.savedProperties : undefined
    },
    {
      id: 'saved-searches',
      title: 'Saved Searches',
      description: 'Manage your saved search criteria',
      icon: 'solar:bookmark-bold',
      action: () => navigate('/saved-searches'),
      color: 'bg-accent',
      isEnabled: true,
      badge: safeStats.savedSearches > 0 ? safeStats.savedSearches : undefined
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Messages and inquiries',
      icon: 'solar:letter-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'bg-blue-500',
      isEnabled: true,
      badge: safeStats.messages > 0 ? safeStats.messages : undefined
    },
    // {
    //   id: 'property-alerts',
    //   title: 'Property Alerts',
    //   description: 'Set up notifications for new properties',
    //   icon: 'solar:bell-bold',
    //   action: () => navigate('/alerts'),
    //   color: 'bg-yellow-500',
    //   isEnabled: true
    // },
    // {
    //   id: 'market-insights',
    //   title: 'Market Insights',
    //   description: 'View market trends and analysis',
    //   icon: 'solar:chart-2-bold',
    //   action: () => navigate('/market-insights'),
    //   color: 'bg-green-500',
    //   isEnabled: true
    // }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection
        user={user!}
        roleSpecificMessage="Find your dream property and manage your searches"
        primaryAction={{
          label: 'Search Properties',
          icon: 'solar:magnifer-bold',
          onClick: () => navigate('/')
        }}
        secondaryAction={{
          label: 'View Favorites',
          icon: 'solar:heart-bold',
          onClick: () => navigate('/favorites')
        }}
        stats={{
          label: 'Saved Properties',
          value: safeStats.savedProperties
        }}
      />

      {/* Enhanced Stats Cards with Modern Design */}
      <DashboardGrid columns={4} gap="lg" className="mb-8">
        <GridItem>
          <StatsCard
            title="Saved Properties"
            value={safeStats.savedProperties}
            icon="solar:heart-bold"
            color="bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-red-200"
            subtitle="Favorites"
            trend={{
              value: 2,
              direction: 'up',
              period: 'this week'
            }}
            onClick={() => navigate('/favorites')}
            className="hover:shadow-lg hover:scale-105 transition-all duration-200"
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Saved Searches"
            value={safeStats.savedSearches}
            icon="solar:bookmark-bold"
            color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200"
            subtitle="Active searches"
            trend={{
              value: 1,
              direction: 'up',
              period: 'this month'
            }}
            onClick={() => navigate('/saved-searches')}
            className="hover:shadow-lg hover:scale-105 transition-all duration-200"
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Recent Views"
            value={safeStats.recentViews}
            icon="solar:eye-bold"
            color="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200"
            subtitle="Properties viewed"
            trend={{
              value: 5,
              direction: 'up',
              period: 'today'
            }}
            onClick={() => navigate('/recent-views')}
            className="hover:shadow-lg hover:scale-105 transition-all duration-200"
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Messages"
            value={safeStats.messages}
            icon="solar:letter-bold"
            color="bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200"
            subtitle="Conversations"
            onClick={() => navigate('/dashboard/messages')}
            className="hover:shadow-lg hover:scale-105 transition-all duration-200"
          />
        </GridItem>
      </DashboardGrid>

      {/* Quick Actions */}
      <QuickActions
        actions={quickActions}
        title="Quick Actions"
        columns={3}
      />
    </div>
  );
}