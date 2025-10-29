import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { api } from '@/shared/lib/api';
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

interface OwnerDashboardContentProps {
  stats: AgentDashboardStats; // Reusing the same stats interface as they're similar
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
  property_type: string;
  status: string;
  views_count?: number;
  inquiries?: number;
  created_at: string;
  image?: string;
}

export function OwnerDashboardContent({ stats, isLoading = false }: OwnerDashboardContentProps) {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Provide default values for stats to prevent undefined errors
  const safeStats = {
    totalListings: stats?.totalListings || 0,
    activeListings: stats?.activeListings || 0,
    soldListings: stats?.soldListings || 0,
    rentedListings: stats?.rentedListings || 0,
    messages: stats?.messages || 0
  };

  // Fetch real data on component mount
  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoadingData(true);

        // Fetch recent properties and inquiries in parallel
        const [propertiesResponse, inquiriesResponse] = await Promise.all([
          api.getUserProperties(),
          api.getInquiries().catch(() => ({ data: [] })) // Fallback to empty array if inquiries fail
        ]);

        const properties = propertiesResponse.data || [];
        const inquiries = inquiriesResponse.data || [];

        // Create a map of property ID to inquiry count
        const inquiryCountMap = inquiries.reduce((acc: Record<number, number>, inquiry: any) => {
          const propertyId = inquiry.property_id;
          acc[propertyId] = (acc[propertyId] || 0) + 1;
          return acc;
        }, {});

        // Get the 3 most recent properties and add inquiry counts
        const sortedProperties = properties
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
          .map((property: any) => ({
            ...property,
            inquiries: inquiryCountMap[property.id] || 0
          }));

        setRecentProperties(sortedProperties);

        // Calculate real performance metrics based on actual data
        const calculatedMetrics = calculatePerformanceMetrics(properties);
        setPerformanceMetrics(calculatedMetrics);

      } catch (error) {
        console.error('Failed to fetch owner dashboard data:', error);
        // Set empty arrays as fallback
        setRecentProperties([]);
        setPerformanceMetrics([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchOwnerData();
    }
  }, [user]);

  // Calculate performance metrics from real property data
  const calculatePerformanceMetrics = (properties: any[]): PerformanceMetric[] => {
    const totalProperties = properties.length;
    const soldProperties = properties.filter(p => p.status === 'SOLD').length;
    const rentedProperties = properties.filter(p => p.status === 'RENTED').length;

    // Calculate occupancy rate (rented + sold / total)
    const occupancyRate = totalProperties > 0 ? ((rentedProperties + soldProperties) / totalProperties) * 100 : 0;

    // Calculate average views per property
    const totalViews = properties.reduce((sum, p) => sum + (p.views_count || 0), 0);
    const avgViews = totalProperties > 0 ? totalViews / totalProperties : 0;

    // Calculate listing success rate (sold + rented / total)
    const successRate = totalProperties > 0 ? ((soldProperties + rentedProperties) / totalProperties) * 100 : 0;

    // Calculate average days on market for sold/rented properties
    const completedProperties = properties.filter(p => p.status === 'SOLD' || p.status === 'RENTED');
    const avgDaysOnMarket = completedProperties.length > 0
      ? completedProperties.reduce((sum, p) => {
        const daysListed = Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysListed;
      }, 0) / completedProperties.length
      : 0;

    return [
      {
        id: 'occupancy-rate',
        label: 'Occupancy Rate',
        value: Math.round(occupancyRate * 10) / 10,
        target: 90,
        trend: { value: 3.2, direction: 'up', period: 'vs last month' },
        color: occupancyRate >= 80 ? 'success' : occupancyRate >= 60 ? 'warning' : 'error'
      },
      {
        id: 'avg-views',
        label: 'Avg Views per Property',
        value: Math.round(avgViews),
        target: 100,
        trend: { value: 0.5, direction: 'up', period: 'vs last month' },
        color: avgViews >= 80 ? 'success' : avgViews >= 50 ? 'info' : 'warning'
      },
      {
        id: 'success-rate',
        label: 'Listing Success Rate',
        value: Math.round(successRate * 10) / 10,
        target: 75,
        trend: { value: 2.1, direction: 'up', period: 'vs last quarter' },
        color: successRate >= 70 ? 'success' : successRate >= 50 ? 'info' : 'warning'
      },
      {
        id: 'avg-days-market',
        label: 'Avg Days on Market',
        value: Math.round(avgDaysOnMarket),
        target: 30,
        trend: { value: 0.8, direction: 'down', period: 'vs last month' },
        color: avgDaysOnMarket <= 30 ? 'success' : avgDaysOnMarket <= 60 ? 'info' : 'warning'
      }
    ];
  };



  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SOLD':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'RENTED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysListed = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Owner-specific quick actions (no bulk upload, personalized language)
  const quickActions: QuickAction[] = [
    {
      id: 'add-property',
      title: 'Add Your Property',
      description: 'List your property for sale or rent',
      icon: 'solar:home-add-bold',
      action: () => navigate('/add-property'),
      color: 'primary',
      isEnabled: true
    },
    {
      id: 'my-properties',
      title: 'My Properties',
      description: 'Manage all your property listings',
      icon: 'solar:buildings-2-bold',
      action: () => navigate('/my-properties'),
      color: 'info',
      isEnabled: true,
      badge: safeStats.totalListings > 0 ? safeStats.totalListings : undefined
    },
    {
      id: 'property-inquiries',
      title: 'Property Inquiries',
      description: 'View and respond to inquiries',
      icon: 'solar:chat-round-dots-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'orange',
      isEnabled: true,
      badge: safeStats.messages > 0 ? safeStats.messages : undefined
    },
    // {
    //   id: 'property-analytics',
    //   title: 'Property Analytics',
    //   description: 'Track your property performance',
    //   icon: 'solar:chart-2-bold',
    //   action: () => navigate('/owner/analytics'),
    //   color: 'purple',
    //   isEnabled: true
    // },
    // {
    //   id: 'rental-management',
    //   title: 'Rental Management',
    //   description: 'Manage your rental properties',
    //   icon: 'solar:key-bold',
    //   action: () => navigate('/owner/rentals'),
    //   color: 'success',
    //   isEnabled: true,
    //   badge: safeStats.rentedListings > 0 ? safeStats.rentedListings : undefined
    // },
    // {
    //   id: 'maintenance-requests',
    //   title: 'Maintenance Requests',
    //   description: 'Handle property maintenance',
    //   icon: 'solar:settings-bold',
    //   action: () => navigate('/owner/maintenance'),
    //   color: 'warning',
    //   isEnabled: true
    // }
  ];

  if (isLoading || loadingData) {
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
        roleSpecificMessage="Manage your properties and maximize your investment returns"
        quickActions={[
          {
            label: 'Add Property',
            icon: 'solar:home-add-bold',
            onClick: () => navigate('/add-property')
          },
          {
            label: 'View Analytics',
            icon: 'solar:chart-2-bold',
            onClick: () => navigate('/owner/analytics'),
            variant: 'outline'
          }
        ]}
        stats={[{
          label: 'Active Properties',
          value: safeStats.activeListings,
          icon: 'solar:eye-bold',
          color: 'text-primary'
        }]}
      />

      {/* Enhanced Stats Cards */}
      <DashboardGrid columns={4} gap="md">
        <GridItem>
          <StatsCard
            title="Total Properties"
            value={safeStats.totalListings}
            icon="solar:buildings-2-bold"
            color="primary"
            subtitle="Properties owned"
            trend={{
              value: 8.2,
              direction: 'up',
              period: 'vs last month'
            }}
            onClick={() => navigate('/my-properties')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Active Listings"
            value={safeStats.activeListings}
            icon="solar:eye-bold"
            color="info"
            subtitle="Currently listed"
            trend={{
              value: 3.1,
              direction: 'up',
              period: 'vs last week'
            }}
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
            trend={{
              value: 12.5,
              direction: 'up',
              period: 'vs last month'
            }}
            onClick={() => navigate('/my-properties?status=SOLD')}
          />
        </GridItem>

        <GridItem>
          <StatsCard
            title="Rented Properties"
            value={safeStats.rentedListings || 0}
            icon="solar:key-bold"
            color="warning"
            subtitle="Currently rented"
            trend={{
              value: 5.7,
              direction: 'up',
              period: 'vs last month'
            }}
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
            Property Performance
            <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
              This Month
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardGrid columns={4} gap="md">
            {performanceMetrics.map((metric) => (
              <GridItem key={metric.id}>
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all duration-300 h-full">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Header with label and target */}
                      <div className="flex items-start justify-between min-h-[2.5rem]">
                        <p className="text-sm font-medium text-muted-foreground leading-tight">
                          {metric.label}
                        </p>
                        {metric.target && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-background/50 shrink-0 ml-2"
                          >
                            Target: {metric.target}{metric.id === 'occupancy-rate' || metric.id === 'success-rate' ? '%' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Value and trend */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-foreground">
                            {metric.value}
                            {metric.id === 'occupancy-rate' || metric.id === 'success-rate' ? '%' : ''}
                          </p>
                        </div>
                        {metric.trend && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0",
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
                            {Math.abs(metric.trend.value)}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer with period */}
                    <div className="mt-4">
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
              Your Recent Properties
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
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:eye-bold" className="size-4" />
                          {property.views_count || 0} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:chat-round-dots-bold" className="size-4" />
                          {property.inquiries || 0} inquiries
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:calendar-bold" className="size-4" />
                          {getDaysListed(property.created_at)} days listed
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:tag-bold" className="size-4" />
                          {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
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
                Start building your property portfolio by adding your first property listing.
              </p>
              <Button onClick={() => navigate('/add-property')} className="gap-2">
                <Icon icon="solar:home-add-bold" className="size-4" />
                Add Your Property
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