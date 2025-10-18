import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';

interface BuyerDashboardProps {
  stats: {
    savedProperties: number;
    savedSearches: number;
    messages: number;
  };
}

export function BuyerDashboard({ stats }: BuyerDashboardProps) {
  const { state } = useAuth();
  const navigate = useNavigate();

  const actions = [
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
      title: 'Communication',
      description: 'Messages and inquiries',
      icon: 'solar:letter-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'bg-blue-500'
    }
  ];

  const statsCards = [
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

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
          Welcome back, {state.user?.firstName} {state.user?.lastName}!
        </h1>
        <p className="text-muted-foreground">
          Find your dream property and manage your searches
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
    </>
  );
}