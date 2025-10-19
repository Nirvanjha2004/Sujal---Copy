import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BuyerStatsCard } from './BuyerStatsCard';
import { QuickActionCard } from './QuickActionCard';
import { useBuyerStats } from '../hooks/useBuyerStats';
import { Icon } from '@iconify/react';

export function BuyerDashboard() {
  const { state } = useAuth();
  const navigate = useNavigate();
  const { stats, loading, error } = useBuyerStats();

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

  const statsCards = stats ? [
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
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:danger-bold" className="size-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

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
          <BuyerStatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <QuickActionCard key={index} action={action} />
          ))}
        </div>
      </div>
    </>
  );
}