import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { httpClient } from '@/lib/httpClient';
import { Layout } from '@/components/layout/Layout';

interface DashboardAnalytics {
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  activeListings: number;
  featuredListings: number;
  usersByRole: Record<string, number>;
  propertiesByType: Record<string, number>;
  recentActivity: {
    newUsers: number;
    newProperties: number;
    newInquiries: number;
  };
  monthlyStats: {
    month: string;
    users: number;
    properties: number;
    inquiries: number;
  }[];
}

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get<{ success: boolean; data: DashboardAnalytics }>('/admin/dashboard/analytics');
      setAnalytics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Icon icon="solar:danger-triangle-bold" className="size-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!analytics) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your real estate portal</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon icon="solar:users-group-rounded-bold" className="size-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  +{analytics.recentActivity.newUsers} this week
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalProperties}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Icon icon="solar:home-2-bold" className="size-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  +{analytics.recentActivity.newProperties} this week
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.activeListings}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Icon icon="solar:eye-bold" className="size-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  {analytics.featuredListings} featured
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalInquiries}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Icon icon="solar:chat-round-dots-bold" className="size-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  +{analytics.recentActivity.newInquiries} this week
                </Badge>
              </div>
            </Card>
          </div>

          {/* Charts and Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Users by Role */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
              <div className="space-y-3">
                {Object.entries(analytics.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="capitalize text-sm font-medium">{role}</span>
                    </div>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Properties by Type */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Properties by Type</h3>
              <div className="space-y-3">
                {Object.entries(analytics.propertiesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="capitalize text-sm font-medium">{type}</span>
                    </div>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Monthly Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">New Users</th>
                    <th className="text-right py-2">New Properties</th>
                    <th className="text-right py-2">New Inquiries</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthlyStats.map((stat, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{stat.month}</td>
                      <td className="text-right py-2">{stat.users}</td>
                      <td className="text-right py-2">{stat.properties}</td>
                      <td className="text-right py-2">{stat.inquiries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}