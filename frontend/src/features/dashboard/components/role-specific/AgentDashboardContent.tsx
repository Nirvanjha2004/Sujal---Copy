import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { WelcomeSection } from '../common/WelcomeSection';
import { StatsCard } from '../common/StatsCard';
import { QuickActions } from '../common/QuickActions';
import { DashboardGrid, GridItem } from '../common/DashboardGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';
import type { AgentDashboardStats } from '@/features/dashboard/types/dashboard';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange' | 'teal';
  isEnabled?: boolean;
  badge?: string | number;
  priority?: 'high' | 'medium' | 'low';
}

interface AgentDashboardContentProps {
  stats: AgentDashboardStats;
  isLoading?: boolean;
}

interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  target?: number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  color: 'success' | 'warning' | 'error' | 'info';
}

interface RecentProperty {
  id: number;
  title: string;
  price: number;
  type: string;
  status: 'active' | 'sold' | 'rented' | 'pending';
  views: number;
  inquiries: number;
  daysListed: number;
  image?: string;
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

  // Mock performance metrics data (in real app, this would come from API)
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: 12.5,
      target: 15,
      color: 'success'
    },
    {
      id: 'avg-days-market',
      label: 'Avg Days on Market',
      value: 28,
      target: 30,
      color: 'success'
    },
    {
      id: 'client-satisfaction',
      label: 'Client Satisfaction',
      value: 4.8,
      target: 4.5,
      color: 'success'
    },
    {
      id: 'response-time',
      label: 'Avg Response Time',
      value: 2.5,
      target: 4,
      color: 'success'
    }
  ];

  // Mock recent properties data (in real app, this would come from API)
  const recentProperties: RecentProperty[] = [
    {
      id: 1,
      title: '3BHK Luxury Apartment in Bandra',
      price: 25000000,
      type: 'Apartment',
      status: 'active',
      views: 245,
      inquiries: 12,
      daysListed: 15
    },
    {
      id: 2,
      title: '2BHK Modern Flat in Andheri',
      price: 18000000,
      type: 'Apartment',
      status: 'pending',
      views: 189,
      inquiries: 8,
      daysListed: 22
    },
    {
      id: 3,
      title: 'Commercial Space in Lower Parel',
      price: 45000000,
      type: 'Commercial',
      status: 'sold',
      views: 156,
      inquiries: 15,
      daysListed: 45
    }
  ];

  // Helper functions for enhanced components
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sold':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rented':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-client-property',
      title: 'Add Client Property',
      description: 'List property for a client',
      icon: 'solar:home-add-bold',
      action: () => navigate('/add-property'),
      color: 'primary',
      isEnabled: true
    },
    {
      id: 'client-portfolio',
      title: 'Client Portfolio',
      description: 'Manage all client properties',
      icon: 'solar:folder-bold',
      action: () => navigate('/my-properties'),
      color: 'info',
      isEnabled: true,
      badge: safeStats.totalListings > 0 ? safeStats.totalListings : undefined
    },
    // {
    //   id: 'lead-management',
    //   title: 'Lead Management',
    //   description: 'Track and convert leads',
    //   icon: 'solar:users-group-rounded-bold',
    //   action: () => navigate('/leads'),
    //   color: 'orange',
    //   isEnabled: true,
    //   badge: safeStats.messages > 0 ? safeStats.messages : undefined
    // },
    {
      id: 'client-communication',
      title: 'Client Communication',
      description: 'Messages and client interactions',
      icon: 'solar:chat-round-dots-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'info',
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
      color: 'purple',
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
        quickActions={[
          {
            label: 'Add Property',
            icon: 'solar:home-add-bold',
            onClick: () => navigate('/add-property')
          },
          {
            label: 'View Analytics',
            icon: 'solar:chart-2-bold',
            onClick: () => navigate('/agent/analytics'),
            variant: 'outline'
          }
        ]}
        stats={[{
          label: 'Active Listings',
          value: safeStats.activeListings,
          icon: 'solar:eye-bold',
          color: 'text-primary'
        }]}
      />

      {/* Enhanced Stats Cards */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Total Listings"
            value={safeStats.totalListings}
            icon="solar:home-bold"
            color="primary"
            subtitle="Properties listed"
            onClick={() => navigate('/my-properties')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Active Listings"
            value={safeStats.activeListings}
            icon="solar:eye-bold"
            color="info"
            subtitle="Currently active"
            onClick={() => navigate('/my-properties?status=active')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Sold Properties"
            value={safeStats.soldListings || 0}
            icon="solar:check-circle-bold"
            color="success"
            subtitle="Successfully sold"
            onClick={() => navigate('/my-properties?status=SOLD')}
          />
        </GridItem>
        
        <GridItem>
          <StatsCard
            title="Rented Properties"
            value={safeStats.rentedListings || 0}
            icon="solar:key-bold"
            color="warning"
            subtitle="Successfully rented"
            onClick={() => navigate('/my-properties?status=RENTED')}
          />
        </GridItem>
      </DashboardGrid>

      {/* Performance Metrics Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:chart-2-bold" className="size-5 text-primary" />
            </div>
            Performance Metrics
            <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
              This Month
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardGrid columns={4} gap="md">
            {performanceMetrics.map((metric) => (
              <GridItem key={metric.id}>
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        {metric.target && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-background/50"
                          >
                            Target: {metric.target}{metric.id === 'client-satisfaction' ? '/5' : metric.id === 'conversion-rate' ? '%' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-foreground">
                          {metric.value}
                          {metric.id === 'conversion-rate' ? '%' : 
                           metric.id === 'client-satisfaction' ? '/5' :
                           metric.id === 'response-time' ? 'h' : ''}
                        </p>
                        {metric.trend && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                            metric.trend.direction === 'up' ? 'text-success bg-success/10' :
                            metric.trend.direction === 'down' ? 'text-destructive bg-destructive/10' :
                            'text-muted-foreground bg-muted/50'
                          )}>
                            <Icon 
                              icon={
                                metric.trend.direction === 'up' ? 'solar:arrow-up-bold' :
                                metric.trend.direction === 'down' ? 'solar:arrow-down-bold' :
                                'solar:minus-bold'
                              }
                              className="size-3"
                            />
                            {Math.abs(metric.trend.value)}
                            {metric.id === 'conversion-rate' || metric.id === 'client-satisfaction' ? '' : 
                             metric.id === 'response-time' ? 'h' : ''}
                          </div>
                        )}
                      </div>
                      
                      {metric.trend && (
                        <p className="text-xs text-muted-foreground">
                          {metric.trend.period}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </GridItem>
            ))}
          </DashboardGrid>
        </CardContent>
      </Card>

      {/* Recent Properties Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon icon="solar:buildings-2-bold" className="size-5 text-primary" />
              </div>
              Recent Properties
              <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
                {recentProperties.length}
              </Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/my-properties')}
              className="gap-2"
            >
              <Icon icon="solar:eye-bold" className="size-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProperties.map((property) => (
              <Card 
                key={property.id}
                className="border-0 bg-gradient-to-r from-card to-card/50 hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Property Image Placeholder */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                      <Icon icon="solar:home-2-bold" className="size-8 text-primary" />
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {property.title}
                          </h3>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(property.price)}
                          </p>
                        </div>
                        <Badge 
                          className={cn(
                            "text-xs font-medium border",
                            getStatusColor(property.status)
                          )}
                        >
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:eye-bold" className="size-4" />
                          {property.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:chat-round-dots-bold" className="size-4" />
                          {property.inquiries} inquiries
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:calendar-bold" className="size-4" />
                          {property.daysListed} days listed
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:tag-bold" className="size-4" />
                          {property.type}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Icon 
                        icon="solar:arrow-right-bold" 
                        className="size-5 text-muted-foreground group-hover:text-primary transition-colors" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {recentProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Icon icon="solar:home-2-bold" className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed mb-4">
                Start building your portfolio by adding your first property listing.
              </p>
              <Button onClick={() => navigate('/add-property')} className="gap-2">
                <Icon icon="solar:home-add-bold" className="size-4" />
                Add Property
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions
        actions={quickActions}
        title="Quick Actions"
        columns={3}
      />
    </div>
  );
}