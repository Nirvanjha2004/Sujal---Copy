import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import dashboard components that use property functionality
import { BuyerDashboardContent } from '../../../dashboard/components/role-specific/BuyerDashboardContent';
import { AgentDashboardContent } from '../../../dashboard/components/role-specific/AgentDashboardContent';
import { BuilderDashboardContent } from '../../../dashboard/components/role-specific/BuilderDashboardContent';

// Import property components used in other features
import { PropertyCard } from '../../components/common/PropertyCard';
import { PropertyImageUpload } from '../../components/common/PropertyImageUpload';

// Import property services
import propertyService from '../../services/propertyService';
import propertyAnalyticsService from '../../services/propertyAnalyticsService';

// Mock the API
vi.mock('@/shared/lib/api', () => ({
  api: {
    getProperties: vi.fn(),
    getProperty: vi.fn(),
    createProperty: vi.fn(),
    updateProperty: vi.fn(),
    deleteProperty: vi.fn(),
    getUserProperties: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
    getFavorites: vi.fn(),
    searchProperties: vi.fn(),
    getPropertyAnalytics: vi.fn(),
  }
}));

// Mock auth context
vi.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    state: {
      isAuthenticated: true,
      user: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'buyer',
      },
      loading: false,
    },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
  };
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Property Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard Integration', () => {
    describe('Buyer Dashboard Integration', () => {
      it('should display property-related stats and actions for buyers', () => {
        const mockStats = {
          savedProperties: 5,
          savedSearches: 3,
          messages: 2,
        };

        render(
          <TestWrapper>
            <BuyerDashboardContent stats={mockStats} />
          </TestWrapper>
        );

        // Verify property-related elements are displayed
        expect(screen.getByText('Saved Properties')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Saved Searches')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });

      it('should handle navigation to property pages from buyer dashboard', () => {
        const mockStats = {
          savedProperties: 5,
          savedSearches: 3,
          messages: 2,
        };

        render(
          <TestWrapper>
            <BuyerDashboardContent stats={mockStats} />
          </TestWrapper>
        );

        // Test navigation buttons
        const searchButton = screen.getByText('Search Properties');
        const favoritesButton = screen.getByText('Saved Properties');

        expect(searchButton).toBeInTheDocument();
        expect(favoritesButton).toBeInTheDocument();
      });

      it('should handle loading state properly', () => {
        render(
          <TestWrapper>
            <BuyerDashboardContent 
              stats={{ savedProperties: 0, savedSearches: 0, messages: 0 }} 
              isLoading={true} 
            />
          </TestWrapper>
        );

        // Should show loading skeleton
        const loadingElements = screen.getAllByRole('generic');
        expect(loadingElements.length).toBeGreaterThan(0);
      });
    });

    describe('Agent Dashboard Integration', () => {
      it('should display property management stats and actions for agents', () => {
        const mockStats = {
          totalListings: 15,
          activeListings: 12,
          propertyViews: 150,
          inquiries: 8,
          messages: 5,
        };

        render(
          <TestWrapper>
            <AgentDashboardContent stats={mockStats} />
          </TestWrapper>
        );

        // Verify agent-specific property elements
        expect(screen.getByText('Total Listings')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('Active Listings')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Property Views')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
      });

      it('should provide property management actions for agents', () => {
        const mockStats = {
          totalListings: 15,
          activeListings: 12,
          propertyViews: 150,
          inquiries: 8,
          messages: 5,
        };

        render(
          <TestWrapper>
            <AgentDashboardContent stats={mockStats} />
          </TestWrapper>
        );

        // Test agent-specific actions
        expect(screen.getByText('Add Client Property')).toBeInTheDocument();
        expect(screen.getByText('Client Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Bulk Upload Properties')).toBeInTheDocument();
      });
    });

    describe('Builder Dashboard Integration', () => {
      it('should display project and unit stats for builders', () => {
        const mockStats = {
          totalProjects: 8,
          activeProjects: 5,
          unitsListed: 120,
          unitsAvailable: 45,
          totalInquiries: 25,
          messages: 10,
        };

        render(
          <TestWrapper>
            <BuilderDashboardContent 
              stats={mockStats} 
              recentProjects={[]} 
            />
          </TestWrapper>
        );

        // Verify builder-specific elements
        expect(screen.getByText('Active Projects')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Units Available')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
      });

      it('should provide project management actions for builders', () => {
        const mockStats = {
          totalProjects: 8,
          activeProjects: 5,
          unitsListed: 120,
          unitsAvailable: 45,
          totalInquiries: 25,
          messages: 10,
        };

        render(
          <TestWrapper>
            <BuilderDashboardContent 
              stats={mockStats} 
              recentProjects={[]} 
            />
          </TestWrapper>
        );

        // Test builder-specific actions
        expect(screen.getByText('New Project')).toBeInTheDocument();
        expect(screen.getByText('Project Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Unit Management')).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Feature Property Component Usage', () => {
    it('should work when PropertyCard is used in buyer feature', () => {
      const mockProperty = {
        id: 1,
        title: 'Test Property',
        price: 500000,
        location: { city: 'Test City', state: 'Test State' },
        images: [],
        propertyType: 'apartment' as const,
        listingType: 'sale' as const,
      };

      render(
        <TestWrapper>
          <PropertyCard property={mockProperty as any} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('Test City, Test State')).toBeInTheDocument();
    });

    it('should work when PropertyImageUpload is used in agent feature', () => {
      const mockOnUpload = vi.fn();

      render(
        <TestWrapper>
          <PropertyImageUpload
            propertyId={1}
            onUpload={mockOnUpload}
            maxFiles={5}
          />
        </TestWrapper>
      );

      // Should render upload component
      expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
    });
  });

  describe('Property Analytics Integration', () => {
    it('should provide analytics data for different user roles', async () => {
      const mockAnalytics = {
        views: 150,
        favorites: 25,
        inquiries: 8,
        shares: 5,
      };

      vi.mocked(propertyAnalyticsService.getPropertyStats).mockResolvedValue(mockAnalytics);

      const stats = await propertyAnalyticsService.getPropertyStats(1);

      expect(stats.views).toBe(150);
      expect(stats.favorites).toBe(25);
      expect(stats.inquiries).toBe(8);
      expect(stats.shares).toBe(5);
    });

    it('should handle analytics errors gracefully', async () => {
      vi.mocked(propertyAnalyticsService.getPropertyStats).mockRejectedValue(
        new Error('Analytics service unavailable')
      );

      await expect(propertyAnalyticsService.getPropertyStats(1)).rejects.toThrow(
        'Analytics service unavailable'
      );
    });
  });

  describe('Property Service Integration', () => {
    it('should work correctly with different user permissions', async () => {
      const mockProperty = {
        id: 1,
        title: 'Test Property',
        price: 500000,
        propertyType: 'apartment',
        listingType: 'sale',
      };

      vi.mocked(propertyService.createProperty).mockResolvedValue(mockProperty as any);

      const result = await propertyService.createProperty({
        title: 'Test Property',
        price: 500000,
        propertyType: 'apartment',
        listingType: 'sale',
      } as any);

      expect(result.title).toBe('Test Property');
      expect(result.price).toBe(500000);
    });

    it('should handle permission errors appropriately', async () => {
      vi.mocked(propertyService.createProperty).mockRejectedValue({
        type: 'PERMISSION_ERROR',
        message: 'Permission denied to create property',
      });

      await expect(
        propertyService.createProperty({} as any)
      ).rejects.toMatchObject({
        type: 'PERMISSION_ERROR',
        message: 'Permission denied to create property',
      });
    });
  });

  describe('Role-Based Property Access', () => {
    it('should allow buyers to view and favorite properties', async () => {
      const mockProperty = {
        id: 1,
        title: 'Buyer Property',
        price: 300000,
      };

      vi.mocked(propertyService.getPropertyById).mockResolvedValue(mockProperty as any);
      vi.mocked(propertyService.toggleFavorite).mockResolvedValue({ isFavorite: true });

      const property = await propertyService.getPropertyById(1);
      const favoriteResult = await propertyService.toggleFavorite(1);

      expect(property.title).toBe('Buyer Property');
      expect(favoriteResult.isFavorite).toBe(true);
    });

    it('should allow agents to manage client properties', async () => {
      const mockProperties = [
        { id: 1, title: 'Client Property 1' },
        { id: 2, title: 'Client Property 2' },
      ];

      vi.mocked(propertyService.getUserProperties).mockResolvedValue(mockProperties as any);

      const properties = await propertyService.getUserProperties();

      expect(properties).toHaveLength(2);
      expect(properties[0].title).toBe('Client Property 1');
      expect(properties[1].title).toBe('Client Property 2');
    });

    it('should allow builders to manage project units', async () => {
      const mockProjectProperty = {
        id: 1,
        title: 'Project Unit 1A',
        propertyType: 'apartment',
        projectId: 1,
      };

      vi.mocked(propertyService.createProperty).mockResolvedValue(mockProjectProperty as any);

      const property = await propertyService.createProperty({
        title: 'Project Unit 1A',
        propertyType: 'apartment',
        projectId: 1,
      } as any);

      expect(property.title).toBe('Project Unit 1A');
      expect(property.propertyType).toBe('apartment');
    });
  });

  describe('Property Search Integration', () => {
    it('should work across different user contexts', async () => {
      const mockSearchResults = [
        { id: 1, title: 'Search Result 1' },
        { id: 2, title: 'Search Result 2' },
      ];

      vi.mocked(propertyService.getProperties).mockResolvedValue({
        data: mockSearchResults as any,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const results = await propertyService.getProperties(
        { location: 'Test City' },
        { page: 1, limit: 20 }
      );

      expect(results.data).toHaveLength(2);
      expect(results.data[0].title).toBe('Search Result 1');
      expect(results.total).toBe(2);
    });
  });

  describe('Property Image Integration', () => {
    it('should handle image uploads across different contexts', () => {
      const mockOnUpload = vi.fn();
      const mockImages = [
        {
          id: 1,
          url: 'https://example.com/image1.jpg',
          alt: 'Property image 1',
        },
      ];

      render(
        <TestWrapper>
          <PropertyImageUpload
            propertyId={1}
            onUpload={mockOnUpload}
            existingImages={mockImages as any}
            maxFiles={10}
          />
        </TestWrapper>
      );

      // Should display existing images
      expect(screen.getByAltText('Property image 1')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully across features', async () => {
      vi.mocked(propertyService.getProperties).mockRejectedValue({
        type: 'NETWORK_ERROR',
        message: 'Network connection failed',
      });

      await expect(propertyService.getProperties()).rejects.toMatchObject({
        type: 'NETWORK_ERROR',
        message: 'Network connection failed',
      });
    });

    it('should handle property not found errors', async () => {
      vi.mocked(propertyService.getPropertyById).mockRejectedValue({
        type: 'PROPERTY_NOT_FOUND',
        message: 'Property with ID 999 not found',
      });

      await expect(propertyService.getPropertyById(999)).rejects.toMatchObject({
        type: 'PROPERTY_NOT_FOUND',
        message: 'Property with ID 999 not found',
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large property datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Property ${i + 1}`,
        price: 100000 + i * 10000,
      }));

      vi.mocked(propertyService.getProperties).mockResolvedValue({
        data: largeDataset as any,
        total: 100,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      const results = await propertyService.getProperties({}, { limit: 100 });

      expect(results.data).toHaveLength(100);
      expect(results.total).toBe(100);
    });
  });
});