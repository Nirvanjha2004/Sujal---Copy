import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { httpClient } from '@/lib/httpClient';
import { Layout } from '@/components/layout/Layout';

interface TrafficAnalytics {
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

interface LeadAnalytics {
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

interface ListingAnalytics {
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

export function AnalyticsDashboard() {
  const [trafficData, setTrafficData] = useState<TrafficAnalytics | null>(null);
  const [leadData, setLeadData] = useState<LeadAnalytics | null>(null);
  const [listingData, setListingData] = useState<ListingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'traffic' | 'leads' | 'listings'>('traffic');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [trafficResponse, leadResponse, listingResponse] = await Promise.all([
        httpClient.get<{ success: boolean; data: TrafficAnalytics }>(`/admin/analytics/traffic?range=${dateRange}`),
        httpClient.get<{ success: boolean; data: LeadAnalytics }>(`/admin/analytics/leads?range=${dateRange}`),
        httpClient.get<{ success: boolean; data: ListingAnalytics }>(`/admin/analytics/listings?range=${dateRange}`),
      ]);

      setTrafficData(trafficResponse.data);
      setLeadData(leadResponse.data);
      setListingData(listingResponse.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <Icon icon="solar:danger-circle-bold" className="size-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>Try Again</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive platform analytics and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button onClick={fetchAnalytics} variant="outline">
              <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'traffic', label: 'Traffic Analytics', icon: 'solar:chart-2-bold' },
            { id: 'leads', label: 'Lead Analytics', icon: 'solar:user-plus-bold' },
            { id: 'listings', label: 'Listing Analytics', icon: 'solar:home-2-bold' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1"
            >
              <Icon icon={tab.icon} className="size-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Traffic Analytics */}
        {activeTab === 'traffic' && trafficData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Page Views</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(trafficData.totalPageViews)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon icon="solar:eye-bold" className="size-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(trafficData.uniqueVisitors)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Icon icon="solar:users-group-rounded-bold" className="size-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPercentage(trafficData.bounceRate)}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Icon icon="solar:logout-bold" className="size-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                    <p className="text-3xl font-bold text-gray-900">{formatDuration(trafficData.avgSessionDuration)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Icon icon="solar:clock-circle-bold" className="size-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Pages */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
                <div className="space-y-4">
                  {trafficData.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{page.path}</div>
                        <div className="text-sm text-gray-500">{formatNumber(page.uniqueViews)} unique views</div>
                      </div>
                      <Badge variant="secondary">{formatNumber(page.views)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Referral Sources */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
                <div className="space-y-4">
                  {trafficData.referralSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(source.percentage)}</div>
                      </div>
                      <Badge variant="outline">{formatNumber(source.visits)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Device Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    <Icon icon="solar:monitor-bold" className="size-8 text-blue-600" />
                  </div>
                  <div className="font-medium">Desktop</div>
                  <div className="text-2xl font-bold">{formatPercentage(trafficData.deviceBreakdown.desktop)}</div>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    <Icon icon="solar:phone-bold" className="size-8 text-green-600" />
                  </div>
                  <div className="font-medium">Mobile</div>
                  <div className="text-2xl font-bold">{formatPercentage(trafficData.deviceBreakdown.mobile)}</div>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    <Icon icon="solar:tablet-bold" className="size-8 text-purple-600" />
                  </div>
                  <div className="font-medium">Tablet</div>
                  <div className="text-2xl font-bold">{formatPercentage(trafficData.deviceBreakdown.tablet)}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Lead Analytics */}
        {activeTab === 'leads' && leadData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(leadData.totalLeads)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Icon icon="solar:user-plus-bold" className="size-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPercentage(leadData.leadConversionRate)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon icon="solar:target-bold" className="size-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leads by Source */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Leads by Source</h3>
                <div className="space-y-4">
                  {leadData.leadsBySource.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(source.percentage)}</div>
                      </div>
                      <Badge variant="secondary">{formatNumber(source.count)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Leads by Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Leads by Status</h3>
                <div className="space-y-4">
                  {leadData.leadsByStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium capitalize">{status.status}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(status.percentage)}</div>
                      </div>
                      <Badge variant="outline">{formatNumber(status.count)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top Performing Properties */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performing Properties</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Property</th>
                      <th className="text-right py-2">Leads</th>
                      <th className="text-right py-2">Conversions</th>
                      <th className="text-right py-2">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadData.topPerformingProperties.map((property) => (
                      <tr key={property.id} className="border-b">
                        <td className="py-2 font-medium">{property.title}</td>
                        <td className="text-right py-2">{property.leads}</td>
                        <td className="text-right py-2">{property.conversions}</td>
                        <td className="text-right py-2">
                          {formatPercentage((property.conversions / property.leads) * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Listing Analytics */}
        {activeTab === 'listings' && listingData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(listingData.totalActiveListings)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Icon icon="solar:home-2-bold" className="size-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(listingData.newListingsThisMonth)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon icon="solar:add-circle-bold" className="size-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expired</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(listingData.expiredListings)}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Icon icon="solar:clock-circle-bold" className="size-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(listingData.featuredListings)}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Icon icon="solar:star-bold" className="size-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Views</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(listingData.averageListingViews)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Icon icon="solar:eye-bold" className="size-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Listings by Type */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Listings by Type</h3>
                <div className="space-y-4">
                  {listingData.listingsByType.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium capitalize">{type.type}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(type.percentage)}</div>
                      </div>
                      <Badge variant="secondary">{formatNumber(type.count)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Listings by City */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Cities</h3>
                <div className="space-y-4">
                  {listingData.listingsByCity.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{city.city}</div>
                        <div className="text-sm text-gray-500">
                          Avg: ₹{city.averagePrice.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline">{formatNumber(city.count)}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}