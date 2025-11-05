import { useAuth } from '@/shared/contexts/AuthContext';
import { Layout } from '@/shared/components/layout/Layout';
import { useFavorites } from '@/features/buyer/hooks/useFavorites';
import { useState, useEffect } from 'react';
import { api } from '@/shared/lib/api';
import { BuyerDashboardContent } from '../components/role-specific/BuyerDashboardContent';
import { AgentDashboardContent } from '../components/role-specific/AgentDashboardContent';
import { OwnerDashboardContent } from '../components/role-specific/OwnerDashboardContent';
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

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        if (user?.role === 'builder') {
          // Fetch builder-specific data from real APIs
          try {
            const [projectStatsResponse, projectsResponse, inquiriesResponse, messagesResponse] = await Promise.all([
              api.projects.getProjectStats().catch(() => ({ 
                success: false, 
                data: { 
                  totalProjects: 0, 
                  activeProjects: 0, 
                  totalUnits: 0, 
                  soldUnits: 0, 
                  availableUnits: 0, 
                  blockedUnits: 0 
                } 
              })),
              api.projects.getBuilderProjects({ limit: 5 }).catch(() => ({ 
                success: false, 
                data: { 
                  projects: [], 
                  pagination: { page: 1, limit: 5, total: 0, totalPages: 0 } 
                } 
              })),
              api.communication.getInquiries({ limit: 100 }).catch(() => ({ 
                data: [], 
                total: 0 
              })),
              api.communication.getUnreadCount().catch(() => ({ 
                data: { unread_count: 0 } 
              }))
            ]);

            const projectStats = projectStatsResponse.data;
            const projects = projectsResponse.data.projects || [];
            const inquiries = inquiriesResponse.data || [];
            const unreadMessages = messagesResponse.data?.unread_count || 0;

            console.log('Builder Dashboard Data:', {
              projectStats,
              projectsCount: projects.length,
              inquiriesCount: Array.isArray(inquiries) ? inquiries.length : 0,
              unreadMessages
            });

            // Update recent projects state with safety checks
            const formattedProjects = projects.map(project => ({
              id: project.id,
              name: project.name || 'Unnamed Project',
              location: `${project.city || 'Unknown'}, ${project.state || 'Unknown'}`,
              phase: (project.status || 'planning').replace('_', ' ').toLowerCase(),
              units: project.total_units || 0,
              sold: project.sold_units || 0,
              status: project.status || 'planning'
            }));

            setStats(prev => ({
              ...prev,
              totalProjects: projectStats.totalProjects,
              activeProjects: projectStats.activeProjects,
              unitsListed: projectStats.totalUnits,
              unitsAvailable: projectStats.availableUnits,
              totalInquiries: Array.isArray(inquiries) ? inquiries.length : ((inquiriesResponse as any).total || 0),
              messages: unreadMessages
            }));

            // Update recent projects
            setRecentProjects(formattedProjects);
          } catch (error) {
            console.error('Failed to fetch builder dashboard data:', error);
            // Fallback to default values
            setStats(prev => ({
              ...prev,
              totalProjects: 0,
              activeProjects: 0,
              unitsListed: 0,
              unitsAvailable: 0,
              totalInquiries: 0,
              messages: 0
            }));
          }
        } else if (['owner', 'agent'].includes(user?.role || '')) {
          // Fetch owner/agent specific data
          try {
            const [searchesResponse, propertiesResponse] = await Promise.all([
              api.getSavedSearches().catch(() => ({ data: { searches: [] } })),
              api.getUserProperties().catch(() => ({ data: [] }))
            ]);
            
            const properties = propertiesResponse.data || [];
            const activeListings = properties.filter(p => p.status === 'active').length;
            const soldListings = properties.filter(p => p.status === 'sold').length;
            const rentedListings = properties.filter(p => p.status === 'rented').length;
            
            setStats(prev => ({
              ...prev,
              savedProperties: favorites.length,
              savedSearches: (searchesResponse.data as any)?.savedSearches?.length || (searchesResponse.data as any)?.searches?.length || 0,
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
              savedSearches: (searchesResponse.data as any)?.savedSearches?.length || (searchesResponse.data as any)?.searches?.length || 0,
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
        // Use dedicated owner dashboard with owner-specific features
        const ownerStats = {
          totalListings: stats.totalListings,
          activeListings: stats.activeListings,
          soldListings: stats.soldListings,
          rentedListings: stats.rentedListings,
          messages: stats.messages
        };
        return <OwnerDashboardContent stats={ownerStats} />;
      
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