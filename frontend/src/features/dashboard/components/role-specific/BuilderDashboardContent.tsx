import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import type { BuilderDashboardStats, QuickAction, Project } from '@/features/dashboard/types/dashboard';

interface BuilderDashboardContentProps {
  stats: BuilderDashboardStats;
  recentProjects: Project[];
  isLoading?: boolean;
}

export function BuilderDashboardContent({ 
  stats, 
  recentProjects: _, 
  isLoading = false 
}: BuilderDashboardContentProps) {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();

  // Provide default values for stats to prevent undefined errors
  const safeStats = {
    totalProjects: stats?.totalProjects || 0,
    activeProjects: stats?.activeProjects || 0,
    unitsListed: stats?.unitsListed || 0,
    unitsAvailable: stats?.unitsAvailable || 0,
    totalInquiries: stats?.totalInquiries || 0,
    messages: stats?.messages || 0
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Start a new construction project',
      icon: 'solar:hammer-bold',
      action: () => navigate('/builder/new-project'),
      color: 'bg-primary',
      isEnabled: true
    },
    {
      id: 'project-portfolio',
      title: 'Project Portfolio',
      description: 'Manage all construction projects',
      icon: 'solar:buildings-2-bold',
      action: () => navigate('/builder/projects'),
      color: 'bg-blue-600',
      isEnabled: true,
      badge: safeStats.totalProjects > 0 ? safeStats.totalProjects : undefined
    },
    {
      id: 'unit-management',
      title: 'Unit Management',
      description: 'Manage project units and availability',
      icon: 'solar:home-2-bold',
      action: () => navigate('/builder/units'),
      color: 'bg-green-600',
      isEnabled: true,
      badge: safeStats.unitsAvailable > 0 ? safeStats.unitsAvailable : undefined
    },
    {
      id: 'buyer-communication',
      title: 'Buyer Communication',
      description: 'Messages and project inquiries',
      icon: 'solar:letter-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'bg-indigo-600',
      isEnabled: true,
      badge: safeStats.messages > 0 ? safeStats.messages : undefined
    },
    // {
    //   id: 'project-analytics',
    //   title: 'Project Analytics',
    //   description: 'View project performance metrics',
    //   icon: 'solar:chart-2-bold',
    //   action: () => navigate('/builder/analytics'),
    //   color: 'bg-purple-600',
    //   isEnabled: true
    // },
    {
      id: 'bulk-units',
      title: 'Bulk Add Units',
      description: 'Add multiple units to projects',
      icon: 'solar:upload-bold',
      action: () => navigate('/builder/bulk-units'),
      color: 'bg-orange-600',
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
        roleSpecificMessage="Manage your construction projects and development portfolio"
        primaryAction={{
          label: 'New Project',
          icon: 'solar:hammer-bold',
          onClick: () => navigate('/builder/new-project')
        }}
        secondaryAction={{
          label: 'View Projects',
          icon: 'solar:buildings-2-bold',
          onClick: () => navigate('/builder/projects')
        }}
        stats={{
          label: 'Active Projects',
          value: safeStats.activeProjects
        }}
      />

      {/* Stats Cards */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Active Projects"
            value={safeStats.activeProjects}
            total={safeStats.totalProjects}
            icon="solar:buildings-2-bold"
            color="bg-primary/10 text-primary"
            subtitle={`${safeStats.totalProjects} total projects`}
            onClick={() => navigate('/builder/projects')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Units Available"
            value={safeStats.unitsAvailable}
            total={safeStats.unitsListed}
            icon="solar:home-2-bold"
            color="bg-blue-100 text-blue-600"
            subtitle={`${safeStats.unitsListed} total units`}
            onClick={() => navigate('/builder/units')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Inquiries"
            value={safeStats.totalInquiries}
            icon="solar:chat-round-bold"
            color="bg-orange-100 text-orange-600"
            subtitle="This month"
            trend={{
              value: 8,
              direction: 'up',
              period: 'this week'
            }}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Messages"
            value={safeStats.messages}
            icon="solar:letter-bold"
            color="bg-green-100 text-green-600"
            subtitle="Unread messages"
            onClick={() => navigate('/dashboard/messages')}
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