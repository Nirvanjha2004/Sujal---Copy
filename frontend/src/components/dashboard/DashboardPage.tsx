import { useAuth } from '@/shared/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { useFavorites } from '@/features/buyer/hooks/useFavorites';
import { useState, useEffect } from 'react';
import { api } from '@/shared/lib/api';
import { BuyerDashboard } from '@/features/buyer/components';
import { OwnerDashboard, AgentDashboard, BuilderDashboard } from './UserDashboard';

interface Project {
  id: number;
  name: string;
  location: string;
  phase: string;
  units: number;
  sold: number;
  status: string;
}

export function DashboardPage() {
  const { state } = useAuth();
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

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

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
        } else if (['owner', 'agent'].includes(state.user?.role || '')) {
          // Fetch owner/agent specific data
          const searchesResponse = await api.getSavedSearches();

          setStats(prev => ({
            ...prev,
            savedProperties: favorites.length,
            savedSearches: searchesResponse.data?.searches?.length || 0,
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
            savedSearches: searchesResponse.data?.searches?.length || 0
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

  const renderDashboardContent = () => {
    const userRole = state.user?.role;

    switch (userRole) {
      case 'builder':
        return (
          <BuilderDashboard
            stats={{
              totalProjects: stats.totalProjects,
              activeProjects: stats.activeProjects,
              unitsListed: stats.unitsListed,
              unitsAvailable: stats.unitsAvailable,
              totalInquiries: stats.totalInquiries,
              messages: stats.messages
            }}
            recentProjects={recentProjects}
          />
        );

      case 'owner':
        return (
          <OwnerDashboard
            stats={{
              totalListings: stats.totalListings,
              activeListings: stats.activeListings,
              propertyViews: stats.propertyViews,
              inquiries: stats.inquiries,
              messages: stats.messages
            }}
          />
        );

      case 'agent':
        return (
          <AgentDashboard
            stats={{
              totalListings: stats.totalListings,
              activeListings: stats.activeListings,
              propertyViews: stats.propertyViews,
              inquiries: stats.inquiries,
              messages: stats.messages
            }}
          />
        );

      case 'buyer':
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {renderDashboardContent()}
      </div>
    </Layout>
  );
}