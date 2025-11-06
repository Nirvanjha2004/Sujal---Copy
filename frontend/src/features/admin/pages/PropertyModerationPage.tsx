import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@iconify/react';
import { propertyModerationService } from '../services/propertyModerationService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";

interface PropertyModerationData {
  id: number;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price: number;
  address?: string;
  city: string;
  state?: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  amenities?: Record<string, boolean>;
  images?: Array<{
    id: number;
    property_id: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
  }>;
  owner?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    phone?: string;
  };
  viewsCount?: number;
}

interface PropertyFilters {
  propertyType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export function PropertyModerationPage() {
  const [properties, setProperties] = useState<PropertyModerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Property details modal state
  const [selectedProperty, setSelectedProperty] = useState<PropertyModerationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await propertyModerationService.getProperties({
        page: currentPage,
        limit: 20,
        ...filters
      });

      if (response.success && response.data) {
        setProperties(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch properties');
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const updatePropertyStatus = async (propertyId: number, updates: any) => {
    try {
      const response = await propertyModerationService.updatePropertyStatus(propertyId, updates);
      if (response.success) {
        fetchProperties(); // Refresh the list
      } else {
        alert(response.error?.message || 'Failed to update property');
      }
    } catch (err: any) {
      alert('Failed to update property');
    }
  };

  const deleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await propertyModerationService.deleteProperty(propertyId);
      if (response.success) {
        fetchProperties(); // Refresh the list
      } else {
        alert(response.error?.message || 'Failed to delete property');
      }
    } catch (err: any) {
      alert('Failed to delete property');
    }
  };

  const fetchPropertyDetails = async (propertyId: number) => {
    try {
      setLoadingDetails(true);
      const response = await propertyModerationService.getPropertyDetails(propertyId);
      if (response.success && response.data) {
        setSelectedProperty(response.data);
        setIsModalOpen(true);
      } else {
        alert(response.error?.message || 'Failed to load property details');
      }
    } catch (err: any) {
      alert('Failed to load property details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const getPropertyTypeBadgeColor = (type: string) => {
    const colors = {
      apartment: 'bg-blue-100 text-blue-800',
      house: 'bg-green-100 text-green-800',
      commercial: 'bg-purple-100 text-purple-800',
      land: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Moderation</h1>
        <p className="text-gray-600">Review and manage property listings</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or city..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSearch} className="rounded-l-none">
                <Icon icon="solar:magnifer-bold" className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
              onChange={(e) => handleFilterChange('isActive', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
            <select
              value={filters.isFeatured !== undefined ? filters.isFeatured.toString() : ''}
              onChange={(e) => handleFilterChange('isFeatured', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Properties Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.city} • {property.viewsCount || 0} views
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getPropertyTypeBadgeColor(property.property_type)} capitalize`}>
                      {property.property_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(property.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {property.owner
                          ? `${property.owner.first_name} ${property.owner.last_name}`
                          : 'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.owner?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {property.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchPropertyDetails(property.id)}
                        disabled={loadingDetails}
                      >
                        <Icon icon="solar:document-text-bold" className="mr-2 size-4" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePropertyStatus(property.id, { isActive: !property.is_active })}
                      >
                        {property.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProperty(property.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <Icon icon="solar:danger-triangle-bold" className="size-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedProperty?.title}
            </DialogTitle>
            <DialogDescription>
              Property ID: {selectedProperty?.id} • Listed on {
                selectedProperty?.created_at
                  ? new Date(selectedProperty.created_at).toLocaleDateString()
                  : 'N/A'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Property Type</label>
                      <p className="text-sm capitalize">{selectedProperty.property_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Listing Type</label>
                      <p className="text-sm capitalize">{selectedProperty.listing_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price</label>
                      <p className="text-sm font-semibold">{formatPrice(selectedProperty.price)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedProperty.bedrooms && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bedrooms</label>
                        <p className="text-sm">{selectedProperty.bedrooms}</p>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bathrooms</label>
                        <p className="text-sm">{selectedProperty.bathrooms}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex gap-2">
                        <Badge variant={selectedProperty.is_active ? "default" : "secondary"}>
                          {selectedProperty.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {selectedProperty.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div>
                <h3 className="text-lg font-medium mb-3">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {selectedProperty.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{selectedProperty.address}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p className="text-sm">{selectedProperty.city}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedProperty.state && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">State</label>
                        <p className="text-sm">{selectedProperty.state}</p>
                      </div>
                    )}
                    {selectedProperty.postal_code && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Postal Code</label>
                        <p className="text-sm">{selectedProperty.postal_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-3">Description</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedProperty.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}