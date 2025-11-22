import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';
import { agentAnalyticsService } from '../services/agentAnalyticsService';
import { PerformanceMetrics, UserAnalytics } from '../types';
import AgentStatsCard from './AgentStatsCard';

const PerformanceAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  // const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [propertyMetrics, setPropertyMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await agentAnalyticsService.fetchUserAnalytics();
      setUserAnalytics(analytics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyMetrics = async (propertyId: number) => {
    try {
      const metrics = await agentAnalyticsService.fetchPropertyMetrics(propertyId);
      setPropertyMetrics(metrics);
      // setSelectedProperty(propertyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property metrics');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:chart-2-bold" className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Performance Analytics</h1>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <AgentStatsCard key={i} label="" value={0} loading={true} />
          ))}
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-48"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!userAnalytics) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No analytics data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon icon="solar:chart-2-bold" className="size-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
            Real-time Data
          </Badge>
        </div>
        <Button onClick={fetchUserAnalytics} className="gap-2">
          <Icon icon="solar:refresh-bold" className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AgentStatsCard
          label="Total Properties"
          value={userAnalytics.summary.totalProperties}
          icon="solar:home-bold"
          color="primary"
          subtitle={`${userAnalytics.summary.activeProperties} active`}
          onClick={() => {/* Navigate to properties */}}
        />

        <AgentStatsCard
          label="Featured Listings"
          value={userAnalytics.summary.featuredProperties}
          icon="solar:star-bold"
          color="warning"
          subtitle="Premium listings"
        />

        <AgentStatsCard
          label="Total Views"
          value={userAnalytics.summary.totalViews}
          icon="solar:eye-bold"
          color="info"
          subtitle="All-time views"
        />

        <AgentStatsCard
          label="Avg Views/Property"
          value={userAnalytics.summary.avgViewsPerProperty}
          icon="solar:chart-bold"
          color="success"
          subtitle="Performance metric"
        />
      </div>

      {/* Enhanced Top Performing Properties */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon icon="solar:buildings-2-bold" className="size-5 text-primary" />
              </div>
              Top Performing Properties
              <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
                {userAnalytics.topProperties.length}
              </Badge>
            </CardTitle>
          </div>
          <CardDescription>Your highest viewed and most engaging listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userAnalytics.topProperties.map((property, index) => (
              <Card
                key={property.id}
                className={cn(
                  "border-0 bg-gradient-to-r from-card to-card/50 hover:shadow-md transition-all duration-300 cursor-pointer group",
                  index === 0 && "ring-2 ring-primary/20 bg-gradient-to-r from-primary/5 to-primary/2"
                )}
                onClick={() => fetchPropertyMetrics(property.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Ranking Badge */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-primary text-primary-foreground" :
                      index === 1 ? "bg-orange-500 text-white" :
                      index === 2 ? "bg-amber-500 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    
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
                            ${property.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {property.isFeatured && (
                            <Badge className="bg-warning/10 text-warning border-warning/20">
                              <Icon icon="solar:star-bold" className="size-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {!property.isActive && (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:eye-bold" className="size-4" />
                          {property.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:tag-bold" className="size-4" />
                          {property.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:document-text-bold" className="size-4" />
                          {property.listingType}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon icon="solar:chart-bold" className="size-4" />
                      View Metrics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {userAnalytics.topProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Icon icon="solar:chart-2-bold" className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Performance Data</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Add some properties to start tracking performance metrics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Property Performance Details */}
      {propertyMetrics && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon icon="solar:document-text-bold" className="size-5 text-primary" />
              </div>
              Property Performance Details
              <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
                Property #{propertyMetrics.propertyId}
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive analytics and insights for this property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AgentStatsCard
                label="Performance Score"
                value={`${propertyMetrics.performanceScore}%`}
                icon={propertyMetrics.performanceScore >= 70 ? "solar:trending-up-bold" : "solar:trending-down-bold"}
                color={propertyMetrics.performanceScore >= 70 ? "success" : "warning"}
                subtitle="Overall rating"
                trend={{
                  value: propertyMetrics.performanceScore >= 70 ? 5.2 : -2.1,
                  direction: propertyMetrics.performanceScore >= 70 ? 'up' : 'down',
                  period: 'vs average'
                }}
              />

              <AgentStatsCard
                label="Avg Views/Day"
                value={propertyMetrics.avgViewsPerDay.toFixed(1)}
                icon="solar:eye-bold"
                color="info"
                subtitle="Daily engagement"
              />

              <AgentStatsCard
                label="Days Listed"
                value={propertyMetrics.daysSinceListing}
                icon="solar:calendar-bold"
                color="primary"
                subtitle="Time on market"
              />
            </div>

            {/* Enhanced Market Comparison */}
            <Card className="border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon icon="solar:chart-2-bold" className="size-5 text-primary" />
                  Market Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Similar Properties Average</p>
                    <p className="text-2xl font-bold text-primary">
                      {propertyMetrics.comparisonData.avgViewsOfSimilarProperties}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      views per property
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Properties Compared</p>
                    <p className="text-2xl font-bold text-foreground">
                      {propertyMetrics.comparisonData.totalSimilarProperties}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      similar listings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recommendations */}
            <Card className="border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon icon="solar:lightbulb-bold" className="size-5 text-primary" />
                  AI Recommendations
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {propertyMetrics.recommendations.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {propertyMetrics.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon icon="solar:check-circle-bold" className="size-4 text-primary" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceAnalytics;