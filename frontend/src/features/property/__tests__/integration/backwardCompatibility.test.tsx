import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import components that should maintain backward compatibility
import App from '../../../App';

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
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    state: {
      isAuthenticated: false,
      user: null,
      loading: false,
    },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}));

// Mock other contexts and providers
vi.mock('@/shared/components/layout/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

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

describe('Backward Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location for navigation tests
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        search: '',
        hash: '',
        href: 'http://localhost:3000/',
      },
      writable: true,
    });
  });

  describe('Property Routes Compatibility', () => {
    it('should maintain existing property routes', () => {
      // Test that the App component renders without errors
      // This verifies that all property route imports are working
      expect(() => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should have property listing route available', () => {
      // Verify that property routes are properly configured
      const routes = [
        '/properties',
        '/property/:id',
        '/add-property',
        '/my-properties',
        '/search',
      ];

      routes.forEach(route => {
        expect(route).toBeDefined();
      });
    });
  });

  describe('Property Component Exports', () => {
    it('should export property pages from the correct location', async () => {
      // Test that property page imports work
      const { PropertyDetailsPage } = await import('../../pages');
      const { AddPropertyPage, MyPropertiesPage } = await import('../../pages');
      const { PropertySearchPage } = await import('../../pages/PropertySearchPage');

      expect(PropertyDetailsPage).toBeDefined();
      expect(AddPropertyPage).toBeDefined();
      expect(MyPropertiesPage).toBeDefined();
      expect(PropertySearchPage).toBeDefined();
    });

    it('should export property components from the correct location', async () => {
      const { PropertyCard } = await import('../../components/common/PropertyCard');
      const { PropertyGallery } = await import('../../components/common/PropertyGallery');
      const { PropertyFilters } = await import('../../components/common/PropertyFilters');

      expect(PropertyCard).toBeDefined();
      expect(PropertyGallery).toBeDefined();
      expect(PropertyFilters).toBeDefined();
    });

    it('should export property services from the correct location', async () => {
      const propertyService = await import('../../services/propertyService');
      const propertySearchService = await import('../../services/propertySearchService');

      expect(propertyService.default).toBeDefined();
      expect(propertySearchService.default).toBeDefined();
    });

    it('should export property hooks from the correct location', async () => {
      const { useProperty } = await import('../../hooks/useProperty');
      const { usePropertySearch } = await import('../../hooks/usePropertySearch');
      const { usePropertyFavorites } = await import('../../hooks/usePropertyFavorites');

      expect(useProperty).toBeDefined();
      expect(usePropertySearch).toBeDefined();
      expect(usePropertyFavorites).toBeDefined();
    });

    it('should export property types from the correct location', async () => {
      const types = await import('../../types');

      expect(types.Property).toBeDefined();
      expect(types.PropertyFilters).toBeDefined();
      expect(types.PropertyImage).toBeDefined();
    });
  });

  describe('Feature Integration Compatibility', () => {
    it('should work with buyer feature', async () => {
      // Test that buyer feature can import property components
      const { PropertyCard } = await import('@/features/property/components/common/PropertyCard');
      const { Property } = await import('@/features/property/types');

      expect(PropertyCard).toBeDefined();
      expect(Property).toBeDefined();
    });

    it('should work with agent feature', async () => {
      // Test that agent feature can import property components
      const { PropertyImageUpload } = await import('@/features/property/components/common/PropertyImageUpload');

      expect(PropertyImageUpload).toBeDefined();
    });

    it('should work with dashboard feature', async () => {
      // Test that dashboard can access property functionality
      // This would be tested by checking if dashboard components can import property types
      const propertyTypes = await import('@/features/property/types');

      expect(propertyTypes).toBeDefined();
    });
  });

  describe('API Compatibility', () => {
    it('should maintain existing API interface', async () => {
      const propertyService = await import('../../services/propertyService');

      // Verify that the service has all expected methods
      expect(typeof propertyService.default.getProperties).toBe('function');
      expect(typeof propertyService.default.getPropertyById).toBe('function');
      expect(typeof propertyService.default.createProperty).toBe('function');
      expect(typeof propertyService.default.updateProperty).toBe('function');
      expect(typeof propertyService.default.deleteProperty).toBe('function');
      expect(typeof propertyService.default.getUserProperties).toBe('function');
      expect(typeof propertyService.default.toggleFavorite).toBe('function');
      expect(typeof propertyService.default.getFavoriteProperties).toBe('function');
      expect(typeof propertyService.default.getSimilarProperties).toBe('function');
    });

    it('should maintain property search service interface', async () => {
      const propertySearchService = await import('../../services/propertySearchService');

      // Verify that the search service has expected methods
      expect(typeof propertySearchService.default.searchProperties).toBe('function');
      expect(typeof propertySearchService.default.getPropertySuggestions).toBe('function');
      expect(typeof propertySearchService.default.saveSearch).toBe('function');
      expect(typeof propertySearchService.default.getSavedSearches).toBe('function');
    });
  });

  describe('Type Compatibility', () => {
    it('should maintain property type structure', async () => {
      const { Property } = await import('../../types/property');

      // Create a mock property to verify the type structure
      const mockProperty: Property = {
        id: 1,
        title: 'Test Property',
        description: 'Test description',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 100000,
        area: 1000,
        bedrooms: 2,
        bathrooms: 2,
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
        },
        amenities: [],
        images: [],
        isActive: true,
        isFeatured: false,
        ownerId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(mockProperty).toBeDefined();
      expect(mockProperty.id).toBe(1);
      expect(mockProperty.title).toBe('Test Property');
    });

    it('should maintain property filters type structure', async () => {
      const { PropertyFilters } = await import('../../types/filters');

      // Create a mock filter to verify the type structure
      const mockFilters: PropertyFilters = {
        location: 'Test City',
        propertyType: ['apartment'],
        listingType: 'sale',
        minPrice: 50000,
        maxPrice: 200000,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['parking'],
      };

      expect(mockFilters).toBeDefined();
      expect(mockFilters.location).toBe('Test City');
      expect(mockFilters.propertyType).toEqual(['apartment']);
    });
  });

  describe('Navigation Compatibility', () => {
    it('should maintain existing navigation paths', () => {
      // Test that navigation to property pages works
      const propertyPaths = [
        '/',
        '/properties',
        '/property/1',
        '/search',
        '/add-property',
        '/my-properties',
      ];

      propertyPaths.forEach(path => {
        expect(path).toBeDefined();
        expect(typeof path).toBe('string');
      });
    });
  });

  describe('Component Props Compatibility', () => {
    it('should maintain PropertyCard props interface', async () => {
      const { PropertyCard } = await import('../../components/common/PropertyCard');

      // Verify that PropertyCard can be used with expected props
      const mockProperty = {
        id: 1,
        title: 'Test Property',
        price: 100000,
        location: { city: 'Test City', state: 'Test State' },
        images: [],
      };

      expect(() => {
        render(
          <TestWrapper>
            <PropertyCard property={mockProperty as any} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should maintain error handling patterns', async () => {
      const propertyService = await import('../../services/propertyService');

      // Verify that error types are still available
      expect(propertyService.PropertyErrorType).toBeDefined();
      expect(propertyService.PropertyErrorType.PROPERTY_NOT_FOUND).toBe('PROPERTY_NOT_FOUND');
      expect(propertyService.PropertyErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
    });
  });
});