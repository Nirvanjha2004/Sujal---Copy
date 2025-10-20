import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { adminService } from '../services/adminService';
import type { AnalyticsData } from '../types/analytics';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  count?: number;
}

interface AdminDashboardPageProps {
  onNavigate?: (tab: string) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'pending-users',
      title: 'Pending User Approvals',
      description: 'Review and approve new user registrations',
      icon: 'solar:user-check-bold',
      color: 'bg-blue-500',
      count: 5, // This would come from API
      action: () => onNavigate?.('users')
    },
    {
      id: 'pending-properties',
      title: 'Properties Awaiting Review',
      description: 'Moderate new property listings',
      icon: 'solar:home-2-bold',
      color: 'bg-green-500',
      count: 8,
      action: () => onNavigate?.('properties')
    },
    {
      id: 'content-updates',
      title: 'Update Site Content',
      description: 'Manage banners and announcements',
      icon: 'solar:document-text-bold',
      color: 'bg-purple-500',
      action: () => onNavigate?.('content')
    },
    // {
    //   id: 'seo-optimization',
    //   title: 'SEO Management',
    //   description: 'Optimize search engine visibility',
    //   icon: 'solar:chart-2-bold',
    //   color: 'bg-orange-500',
    //   action: () => onNavigate?.('seo')
    // },
    {
      id: 'review-reports',
      title: 'Review Reports',
      description: 'Moderate user reviews and feedback',
      icon: 'solar:star-bold',
      color: 'bg-yellow-500',
      count: 3,
      action: () => onNavigate?.('reviews')
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Monitor platform performance',
      icon: 'solar:shield-check-bold',
      color: 'bg-teal-500',
      action: () => onNavigate?.('analytics')
    }
  ];

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getAnalytics();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics data');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'An error occurred while fetching analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="solar:loading-bold" className="size-8 animate-spin text-primary" />
        <span className="ml-4 text-lg">Loading Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Icon icon="solar:danger-triangle-bold" className="size-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Admin Console</h1>
            <p className="text-blue-100">Manage your real estate platform efficiently</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data?.totalUsers || 0}</div>
            <div className="text-blue-100">Total Users</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <Icon icon="solar:refresh-bold" className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={action.action}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon icon={action.icon} className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                  {action.count && (
                    <Badge variant="secondary" className="text-xs">
                      {action.count}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Icon icon="solar:home-bold" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  {data.activeListings} active listings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Icon icon="solar:eye-bold" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activeListings}</div>
                <p className="text-xs text-muted-foreground">
                  {data.featuredListings} featured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <Icon icon="solar:chat-round-dots-bold" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalInquiries}</div>
                <p className="text-xs text-muted-foreground">
                  +{data.recentActivity.newInquiries} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <Icon icon="solar:user-plus-bold" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.recentActivity.newUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Last 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon icon="solar:clock-circle-bold" className="mr-2" />
                Recent Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Icon icon="solar:user-plus-bold" className="size-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-600">{data.recentActivity.newUsers}</div>
                  <div className="text-sm text-blue-600">New Users (7 days)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Icon icon="solar:home-add-bold" className="size-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">{data.recentActivity.newProperties}</div>
                  <div className="text-sm text-green-600">New Properties (7 days)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Icon icon="solar:chat-round-dots-bold" className="size-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-600">{data.recentActivity.newInquiries}</div>
                  <div className="text-sm text-purple-600">New Inquiries (7 days)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}