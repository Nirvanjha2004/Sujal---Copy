import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    messages: 0,
    // Builder-specific stats
    totalProjects: 0,
    activeProjects: 0,
    unitsListed: 0,
    unitsAvailable: 0,
    totalInquiries: 0,
    // Owner/Agent stats
    totalListings: 0,
    activeListings: 0,
    inquiries: 0
  });

  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (state.user?.role === 'builder') {
          // Fetch builder-specific data
          // const projectsResponse = await api.getBuilderProjects();
          // const unitsResponse = await api.getBuilderUnits();
          
          // Mock data for now - replace with actual API calls
          setStats(prev => ({
            ...prev,
            totalProjects: 5,
            activeProjects: 3,
            unitsListed: 150,
            unitsAvailable: 89,
            totalInquiries: 47,
            messages: 23
          }));

          // Mock recent projects - replace with actual API
          setRecentProjects([
            {
              id: 1,
              name: "Sunrise Residency",
              location: "Sector 15, Gurgaon",
              phase: "Pre-Launch",
              units: 120,
              sold: 0,
              status: "upcoming"
            },
            {
              id: 2,
              name: "Green Valley Apartments",
              location: "New Town, Kolkata",
              phase: "Under Construction",
              units: 80,
              sold: 45,
              status: "active"
            },
            {
              id: 3,
              name: "Metro Heights",
              location: "Andheri West, Mumbai",
              phase: "Ready to Move",
              units: 60,
              sold: 52,
              status: "completed"
            }
          ]);
        } else if (['owner', 'agent'].includes(state.user?.role)) {
          // Fetch owner/agent specific data
          const searchesResponse = await api.getSavedSearches();

          setStats(prev => ({
            ...prev,
            savedProperties: favorites.length,
            savedSearches: searchesResponse.data.length,
            totalListings: 12,
            activeListings: 8,
            inquiries: 15,
            messages: 6
          }));
        } else {
          // Buyer dashboard
          const searchesResponse = await api.getSavedSearches();

          setStats(prev => ({
            ...prev,
            savedProperties: favorites.length,
            savedSearches: searchesResponse.data.length
          }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    if (state.isAuthenticated) {
      fetchDashboardData();
    }
  }, [state.isAuthenticated, state.user?.role, favorites.length]);

  const getRoleBasedContent = () => {
    switch (state.user?.role) {
      case 'builder':
        return {
          title: 'Builder Dashboard',
          description: 'Manage your construction projects and development portfolio',
          actions: [
            {
              title: 'New Project',
              description: 'Start a new construction project',
              icon: 'solar:hammer-bold',
              action: () => navigate('/builder/new-project'),
              color: 'bg-primary'
            },
            {
              title: 'Project Portfolio',
              description: 'Manage all construction projects',
              icon: 'solar:buildings-2-bold',
              action: () => navigate('/builder/projects'),
              color: 'bg-blue-600'
            },
            {
              title: 'Buyer Communication',
              description: 'Messages and project inquiries',
              icon: 'solar:letter-bold',
              action: () => navigate('/dashboard/messages'),
              color: 'bg-indigo-600'
            }
          ]
        };

      case 'owner':
        return {
          title: 'Property Owner Dashboard',
          description: 'Manage your personal property portfolio',
          actions: [
            {
              title: 'Add New Property',
              description: 'List your property for sale or rent',
              icon: 'solar:home-add-bold',
              action: () => navigate('/add-property'),
              color: 'bg-primary'
            },
            {
              title: 'My Properties',
              description: 'Manage your property listings',
              icon: 'solar:buildings-bold',
              action: () => navigate('/my-properties'),
              color: 'bg-accent'
            },
            {
              title: 'Property Analytics',
              description: 'View performance and statistics',
              icon: 'solar:chart-bold',
              action: () => navigate('/analytics'),
              color: 'bg-green-500'
            },
            {
              title: 'Messages & Inquiries',
              description: 'Manage buyer inquiries',
              icon: 'solar:letter-bold',
              action: () => navigate('/dashboard/messages'),
              color: 'bg-blue-500'
            }
          ]
        };

      case 'agent':
        return {
          title: 'Real Estate Agent Dashboard',
          description: 'Manage client properties and grow your business',
          actions: [
            {
              title: 'Add Client Property',
              description: 'List property for a client',
              icon: 'solar:home-add-bold',
              action: () => navigate('/add-property'),
              color: 'bg-primary'
            },
            {
              title: 'Bulk Upload Properties',
              description: 'Upload multiple properties via CSV',
              icon: 'solar:upload-bold',
              action: () => navigate('/agent/bulk-upload'),
              color: 'bg-purple-600'
            },
            {
              title: 'Client Portfolio',
              description: 'Manage all client properties',
              icon: 'solar:buildings-3-bold',
              action: () => navigate('/my-properties'),
              color: 'bg-accent'
            },
            {
              title: 'Lead Management',
              description: 'Track and convert leads',
              icon: 'solar:users-group-two-rounded-bold',
              action: () => navigate('/leads'),
              color: 'bg-orange-500'
            },
            {
              title: 'Client Communication',
              description: 'Messages and client interactions',
              icon: 'solar:letter-bold',
              action: () => navigate('/dashboard/messages'),
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
              action: () => navigate('/dashboard/messages'),
              color: 'bg-blue-500'
            }
          ]
        };
    }
  };

  const getStatsCards = () => {
    if (state.user?.role === 'builder') {
      return [
        {
          title: 'Active Projects',
          value: stats.activeProjects,
          total: stats.totalProjects,
          icon: 'solar:buildings-2-bold',
          color: 'bg-primary/10 text-primary',
          subtitle: `${stats.totalProjects} total projects`
        },
        {
          title: 'Units Available',
          value: stats.unitsAvailable,
          total: stats.unitsListed,
          icon: 'solar:home-2-bold',
          color: 'bg-blue-100 text-blue-600',
          subtitle: `${stats.unitsListed} total units`
        },
        {
          title: 'Inquiries',
          value: stats.totalInquiries,
          icon: 'solar:chat-round-bold',
          color: 'bg-orange-100 text-orange-600',
          subtitle: 'This month'
        },
        {
          title: 'Messages',
          value: stats.messages,
          icon: 'solar:letter-bold',
          color: 'bg-green-100 text-green-600',
          subtitle: 'Unread messages'
        }
      ];
    } else if (['owner', 'agent'].includes(state.user?.role)) {
      return [
        {
          title: 'Active Listings',
          value: stats.activeListings,
          total: stats.totalListings,
          icon: 'solar:buildings-bold',
          color: 'bg-primary/10 text-primary',
          subtitle: `${stats.totalListings} total listings`
        },
        {
          title: 'Property Views',
          value: stats.propertyViews,
          icon: 'solar:eye-bold',
          color: 'bg-accent/10 text-accent',
          subtitle: 'This month'
        },
        {
          title: 'Inquiries',
          value: stats.inquiries,
          icon: 'solar:chat-round-bold',
          color: 'bg-orange-100 text-orange-600',
          subtitle: 'This month'
        },
        {
          title: 'Messages',
          value: stats.messages,
          icon: 'solar:letter-bold',
          color: 'bg-green-100 text-green-600',
          subtitle: 'Unread messages'
        }
      ];
    } else {
      return [
        {
          title: 'Property Views',
          value: stats.propertyViews,
          icon: 'solar:eye-bold',
          color: 'bg-primary/10 text-primary',
          subtitle: 'This month'
        },
        {
          title: 'Saved Properties',
          value: stats.savedProperties,
          icon: 'solar:heart-bold',
          color: 'bg-red-100 text-red-600',
          subtitle: 'Favorites'
        },
        {
          title: 'Saved Searches',
          value: stats.savedSearches,
          icon: 'solar:bookmark-bold',
          color: 'bg-accent/10 text-accent',
          subtitle: 'Active searches'
        },
        {
          title: 'Messages',
          value: stats.messages,
          icon: 'solar:letter-bold',
          color: 'bg-green-100 text-green-600',
          subtitle: 'Conversations'
        }
      ];
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const content = getRoleBasedContent();
  const statsCards = getStatsCards();

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
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.color} rounded-full`}>
                    <Icon icon={stat.icon} className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.total && (
                        <span className="text-sm text-muted-foreground">
                          / {stat.total}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

        {/* Builder-specific Recent Projects Section */}
        {state.user?.role === 'builder' && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="solar:buildings-2-bold" className="size-5" />
                    Recent Projects
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/builder/projects')}
                  >
                    View All Projects
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{project.name}</h3>
                            <Badge className={getProjectStatusColor(project.status)}>
                              {project.phase}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Icon icon="solar:map-point-bold" className="size-4 inline mr-1" />
                            {project.location}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Units: {project.units}
                            </span>
                            <span className="text-muted-foreground">
                              Sold: {project.sold}
                            </span>
                            <span className="text-muted-foreground">
                              Available: {project.units - project.sold}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/builder/projects/${project.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/builder/projects/${project.id}/units`)}
                          >
                            Manage Units
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="solar:buildings-2-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first construction project
                    </p>
                    <Button onClick={() => navigate('/builder/new-project')}>
                      <Icon icon="solar:hammer-bold" className="size-4 mr-2" />
                      Create New Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity - For all other roles */}
        {state.user?.role !== 'builder' && (
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
                  {state.user?.role === 'buyer' 
                    ? 'Start exploring properties to see your activity here'
                    : 'Start managing your properties to see activity here'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate(state.user?.role === 'buyer' ? '/properties' : '/add-property')}>
                    <Icon icon={state.user?.role === 'buyer' ? 'solar:magnifer-bold' : 'solar:home-add-bold'} className="size-4 mr-2" />
                    {state.user?.role === 'buyer' ? 'Browse Properties' : 'Add Property'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    <Icon icon="solar:settings-bold" className="size-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}