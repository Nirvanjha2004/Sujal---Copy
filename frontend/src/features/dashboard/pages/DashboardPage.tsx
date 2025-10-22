import { useAuth } from '@/shared/contexts/AuthContext';
import { Layout } from '@/shared/components/layout/Layout';
import { useFavorites } from '@/features/buyer/hooks/useFavorites';
import { useState, useEffect } from 'react';
import { api } from '@/shared/lib/api';
import { BuyerDashboardContent } from '../components/role-specific/BuyerDashboardContent';
import { AgentDashboardContent } from '../components/role-specific/AgentDashboardContent';
import { BuilderDashboardContent } from '../components/role-specific/BuilderDashboardContent';
import { AdminDashboardContent } from '../components/role-specific/AdminDashboardContent';
import { UserDashboardContent } from '../components/role-specific/UserDashboardContent';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { Icon } from '@iconify/react';

interface Project {
  id: number;
  name: string;
  location: string;
  phase: string;
  units: number;
  sold: number;
  status: string;
}

/**
 * Main dashboard page that routes to role-specific dashboard content
 * Uses new modular dashboard components but maintains original data fetching approach
 * Maintains existing functionality and user experience without unnecessary API calls
 */
export function DashboardPage() {
  const { state: { user, isAuthenticated } } = useAuth();
  const { favorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
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
    soldListings: 0,
    rentedListings: 0
  });

  const [recentProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        if (user?.role === 'builder') {
          // Fetch builder-specific data
          // Mock data for now - replace with actual API calls when available
          setStats(prev => ({
            ...prev,
            totalProjects: 5,
            activeProjects: 3,
            unitsListed: 150,
            unitsAvailable: 89,
            totalInquiries: 47,
            messages: 23
          }));
        } else if (['owner', 'agent'].includes(user?.role || '')) {
          // Fetch owner/agent specific data
          try {
            const [searchesResponse, propertiesResponse] = await Promise.all([
              api.getSavedSearches().catch(() => ({ data: { searches: [] } })),
              api.getUserProperties().catch(() => ({ data: [] }))
            ]);
            
            const properties = propertiesResponse.data || [];
            const activeListings = properties.filter(p => p.status === 'ACTIVE').length;
            const soldListings = properties.filter(p => p.status === 'SOLD').length;
            const rentedListings = properties.filter(p => p.status === 'RENTED').length;
            
            setStats(prev => ({
              ...prev,
              savedProperties: favorites.length,
              savedSearches: searchesResponse.data?.searches?.length || 0,
              totalListings: properties.length,
              activeListings: activeListings,
              soldListings: soldListings,
              rentedListings: rentedListings,
              messages: 0
            }));
          } catch (error) {
            // If API call fails, use default values
            setStats(prev => ({
              ...prev,
              savedProperties: favorites.length,
              savedSearches: 0,
              totalListings: 0,
              activeListings: 0,
              soldListings: 0,
              rentedListings: 0,
              messages: 0
            }));
          }
        } else {
          // Buyer dashboard
          try {
            const searchesResponse = await api.getSavedSearches();
            setStats(prev => ({
              ...prev,
              savedProperties: favorites.length,
              savedSearches: searchesResponse.data?.searches?.length || 0,
              messages: 0
            }));
          } catch (error) {
            // If API call fails, use default values
            setStats(prev => ({
              ...prev,
              savedProperties: favorites.length,
              savedSearches: 0,
              messages: 0
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.role, favorites.length]);

  // Show loading state while fetching dashboard data
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Icon icon="solar:loading-bold" className="size-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  // Render role-specific dashboard content
  const renderDashboardContent = () => {
    // Default overall stats for all users
    const defaultOverallStats = {
      profileCompletion: 0,
      accountAge: 0,
      lastLogin: new Date().toISOString(),
      totalActions: 0
    };

    if (!isAuthenticated || !user) {
      return <UserDashboardContent stats={defaultOverallStats} />;
    }

    const userRole = user.role;

    // Create role-specific stats based on user role using local state
    switch (userRole) {
      case 'buyer':
        const buyerStats = {
          savedProperties: stats.savedProperties,
          savedSearches: stats.savedSearches,
          messages: stats.messages
        };
        return <BuyerDashboardContent stats={buyerStats} />;
      
      case 'agent':
        const agentStats = {
          totalListings: stats.totalListings,
          activeListings: stats.activeListings,
          soldListings: stats.soldListings,
          rentedListings: stats.rentedListings,
          messages: stats.messages
        };
        return <AgentDashboardContent stats={agentStats} />;
      
      case 'builder':
        const builderStats = {
          totalProjects: stats.totalProjects,
          activeProjects: stats.activeProjects,
          unitsListed: stats.unitsListed,
          unitsAvailable: stats.unitsAvailable,
          totalInquiries: stats.totalInquiries,
          messages: stats.messages
        };
        return <BuilderDashboardContent stats={builderStats} recentProjects={recentProjects} />;
      
      case 'admin':
        const adminStats = {
          totalUsers: 150, // Mock data - replace with actual API call when available
          totalProperties: 1250,
          totalInquiries: 89,
          activeListings: 456,
          pendingApprovals: 12,
          systemHealth: 98
        };
        return <AdminDashboardContent stats={adminStats} />;
      
      case 'owner':
        // Use agent dashboard for owners as they have similar functionality
        const ownerStats = {
          totalListings: stats.totalListings,
          activeListings: stats.activeListings,
          soldListings: stats.soldListings,
          rentedListings: stats.rentedListings,
          messages: stats.messages
        };
        return <AgentDashboardContent stats={ownerStats} />;
      
      default:
        return <UserDashboardContent stats={defaultOverallStats} />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <DashboardLayout>
          {renderDashboardContent()}
        </DashboardLayout>
      </div>
    </Layout>
  );
}