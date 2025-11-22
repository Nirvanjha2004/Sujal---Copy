import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsData {
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    averageSessionDuration: number;
  };
  leads: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
  };
  listings: {
    totalListings: number;
    activeListings: number;
    averageViews: number;
  };
}

export function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trafficResponse, leadResponse, listingResponse] = await Promise.all([
        analyticsService.getTrafficAnalytics(timeRange),
        analyticsService.getLeadAnalytics(timeRange),
        analyticsService.getListingAnalytics(timeRange)
      ]);

      if (trafficResponse.success && leadResponse.success && listingResponse.success) {
        setData({
          traffic: trafficResponse.data,
          leads: leadResponse.data,
          listings: listingResponse.data
        });
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <Icon icon="solar:danger-triangle-bold" className="size-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchAnalytics}>
          <Icon icon="solar:refresh-bold" className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track platform performance and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={fetchAnalytics} variant="outline">
            <Icon icon="solar:refresh-bold" className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* Traffic Analytics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Traffic Analytics</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Icon icon="solar:eye-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.traffic.pageViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total page views in selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                  <Icon icon="solar:users-group-rounded-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.traffic.uniqueVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique visitors in selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  <Icon icon="solar:logout-2-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.traffic.bounceRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Percentage of single-page sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                  <Icon icon="solar:clock-circle-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(data.traffic.averageSessionDuration / 60)}m {data.traffic.averageSessionDuration % 60}s
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average time spent on site
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lead Analytics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Lead Analytics</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Icon icon="solar:user-plus-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.leads.totalLeads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total leads generated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Converted Leads</CardTitle>
                  <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.leads.convertedLeads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully converted leads
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Icon icon="solar:chart-2-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.leads.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Lead to conversion rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Listing Analytics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Listing Analytics</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <Icon icon="solar:home-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.listings.totalListings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total property listings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Icon icon="solar:eye-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.listings.activeListings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active listings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Views</CardTitle>
                  <Icon icon="solar:chart-square-bold" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.listings.averageViews.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Average views per listing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}