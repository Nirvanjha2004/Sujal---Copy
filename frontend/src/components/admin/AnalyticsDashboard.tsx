import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/shared/lib/api';

interface TrafficData {
  totalPageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  referralSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

interface LeadData {
  totalLeads: number;
  leadConversionRate: number;
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  leadsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  topPerformingProperties: Array<{
    id: number;
    title: string;
    leads: number;
    conversions: number;
  }>;
}

interface ListingData {
  totalActiveListings: number;
  newListingsThisMonth: number;
  expiredListings: number;
  featuredListings: number;
  averageListingViews: number;
  listingsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  listingsByCity: Array<{
    city: string;
    count: number;
    averagePrice: number;
  }>;
}

export function EnhancedAnalyticsDashboard() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [selectedRange, setSelectedRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching analytics for range:', selectedRange);
      
      // Fetch all analytics data from backend
      const [trafficResponse, leadResponse, listingResponse] = await Promise.all([
        api.admin.getTrafficAnalytics(selectedRange).catch(err => {
          console.warn('Traffic analytics not available:', err);
          return null;
        }),
        api.admin.getLeadAnalytics(selectedRange).catch(err => {
          console.warn('Lead analytics not available:', err);
          return null;
        }),
        api.admin.getListingAnalytics(selectedRange).catch(err => {
          console.warn('Listing analytics not available:', err);
          return null;
        }),
      ]);

      if (trafficResponse?.data) {
        setTrafficData(trafficResponse.data);
      }
      
      if (leadResponse?.data) {
        setLeadData(leadResponse.data);
      }
      
      if (listingResponse?.data) {
        setListingData(listingResponse.data);
      }

      console.log('✅ Analytics data loaded successfully');
    } catch (error: any) {
      console.error('❌ Error fetching analytics:', error);
      setError(error.message || 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="solar:loading-bold" className="size-8 animate-spin" />
        <span className="ml-4">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon icon="solar:danger-triangle-bold" className="size-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchAnalyticsData}>
          <Icon icon="solar:refresh-bold" className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into traffic, leads, and listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold" className="size-4" />
          </Button>
        </div>
      </div>

      {/* Traffic Analytics */}
      {trafficData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="solar:chart-2-bold" className="mr-2" />
              Traffic Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{trafficData.totalPageViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Page Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{trafficData.uniqueVisitors.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Unique Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{trafficData.bounceRate}%</div>
                <div className="text-sm text-muted-foreground">Bounce Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.floor(trafficData.avgSessionDuration / 60)}m {trafficData.avgSessionDuration % 60}s</div>
                <div className="text-sm text-muted-foreground">Avg Session</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Top Pages */}
              <div>
                <h4 className="font-semibold mb-3">Top Pages</h4>
                <div className="space-y-2">
                  {trafficData.topPages?.map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{page.path}</span>
                      <span className="text-sm font-medium">{page.views.toLocaleString()}</span>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data available</p>}
                </div>
              </div>

              {/* Referral Sources */}
              <div>
                <h4 className="font-semibold mb-3">Referral Sources</h4>
                <div className="space-y-2">
                  {trafficData.referralSources?.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{source.source}</span>
                      <span className="text-sm font-medium">{source.percentage}%</span>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data available</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="solar:chart-2-bold" className="mr-2" />
              Traffic Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">Traffic analytics not available</p>
          </CardContent>
        </Card>
      )}

      {/* Lead Analytics */}
      {leadData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="solar:users-group-rounded-bold" className="mr-2" />
              Lead Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{leadData.totalLeads}</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{leadData.leadConversionRate}%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{leadData.leadsByStatus?.find(s => s.status === 'closed')?.count || 0}</div>
                <div className="text-sm text-muted-foreground">Converted</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Lead Sources */}
              <div>
                <h4 className="font-semibold mb-3">Lead Sources</h4>
                <div className="space-y-2">
                  {leadData.leadsBySource?.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{source.source}</span>
                      <span className="text-sm font-medium">{source.count} ({source.percentage}%)</span>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data available</p>}
                </div>
              </div>

              {/* Top Properties */}
              <div>
                <h4 className="font-semibold mb-3">Top Performing Properties</h4>
                <div className="space-y-2">
                  {leadData.topPerformingProperties?.map((property, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{property.title}</div>
                      <div className="text-muted-foreground">{property.leads} leads, {property.conversions} conversions</div>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data available</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="solar:users-group-rounded-bold" className="mr-2" />
              Lead Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">Lead analytics not available</p>
          </CardContent>
        </Card>
      )}

      {/* Listing Analytics */}
      {listingData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="solar:home-bold" className="mr-2" />
              Listing Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{listingData.totalActiveListings}</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{listingData.newListingsThisMonth}</div>
                <div className="text-sm text-muted-foreground">New This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{listingData.featuredListings}</div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{listingData.averageListingViews}</div>
                <div className="text-sm text-muted-foreground">Avg Views</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Listings by Type */}
              <div>
                <h4 className="font-semibold mb-3">By Property Type</h4>
                <div className="space-y-2">
                  {listingData.listingsByType?.map((type, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{type.type}</span>
                      <span className="text-sm font-medium">{type.count} ({type.percentage.toFixed(1)}%)</span>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data available</p>}
                </div>
              </div>

              {/* Listings by City */}
              <div>
                <h4 className="font-semibold mb-3">By City</h4>
                <div className="space-y-2">
                  {listingData.listingsByCity?.map((city, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{city.city}</span>
                        <span>{city.count} listings</span>
                      </div>
                      <div className="text-muted-foreground">Avg: ₹{(city.averagePrice / 100000).toFixed(1)}L</div>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data available</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="solar:home-bold" className="mr-2" />
              Listing Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">Listing analytics not available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}