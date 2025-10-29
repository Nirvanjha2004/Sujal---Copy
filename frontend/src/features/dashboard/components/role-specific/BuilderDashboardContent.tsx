import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { BuilderDashboardStats, Project } from '@/features/dashboard/types/dashboard';

interface BuilderDashboardContentProps {
  stats: BuilderDashboardStats;
  recentProjects: Project[];
  isLoading?: boolean;
}

// Enhanced Project Overview Card Component
function ProjectOverviewCard({
  project,
  onClick
}: {
  project: Project;
  onClick: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'under_construction':
        return 'bg-success/10 text-success border-success/20';
      case 'planning':
      case 'pre_launch':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'on_hold':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'under_construction':
        return 'solar:hammer-bold';
      case 'planning':
        return 'solar:document-bold';
      case 'pre_launch':
        return 'solar:rocket-bold';
      case 'completed':
        return 'solar:check-circle-bold';
      case 'on_hold':
        return 'solar:pause-circle-bold';
      default:
        return 'solar:buildings-2-bold';
    }
  };

  const completionPercentage = project.units > 0 ? Math.round((project.sold / project.units) * 100) : 0;

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-gradient-to-br from-card to-card/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Icon icon="solar:map-point-bold" className="size-4" />
              {project.location}
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200",
            getStatusColor(project.status)
          )}>
            <Icon icon={getStatusIcon(project.status)} className="size-3" />
            {project.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Project Phase */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Phase:</span>
            <span className="font-medium text-foreground">{project.phase}</span>
          </div>

          {/* Units Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Units Progress</span>
              <span className="font-semibold text-foreground">
                {project.sold}/{project.units} ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{project.units}</div>
              <div className="text-xs text-muted-foreground">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">{project.sold}</div>
              <div className="text-xs text-muted-foreground">Sold</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{project.units - project.sold}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Project Statistics Section
function ProjectStatisticsSection({ stats }: { stats: BuilderDashboardStats }) {
  const statisticsData = [
    {
      label: 'Project Completion Rate',
      value: stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0,
      suffix: '%',
      icon: 'solar:chart-2-bold',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Unit Availability',
      value: stats.unitsListed > 0 ? Math.round((stats.unitsAvailable / stats.unitsListed) * 100) : 0,
      suffix: '%',
      icon: 'solar:home-2-bold',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Inquiry Response Rate',
      value: 92, // This would come from actual data
      suffix: '%',
      icon: 'solar:chat-round-bold',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon icon="solar:chart-2-bold" className="size-5 text-primary" />
          Project Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statisticsData.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <Icon icon={stat.icon} className={cn("size-5", stat.color)} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function BuilderDashboardContent({
  stats,
  recentProjects,
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

  // Enhanced quick actions with better visual indicators
  const quickActions = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Start a new construction project',
      icon: 'solar:hammer-bold',
      action: () => navigate('/builder/new-project'),
      color: 'primary' as const,
      isEnabled: true,
      priority: 'high' as const
    },
    {
      id: 'project-portfolio',
      title: 'Project Portfolio',
      description: 'Manage all construction projects',
      icon: 'solar:buildings-2-bold',
      action: () => navigate('/builder/projects'),
      color: 'info' as const,
      isEnabled: true,
      badge: safeStats.totalProjects > 0 ? safeStats.totalProjects : undefined,
      priority: 'high' as const
    },
    {
      id: 'unit-management',
      title: 'Unit Management',
      description: 'Manage project units and availability',
      icon: 'solar:home-2-bold',
      action: () => navigate('/builder/units'),
      color: 'success' as const,
      isEnabled: true,
      badge: safeStats.unitsAvailable > 0 ? safeStats.unitsAvailable : undefined,
      priority: 'medium' as const
    },
    {
      id: 'buyer-communication',
      title: 'Buyer Communication',
      description: 'Messages and project inquiries',
      icon: 'solar:letter-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'purple' as const,
      isEnabled: true,
      badge: safeStats.messages > 0 ? safeStats.messages : undefined,
      priority: 'medium' as const
    },
    {
      id: 'bulk-units',
      title: 'Bulk Add Units',
      description: 'Add multiple units to projects',
      icon: 'solar:upload-bold',
      action: () => navigate('/builder/bulk-units'),
      color: 'orange' as const,
      isEnabled: true,
      priority: 'low' as const
    },
    {
      id: 'project-analytics',
      title: 'Project Analytics',
      description: 'View project performance metrics',
      icon: 'solar:chart-2-bold',
      action: () => navigate('/builder/analytics'),
      color: 'teal' as const,
      isEnabled: true,
      priority: 'low' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <WelcomeSection
        user={user!}
        roleSpecificMessage="Manage your construction projects and development portfolio with modern tools"
        quickActions={[
          {
            label: 'New Project',
            icon: 'solar:hammer-bold',
            onClick: () => navigate('/builder/new-project')
          },
          {
            label: 'View Portfolio',
            icon: 'solar:buildings-2-bold',
            onClick: () => navigate('/builder/projects'),
            variant: 'outline'
          }
        ]}
        stats={[
          {
            label: 'Active Projects',
            value: safeStats.activeProjects,
            icon: 'solar:buildings-2-bold',
            color: 'text-primary'
          }
        ]}
      />

      {/* Enhanced Stats Cards with better visual hierarchy */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Active Projects"
            value={safeStats.activeProjects}
            total={safeStats.totalProjects}
            icon="solar:buildings-2-bold"
            color="primary"
            subtitle={`${safeStats.totalProjects} total projects`}
            trend={{
              value: 12,
              direction: 'up',
              period: 'this quarter'
            }}
            onClick={() => navigate('/builder/projects')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Units Available"
            value={safeStats.unitsAvailable}
            total={safeStats.unitsListed}
            icon="solar:home-2-bold"
            color="success"
            subtitle={`${safeStats.unitsListed} total units`}
            trend={{
              value: 5,
              direction: 'down',
              period: 'this month'
            }}
            onClick={() => navigate('/builder/units')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Project Inquiries"
            value={safeStats.totalInquiries}
            icon="solar:chat-round-bold"
            color="warning"
            subtitle="This month"
            trend={{
              value: 18,
              direction: 'up',
              period: 'this week'
            }}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Unread Messages"
            value={safeStats.messages}
            icon="solar:letter-bold"
            color="info"
            subtitle="Requires attention"
            onClick={() => navigate('/dashboard/messages')}
          />
        </GridItem>
      </DashboardGrid>

      {/* Project Management Section */}
      <DashboardGrid columns={2} gap="lg">
        <GridItem>
          {/* Recent Projects Overview */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon icon="solar:buildings-2-bold" className="size-5 text-primary" />
                  Recent Projects
                </CardTitle>
                <button
                  onClick={() => navigate('/builder/projects')}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects && recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.slice(0, 3).map((project) => (
                    <ProjectOverviewCard
                      key={project.id}
                      project={project}
                      onClick={() => navigate(`/builder/projects/${project.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="solar:buildings-2-bold" className="size-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <button
                    onClick={() => navigate('/builder/new-project')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    <Icon icon="solar:hammer-bold" className="size-4" />
                    Create Your First Project
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </GridItem>

        <GridItem>
          {/* Project Statistics */}
          <ProjectStatisticsSection stats={safeStats} />
        </GridItem>
      </DashboardGrid>

      {/* Enhanced Quick Actions with better organization */}
      <QuickActions
        actions={quickActions}
        title="Project Management Tools"
        columns={3}
      />
    </div>
  );
}