import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import type { QuickAction } from '@/features/dashboard/types/dashboard';

interface UserStats {
  profileCompletion: number;
  accountAge: number;
  lastLogin: string;
  totalActions: number;
}

interface UserDashboardContentProps {
  stats: UserStats;
  isLoading?: boolean;
}

export function UserDashboardContent({ stats, isLoading = false }: UserDashboardContentProps) {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();

  // Provide default values for stats to prevent undefined errors
  const safeStats = {
    profileCompletion: stats?.profileCompletion || 0,
    accountAge: stats?.accountAge || 0,
    lastLogin: stats?.lastLogin || new Date().toISOString(),
    totalActions: stats?.totalActions || 0
  };

  const quickActions: QuickAction[] = [
    {
      id: 'complete-profile',
      title: 'Complete Profile',
      description: 'Finish setting up your account',
      icon: 'solar:user-bold',
      action: () => navigate('/profile'),
      color: 'primary',
      isEnabled: safeStats.profileCompletion < 100,
      priority: safeStats.profileCompletion < 50 ? 'high' : 'medium'
    },
    {
      id: 'browse-properties',
      title: 'Browse Properties',
      description: 'Explore available properties',
      icon: 'solar:home-bold',
      action: () => navigate('/'),
      color: 'info',
      isEnabled: true
    },
    {
      id: 'account-settings',
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: 'solar:settings-bold',
      action: () => navigate('/settings'),
      color: 'info',
      isEnabled: true
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      description: 'Get help or contact support',
      icon: 'solar:help-bold',
      action: () => navigate('/support'),
      color: 'success',
      isEnabled: true
    },
    {
      id: 'upgrade-account',
      title: 'Upgrade Account',
      description: 'Unlock additional features',
      icon: 'solar:crown-bold',
      action: () => navigate('/upgrade'),
      color: 'warning',
      isEnabled: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: 'solar:bell-bold',
      action: () => navigate('/notifications'),
      color: 'purple',
      isEnabled: true
    }
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

  const getProfileCompletionColor = (): 'success' | 'warning' | 'error' => {
    if (safeStats.profileCompletion >= 80) return 'success';
    if (safeStats.profileCompletion >= 50) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection
        user={user!}
        roleSpecificMessage="Welcome to your dashboard. Complete your profile to get started."
        stats={[{
          label: 'Profile Complete',
          value: safeStats.profileCompletion
        }]}
      />

      {/* Stats Cards */}
      <DashboardGrid columns={3} gap="md">
        <GridItem>
          <StatsCard
            title="Profile Completion"
            value={safeStats.profileCompletion}
            icon="solar:user-bold"
            color={getProfileCompletionColor()}
            subtitle={`${100 - safeStats.profileCompletion}% remaining`}
            onClick={() => navigate('/profile')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Account Age"
            value={safeStats.accountAge}
            icon="solar:calendar-bold"
            color="info"
            subtitle="Days since joining"
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Total Actions"
            value={safeStats.totalActions}
            icon="solar:chart-2-bold"
            color="primary"
            subtitle="Platform interactions"
          />
        </GridItem>
      </DashboardGrid>

      {/* Quick Actions */}
      <QuickActions
        actions={quickActions}
        title="Get Started"
        columns={3}
      />

      {/* Profile Completion Reminder */}
      {safeStats.profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">Complete Your Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your profile to unlock all features and get personalized recommendations.
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Complete Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}