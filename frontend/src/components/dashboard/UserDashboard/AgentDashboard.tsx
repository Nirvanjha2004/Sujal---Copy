import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AgentDashboardProps {
  stats: {
    totalListings: number;
    activeListings: number;
    propertyViews: number;
    inquiries: number;
    messages: number;
  };
}

export function AgentDashboard({ stats }: AgentDashboardProps) {
  const { state } = useAuth();
  const navigate = useNavigate();

  const actions = [
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
  ];

  const statsCards = [
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

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
          Welcome back, {state.user?.firstName} {state.user?.lastName}!
        </h1>
        <p className="text-muted-foreground">
          Manage client properties and grow your business
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
          {actions.map((action, index) => (
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
              Start managing your properties to see activity here
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/add-property')}>
                <Icon icon="solar:home-add-bold" className="size-4 mr-2" />
                Add Property
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <Icon icon="solar:settings-bold" className="size-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}