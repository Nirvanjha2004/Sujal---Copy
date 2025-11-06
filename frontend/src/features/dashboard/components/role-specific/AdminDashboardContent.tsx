import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

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

// System Health Indicator Component
function SystemHealthIndicator({ 
  health, 
  onClick 
}: { 
  health: number; 
  onClick: () => void; 
}) {
  const getHealthStatus = (score: number) => {
    if (score >= 95) return { status: 'Excellent', color: 'text-success', bgColor: 'bg-success/10', icon: 'solar:shield-check-bold' };
    if (score >= 85) return { status: 'Good', color: 'text-primary', bgColor: 'bg-primary/10', icon: 'solar:shield-bold' };
    if (score >= 70) return { status: 'Fair', color: 'text-warning', bgColor: 'bg-warning/10', icon: 'solar:shield-warning-bold' };
    return { status: 'Poor', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: 'solar:shield-cross-bold' };
  };

  const healthStatus = getHealthStatus(health);

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 bg-gradient-to-br from-card to-card/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Icon icon="solar:shield-check-bold" className="size-5 text-primary" />
            System Health
          </div>
          <Badge className={cn("px-3 py-1", healthStatus.bgColor, healthStatus.color)}>
            {healthStatus.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-foreground">{health}%</span>
            <Icon icon={healthStatus.icon} className={cn("size-8", healthStatus.color)} />
          </div>
          <Progress value={health} className="h-3" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm font-semibold text-success">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary">2.1s</div>
              <div className="text-xs text-muted-foreground">Response</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-warning">45%</div>
              <div className="text-xs text-muted-foreground">CPU Usage</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// User Management Overview Component
function UserManagementOverview({ 
  stats, 
  onViewUsers 
}: { 
  stats: AdminStats; 
  onViewUsers: () => void; 
}) {
  const userTypeData = [
    { type: 'Buyers', count: Math.floor(stats.totalUsers * 0.6), color: 'text-primary', bgColor: 'bg-primary/10' },
    { type: 'Agents', count: Math.floor(stats.totalUsers * 0.25), color: 'text-success', bgColor: 'bg-success/10' },
    { type: 'Builders', count: Math.floor(stats.totalUsers * 0.1), color: 'text-warning', bgColor: 'bg-warning/10' },
    { type: 'Owners', count: Math.floor(stats.totalUsers * 0.05), color: 'text-info', bgColor: 'bg-info/10' }
  ];

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon icon="solar:users-group-rounded-bold" className="size-5 text-primary" />
            User Management
          </CardTitle>
          <button
            onClick={onViewUsers}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            Manage Users
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Registered Users</div>
          </div>
          
          <div className="space-y-3">
            {userTypeData.map((userType, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", userType.bgColor)} />
                  <span className="font-medium text-foreground">{userType.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold", userType.color)}>{userType.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((userType.count / stats.totalUsers) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {stats.pendingApprovals > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 text-warning">
                <Icon icon="solar:clock-circle-bold" className="size-4" />
                <span className="text-sm font-medium">
                  {stats.pendingApprovals} users awaiting approval
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Platform Analytics Overview Component
function PlatformAnalyticsOverview({ 
  onViewAnalytics 
}: { 
  stats: AdminStats; 
  onViewAnalytics: () => void; 
}) {
  const analyticsData = [
    {
      label: 'Property Conversion Rate',
      value: '12.5%',
      trend: { value: 3, direction: 'up' as const },
      icon: 'solar:chart-2-bold',
      color: 'text-success'
    },
    {
      label: 'User Engagement',
      value: '78%',
      trend: { value: 5, direction: 'up' as const },
      icon: 'solar:users-group-rounded-bold',
      color: 'text-primary'
    },
    {
      label: 'Platform Growth',
      value: '+24%',
      trend: { value: 8, direction: 'up' as const },
      icon: 'solar:graph-up-bold',
      color: 'text-warning'
    }
  ];

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon icon="solar:chart-2-bold" className="size-5 text-primary" />
            Platform Analytics
          </CardTitle>
          <button
            onClick={onViewAnalytics}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyticsData.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3">
                <Icon icon={metric.icon} className={cn("size-5", metric.color)} />
                <div>
                  <div className="font-medium text-foreground">{metric.label}</div>
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <Icon icon="solar:arrow-up-bold" className="size-4" />
                +{metric.trend.value}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
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
    systemHealth: stats?.systemHealth || 98
  };

  // Enhanced administrative actions with better categorization
  const quickActions = [
    {
      id: 'pending-users',
      title: 'User Approvals',
      description: 'Review and approve new user registrations',
      icon: 'solar:user-check-bold',
      action: () => navigate('/admin/users'),
      color: 'primary' as const,
      isEnabled: true,
      badge: safeStats.pendingApprovals > 0 ? safeStats.pendingApprovals : undefined,
      priority: 'high' as const,
      category: 'User Management'
    },
    {
      id: 'property-moderation',
      title: 'Property Moderation',
      description: 'Moderate new property listings and updates',
      icon: 'solar:home-2-bold',
      action: () => navigate('/admin/properties'),
      color: 'success' as const,
      isEnabled: true,
      badge: 8, // This would come from API
      priority: 'high' as const,
      category: 'Content Management'
    },
    {
      id: 'system-monitoring',
      title: 'System Monitoring',
      description: 'Monitor platform performance and health',
      icon: 'solar:shield-check-bold',
      action: () => navigate('/admin/analytics'),
      color: 'info' as const,
      isEnabled: true,
      priority: 'medium' as const,
      category: 'System Management'
    },
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'Manage banners, announcements, and site content',
      icon: 'solar:document-text-bold',
      action: () => navigate('/admin/content'),
      color: 'purple' as const,
      isEnabled: true,
      priority: 'medium' as const,
      category: 'Content Management'
    },
    {
      id: 'review-moderation',
      title: 'Review Moderation',
      description: 'Moderate user reviews and feedback',
      icon: 'solar:star-bold',
      action: () => navigate('/admin/reviews'),
      color: 'warning' as const,
      isEnabled: true,
      badge: 3, // This would come from API
      priority: 'medium' as const,
      category: 'Content Management'
    },
    {
      id: 'role-management',
      title: 'Role Management',
      description: 'Assign and manage user roles and permissions',
      icon: 'solar:users-group-rounded-bold',
      action: () => navigate('/admin/roles'),
      color: 'teal' as const,
      isEnabled: true,
      priority: 'low' as const,
      category: 'User Management'
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'View detailed platform analytics and insights',
      icon: 'solar:chart-2-bold',
      action: () => navigate('/admin/analytics'),
      color: 'orange' as const,
      isEnabled: true,
      priority: 'low' as const,
      category: 'Analytics'
    },
    {
      id: 'backup-management',
      title: 'Backup Management',
      description: 'Manage system backups and data recovery',
      icon: 'solar:database-bold',
      action: () => navigate('/admin/backups'),
      color: 'error' as const,
      isEnabled: true,
      priority: 'low' as const,
      category: 'System Management'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="h-64 bg-muted rounded-lg"></div>
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
        roleSpecificMessage="Oversee platform operations and ensure optimal performance for all users"
        quickActions={[
          {
            label: 'View Analytics',
            icon: 'solar:chart-2-bold',
            onClick: () => navigate('/admin/analytics')
          },
          {
            label: 'User Management',
            icon: 'solar:users-group-rounded-bold',
            onClick: () => navigate('/admin/users'),
            variant: 'outline'
          }
        ]}
        stats={[
          {
            label: 'Total Users',
            value: safeStats.totalUsers,
            icon: 'solar:users-group-rounded-bold',
            color: 'text-primary'
          },
          {
            label: 'System Health',
            value: `${safeStats.systemHealth}%`,
            icon: 'solar:shield-check-bold',
            color: 'text-success'
          }
        ]}
      />

      {/* Enhanced System-wide Statistics */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Total Users"
            value={safeStats.totalUsers}
            icon="solar:users-group-rounded-bold"
            color="primary"
            subtitle="Registered users"
            trend={{
              value: 12,
              direction: 'up',
              period: 'this month'
            }}
            onClick={() => navigate('/admin/users')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Total Properties"
            value={safeStats.totalProperties}
            icon="solar:home-bold"
            color="success"
            subtitle="Listed properties"
            trend={{
              value: 8,
              direction: 'up',
              period: 'this week'
            }}
            onClick={() => navigate('/admin/properties')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Active Listings"
            value={safeStats.activeListings}
            icon="solar:eye-bold"
            color="info"
            subtitle="Currently active"
            trend={{
              value: 5,
              direction: 'up',
              period: 'today'
            }}
            onClick={() => navigate('/admin/properties?status=active')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Pending Approvals"
            value={safeStats.pendingApprovals}
            icon="solar:clock-circle-bold"
            color="warning"
            subtitle="Awaiting review"
            onClick={() => navigate('/admin/approvals')}
          />
        </GridItem>
      </DashboardGrid>

      {/* Platform Performance Metrics */}
      <DashboardGrid columns={3} gap="lg">
        <GridItem>
          <StatsCard
            title="Platform Inquiries"
            value={safeStats.totalInquiries}
            icon="solar:chat-round-dots-bold"
            color="warning"
            subtitle="Total inquiries"
            trend={{
              value: 18,
              direction: 'up',
              period: 'this month'
            }}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Monthly Revenue"
            value="₹2,45,000"
            icon="solar:dollar-minimalistic-bold"
            color="success"
            subtitle="This month"
            trend={{
              value: 22,
              direction: 'up',
              period: 'vs last month'
            }}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="User Engagement"
            value="87%"
            icon="solar:graph-up-bold"
            color="info"
            subtitle="Active users"
            trend={{
              value: 4,
              direction: 'up',
              period: 'this week'
            }}
          />
        </GridItem>
      </DashboardGrid>

      {/* Management Overview Section */}
      <DashboardGrid columns={3} gap="lg">
        <GridItem>
          <SystemHealthIndicator 
            health={safeStats.systemHealth} 
            onClick={() => navigate('/admin/analytics')} 
          />
        </GridItem>

        <GridItem>
          <UserManagementOverview 
            stats={safeStats} 
            onViewUsers={() => navigate('/admin/users')} 
          />
        </GridItem>

        <GridItem>
          <PlatformAnalyticsOverview 
            stats={safeStats} 
            onViewAnalytics={() => navigate('/admin/analytics')} 
          />
        </GridItem>
      </DashboardGrid>

      {/* Enhanced Administrative Actions with Categories */}
      <QuickActions
        actions={quickActions}
        title="Administrative Tools"
        columns={4}
        showCategories={true}
        variant="detailed"
      />
    </div>
  );
}