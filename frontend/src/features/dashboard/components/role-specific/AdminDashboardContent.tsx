import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import type { QuickAction } from '@/features/dashboard/types/dashboard';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  activeListings: number;
  pendingApprovals: number;
  systemHealth: number;
}

interface AdminDashboardContentProps {
  stats: AdminStats;
  isLoading?: boolean;
}

export function AdminDashboardContent({ stats, isLoading = false }: AdminDashboardContentProps) {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();

  // Provide default values for stats to prevent undefined errors
  const safeStats = {
    totalUsers: stats?.totalUsers || 0,
    totalProperties: stats?.totalProperties || 0,
    totalInquiries: stats?.totalInquiries || 0,
    activeListings: stats?.activeListings || 0,
    pendingApprovals: stats?.pendingApprovals || 0,
    systemHealth: stats?.systemHealth || 100
  };

  const quickActions: QuickAction[] = [
    {
      id: 'pending-users',
      title: 'Pending User Approvals',
      description: 'Review and approve new user registrations',
      icon: 'solar:user-check-bold',
      action: () => navigate('/admin/users'),
      color: 'bg-blue-500',
      isEnabled: true,
      badge: 5, // This would come from API
      priority: 'high'
    },
    {
      id: 'pending-properties',
      title: 'Properties Awaiting Review',
      description: 'Moderate new property listings',
      icon: 'solar:home-2-bold',
      action: () => navigate('/admin/properties'),
      color: 'bg-green-500',
      isEnabled: true,
      badge: 8,
      priority: 'medium'
    },
    {
      id: 'content-updates',
      title: 'Update Site Content',
      description: 'Manage banners and announcements',
      icon: 'solar:document-text-bold',
      action: () => navigate('/admin/content'),
      color: 'bg-purple-500',
      isEnabled: true
    },
    {
      id: 'review-reports',
      title: 'Review Reports',
      description: 'Moderate user reviews and feedback',
      icon: 'solar:star-bold',
      action: () => navigate('/admin/reviews'),
      color: 'bg-yellow-500',
      isEnabled: true,
      badge: 3
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Monitor platform performance',
      icon: 'solar:shield-check-bold',
      action: () => navigate('/admin/analytics'),
      color: 'bg-teal-500',
      isEnabled: true
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: 'solar:users-group-rounded-bold',
      action: () => navigate('/admin/users'),
      color: 'bg-indigo-500',
      isEnabled: true
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
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
        roleSpecificMessage="Manage your platform and oversee all operations"
        primaryAction={{
          label: 'View Analytics',
          icon: 'solar:chart-2-bold',
          onClick: () => navigate('/admin/analytics')
        }}
        secondaryAction={{
          label: 'User Management',
          icon: 'solar:users-group-rounded-bold',
          onClick: () => navigate('/admin/users')
        }}
        stats={{
          label: 'Total Users',
          value: safeStats.totalUsers
        }}
      />

      {/* Stats Cards */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Total Users"
            value={safeStats.totalUsers}
            icon="solar:users-group-rounded-bold"
            color="bg-primary/10 text-primary"
            subtitle="Registered users"
            trend={{
              value: 5,
              direction: 'up',
              period: 'this week'
            }}
            onClick={() => navigate('/admin/users')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Total Properties"
            value={safeStats.totalProperties}
            icon="solar:home-bold"
            color="bg-blue-100 text-blue-600"
            subtitle="Listed properties"
            onClick={() => navigate('/admin/properties')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Active Listings"
            value={safeStats.activeListings}
            icon="solar:eye-bold"
            color="bg-green-100 text-green-600"
            subtitle="Currently active"
            onClick={() => navigate('/admin/properties?status=active')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Pending Approvals"
            value={safeStats.pendingApprovals}
            icon="solar:clock-circle-bold"
            color="bg-orange-100 text-orange-600"
            subtitle="Awaiting review"
            onClick={() => navigate('/admin/approvals')}
          />
        </GridItem>
      </DashboardGrid>

      {/* Additional Stats Row */}
      <DashboardGrid columns={3} gap="md">
        <GridItem>
          <StatsCard
            title="Total Inquiries"
            value={safeStats.totalInquiries}
            icon="solar:chat-round-dots-bold"
            color="bg-purple-100 text-purple-600"
            subtitle="Platform inquiries"
            trend={{
              value: 12,
              direction: 'up',
              period: 'this month'
            }}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="System Health"
            value={safeStats.systemHealth}
            icon="solar:shield-check-bold"
            color="bg-teal-100 text-teal-600"
            subtitle="Performance score"
            trend={{
              value: 2,
              direction: 'up',
              period: 'today'
            }}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Revenue"
            value={25000}
            icon="solar:dollar-minimalistic-bold"
            color="bg-emerald-100 text-emerald-600"
            subtitle="This month"
            trend={{
              value: 15,
              direction: 'up',
              period: 'vs last month'
            }}
          />
        </GridItem>
      </DashboardGrid>

      {/* Quick Actions */}
      <QuickActions
        actions={quickActions}
        title="Administrative Actions"
        columns={3}
      />
    </div>
  );
}