import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import type { AgentDashboardStats, QuickAction } from '@/features/dashboard/types/dashboard';

interface AgentDashboardContentProps {
  stats: AgentDashboardStats;
  isLoading?: boolean;
}

export function AgentDashboardContent({ stats, isLoading = false }: AgentDashboardContentProps) {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();

  // Provide default values for stats to prevent undefined errors
  const safeStats = {
    totalListings: stats?.totalListings || 0,
    activeListings: stats?.activeListings || 0,
    soldListings: stats?.soldListings || 0,
    rentedListings: stats?.rentedListings || 0,
    messages: stats?.messages || 0
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-client-property',
      title: 'Add Client Property',
      description: 'List property for a client',
      icon: 'solar:home-add-bold',
      action: () => navigate('/add-property'),
      color: 'bg-primary',
      isEnabled: true
    },
    {
      id: 'client-portfolio',
      title: 'Client Portfolio',
      description: 'Manage all client properties',
      icon: 'solar:folder-bold',
      action: () => navigate('/my-properties'),
      color: 'bg-blue-600',
      isEnabled: true,
      badge: safeStats.totalListings > 0 ? safeStats.totalListings : undefined
    },
    {
      id: 'lead-management',
      title: 'Lead Management',
      description: 'Track and convert leads',
      icon: 'solar:users-group-rounded-bold',
      action: () => navigate('/leads'),
      color: 'bg-orange-600',
      isEnabled: true,
      badge: safeStats.inquiries > 0 ? safeStats.inquiries : undefined
    },
    {
      id: 'client-communication',
      title: 'Client Communication',
      description: 'Messages and client interactions',
      icon: 'solar:chat-round-dots-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'bg-indigo-600',
      isEnabled: true,
      badge: safeStats.messages > 0 ? safeStats.messages : undefined
    },
    // {
    //   id: 'performance-analytics',
    //   title: 'Performance Analytics',
    //   description: 'View your sales performance',
    //   icon: 'solar:chart-2-bold',
    //   action: () => navigate('/agent/analytics'),
    //   color: 'bg-green-600',
    //   isEnabled: true
    // },
    {
      id: 'bulk-upload',
      title: 'Bulk Upload Properties',
      description: 'Upload multiple properties via CSV',
      icon: 'solar:upload-bold',
      action: () => navigate('/agent/bulk-upload'),
      color: 'bg-purple-600',
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
        roleSpecificMessage="Manage your clients and grow your property portfolio"
        primaryAction={{
          label: 'Add Property',
          icon: 'solar:home-add-bold',
          onClick: () => navigate('/add-property')
        }}
        secondaryAction={{
          label: 'View Analytics',
          icon: 'solar:chart-2-bold',
          onClick: () => navigate('/agent/analytics')
        }}
        stats={{
          label: 'Active Listings',
          value: safeStats.activeListings
        }}
      />

      {/* Stats Cards */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Total Listings"
            value={safeStats.totalListings}
            icon="solar:home-bold"
            color="bg-primary/10 text-primary"
            subtitle="Properties listed"
            onClick={() => navigate('/my-properties')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Active Listings"
            value={safeStats.activeListings}
            icon="solar:eye-bold"
            color="bg-blue-100 text-blue-600"
            subtitle="Currently active"
            onClick={() => navigate('/my-properties?status=active')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Sold Properties"
            value={safeStats.soldListings || 0}
            icon="solar:check-circle-bold"
            color="bg-green-100 text-green-600"
            subtitle="Successfully sold"
            onClick={() => navigate('/my-properties?status=SOLD')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Rented Properties"
            value={safeStats.rentedListings || 0}
            icon="solar:key-bold"
            color="bg-purple-100 text-purple-600"
            subtitle="Successfully rented"
            onClick={() => navigate('/my-properties?status=RENTED')}
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