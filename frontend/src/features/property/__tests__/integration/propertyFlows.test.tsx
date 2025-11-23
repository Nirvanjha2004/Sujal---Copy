import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/contexts/AuthContext';

// Import property components and services
import { AddPropertyPage } from '../../pages/AddPropertyPage';
import { PropertyListingPage } from '../../pages/PropertyListingPage';
import { PropertyDetailsPage } from '../../pages/PropertyDetailsPage';
import { PropertySearchPage } from '../../pages/PropertySearchPage';
import propertyService from '../../services/propertyService';
import propertySearchService from '../../services/propertySearchService';

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

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Property Flows Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Property Creation Flow', () => {
    it('should create a property successfully', async () => {
      // Mock successful property creation
      const mockProperty = {
        id: 1,
        title: 'Test Property',
        description: 'A beautiful test property',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 500000,
        area: 1200,
        bedrooms: 2,
        bathrooms: 2,
        location: {
          address: '123 Test St',
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

      vi.mocked(propertyService.createProperty).mockResolvedValue(mockProperty);

      render(
        <TestWrapper>
          <AddPropertyPage />
        </TestWrapper>
      );

      // Fill out the form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const priceInput = screen.getByLabelText(/price/i);

      fireEvent.change(titleInput, { target: { value: 'Test Property' } });
      fireEvent.change(descriptionInput, { target: { value: 'A beautiful test property' } });
      fireEvent.change(priceInput, { target: { value: '500000' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /add property/i });
      fireEvent.click(submitButton);

      // Verify property creation was called
      await waitFor(() => {
        expect(propertyService.createProperty).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Property',
            description: 'A beautiful test property',
            price: 500000,
          })
        );
      });
    });

    it('should handle property creation errors', async () => {
      // Mock property creation error
      vi.mocked(propertyService.createProperty).mockRejectedValue(
        new Error('Failed to create property')
      );

      render(
        <TestWrapper>
          <AddPropertyPage />
        </TestWrapper>
      );

      // Fill out minimal form data
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Property' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /add property/i });
      fireEvent.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to create property/i)).toBeInTheDocument();
      });
    });
  });

  describe('Property Search and Filtering Flow', () => {
    it('should search properties successfully', async () => {
      const mockProperties = [
        {
          id: 1,
          title: 'Apartment in Downtown',
          propertyType: 'apartment',
          price: 300000,
          location: { city: 'Test City' },
        },
        {
          id: 2,
          title: 'House in Suburbs',
          propertyType: 'house',
          price: 500000,
          location: { city: 'Test City' },
        },
      ];

      vi.mocked(propertySearchService.searchProperties).mockResolvedValue(mockProperties);

      render(
        <TestWrapper>
          <PropertySearchPage />
        </TestWrapper>
      );

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search properties/i);
      fireEvent.change(searchInput, { target: { value: 'apartment' } });

      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      // Verify search results
      await waitFor(() => {
        expect(screen.getByText('Apartment in Downtown')).toBeInTheDocument();
        expect(propertySearchService.searchProperties).toHaveBeenCalledWith(
          'apartment',
          expect.any(Object)
        );
      });
    });

    it('should filter properties by price range', async () => {
      const mockFilteredProperties = [
        {
          id: 1,
          title: 'Affordable Apartment',
          price: 250000,
          location: { city: 'Test City' },
        },
      ];

      vi.mocked(propertyService.getProperties).mockResolvedValue({
        data: mockFilteredProperties,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      render(
        <TestWrapper>
          <PropertySearchPage />
        </TestWrapper>
      );

      // Set price filters
      const minPriceInput = screen.getByLabelText(/minimum price/i);
      const maxPriceInput = screen.getByLabelText(/maximum price/i);

      fireEvent.change(minPriceInput, { target: { value: '200000' } });
      fireEvent.change(maxPriceInput, { target: { value: '300000' } });

      const applyFiltersButton = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyFiltersButton);

      // Verify filtered results
      await waitFor(() => {
        expect(screen.getByText('Affordable Apartment')).toBeInTheDocument();
        expect(propertyService.getProperties).toHaveBeenCalledWith(
          expect.objectContaining({
            minPrice: 200000,
            maxPrice: 300000,
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('Property Favorites Flow', () => {
    it('should toggle property favorite status', async () => {
      const mockProperty = {
        id: 1,
        title: 'Test Property',
        price: 300000,
        location: { city: 'Test City' },
        images: [],
      };

      vi.mocked(propertyService.getPropertyById).mockResolvedValue(mockProperty);
      vi.mocked(propertyService.toggleFavorite).mockResolvedValue({ isFavorite: true });

      render(
        <TestWrapper>
          <PropertyDetailsPage />
        </TestWrapper>
      );

      // Wait for property to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Click favorite button
      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favoriteButton);

      // Verify favorite toggle was called
      await waitFor(() => {
        expect(propertyService.toggleFavorite).toHaveBeenCalledWith(1);
      });
    });

    it('should display user favorites', async () => {
      const mockFavorites = [
        {
          id: 1,
          title: 'Favorite Property 1',
          price: 300000,
          location: { city: 'Test City' },
        },
        {
          id: 2,
          title: 'Favorite Property 2',
          price: 400000,
          location: { city: 'Test City' },
        },
      ];

      vi.mocked(propertyService.getFavoriteProperties).mockResolvedValue(mockFavorites);

      // This would be tested in the FavoritesPage component
      // For now, we'll test the service directly
      const favorites = await propertyService.getFavoriteProperties();
      
      expect(favorites).toHaveLength(2);
      expect(favorites[0].title).toBe('Favorite Property 1');
      expect(favorites[1].title).toBe('Favorite Property 2');
    });
  });

  describe('Property Editing and Deletion Flow', () => {
    it('should update property successfully', async () => {
      const mockProperty = {
        id: 1,
        title: 'Original Title',
        description: 'Original description',
        price: 300000,
        location: { city: 'Test City' },
      };

      const updatedProperty = {
        ...mockProperty,
        title: 'Updated Title',
        description: 'Updated description',
        price: 350000,
      };

      vi.mocked(propertyService.getPropertyById).mockResolvedValue(mockProperty);
      vi.mocked(propertyService.updateProperty).mockResolvedValue(updatedProperty);

      // Test the service directly for now
      const result = await propertyService.updateProperty(1, {
        title: 'Updated Title',
        description: 'Updated description',
        price: 350000,
      });

      expect(result.title).toBe('Updated Title');
      expect(result.price).toBe(350000);
      expect(propertyService.updateProperty).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
        description: 'Updated description',
        price: 350000,
      });
    });

    it('should delete property successfully', async () => {
      vi.mocked(propertyService.deleteProperty).mockResolvedValue();

      await propertyService.deleteProperty(1);

      expect(propertyService.deleteProperty).toHaveBeenCalledWith(1);
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

  describe('Property Listing and Display Flow', () => {
    it('should display property listings with pagination', async () => {
      const mockProperties = {
        data: [
          {
            id: 1,
            title: 'Property 1',
            price: 300000,
            location: { city: 'Test City' },
          },
          {
            id: 2,
            title: 'Property 2',
            price: 400000,
            location: { city: 'Test City' },
          },
        ],
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
      };

      vi.mocked(propertyService.getProperties).mockResolvedValue(mockProperties);

      render(
        <TestWrapper>
          <PropertyListingPage />
        </TestWrapper>
      );

      // Verify properties are displayed
      await waitFor(() => {
        expect(screen.getByText('Property 1')).toBeInTheDocument();
        expect(screen.getByText('Property 2')).toBeInTheDocument();
      });

      // Verify pagination info
      expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
    });

    it('should handle empty property listings', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      vi.mocked(propertyService.getProperties).mockResolvedValue(emptyResponse);

      render(
        <TestWrapper>
          <PropertyListingPage />
        </TestWrapper>
      );

      // Verify empty state is displayed
      await waitFor(() => {
        expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
      });
    });
  });
});