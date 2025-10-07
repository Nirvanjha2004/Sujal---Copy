import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function DashboardPage() {
  const { state } = useAuth();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [stats, setStats] = useState({
    propertyViews: 0,
    savedProperties: 0,
    savedSearches: 0,
    messages: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch saved searches
        const searchesResponse = await api.getSavedSearches();

        // Update stats
        setStats(prev => ({
          ...prev,
          savedProperties: favorites.length,
          savedSearches: searchesResponse.data.length
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    if (state.isAuthenticated) {
      fetchDashboardData();
    }
  }, [state.isAuthenticated, favorites.length]);

  const getRoleBasedContent = () => {
    switch (state.user?.role) {
      case 'owner':
      case 'agent':
      case 'builder':
        return {
          title: 'Property Management Dashboard',
          description: 'Manage your property listings and track performance',
          actions: [
            {
              title: 'Add New Property',
              description: 'List a new property for sale or rent',
              icon: 'solar:home-add-bold',
              action: () => navigate('/add-property'),
              color: 'bg-primary'
            },
            {
              title: 'My Properties',
              description: 'View and manage your property listings',
              icon: 'solar:buildings-bold',
              action: () => navigate('/my-properties'),
              color: 'bg-accent'
            },
            {
              title: 'Inquiries',
              description: 'Manage property inquiries and leads',
              icon: 'solar:chat-round-bold',
              action: () => navigate('/inquiries'),
              color: 'bg-secondary'
            },
            {
              title: 'Communication',
              description: 'Messages and communication center',
              icon: 'solar:letter-bold',
              action: () => navigate('/communication'),
              color: 'bg-blue-500'
            }
          ]
        };
      case 'buyer':
      default:
        return {
          title: 'Property Search Dashboard',
          description: 'Find your dream property and manage your searches',
          actions: [
            {
              title: 'Search Properties',
              description: 'Browse available properties',
              icon: 'solar:magnifer-bold',
              action: () => navigate('/'),
              color: 'bg-primary'
            },
            {
              title: 'Saved Properties',
              description: 'View your favorite properties',
              icon: 'solar:heart-bold',
              action: () => navigate('/favorites'),
              color: 'bg-red-500'
            },
            {
              title: 'Saved Searches',
              description: 'Manage your saved search criteria',
              icon: 'solar:bookmark-bold',
              action: () => navigate('/saved-searches'),
              color: 'bg-accent'
            },
            {
              title: 'Activity History',
              description: 'View your property search history',
              icon: 'solar:history-bold',
              action: () => navigate('/activity'),
              color: 'bg-secondary'
            },
            {
              title: 'Communication',
              description: 'Messages and inquiries',
              icon: 'solar:letter-bold',
              action: () => navigate('/communication'),
              color: 'bg-blue-500'
            }
          ]
        };
    }
  };

  const content = getRoleBasedContent();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
            Welcome back, {state.user?.firstName} {state.user?.lastName}!
          </h1>
          <p className="text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Icon icon="solar:eye-bold" className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.propertyViews}</p>
                  <p className="text-sm text-muted-foreground">Property Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Icon icon="solar:heart-bold" className="size-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.savedProperties}</p>
                  <p className="text-sm text-muted-foreground">Saved Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Icon icon="solar:bookmark-bold" className="size-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.savedSearches}</p>
                  <p className="text-sm text-muted-foreground">Saved Searches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Icon icon="solar:chat-round-bold" className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.messages}</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-heading font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.actions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6" onClick={action.action}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${action.color} rounded-full`}>
                      <Icon icon={action.icon} className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:history-bold" className="size-5" />
                Recent Activity
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/activity')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Icon icon="solar:document-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No recent activity</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring properties to see your activity here
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/properties')}>
                  <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                  Browse Properties
                </Button>
                <Button variant="outline" onClick={() => navigate('/settings')}>
                  <Icon icon="solar:settings-bold" className="size-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}