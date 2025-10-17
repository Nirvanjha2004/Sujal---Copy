import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { httpClient } from '@/shared/lib/httpClient';
import { AdminLayout } from '../layout/AdminLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Tooltip imports - add these to your project if they don't exist
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  is_featured: boolean;
  auto_renew?: boolean;
  expires_at?: string;
  renewal_period_days?: number;
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
  // Legacy fields for backward compatibility
  propertyType?: string;
  listingType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  viewsCount?: number;
  createdAt?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface PropertyDetailsData extends PropertyModerationData {
  // Additional fields that might be available in detailed view
  specifications?: Record<string, any>;
}

interface PropertyFilters {
  propertyType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export function PropertyModeration() {
  const [properties, setProperties] = useState<PropertyModerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Property details modal state
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetailsData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await httpClient.get<{ success: boolean; data: { properties: PropertyModerationData[]; total: number; totalPages: number } }>(`/admin/properties?${params}`);
      const data = response.data;

      setProperties(data.properties);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load properties');
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
      await httpClient.put(`/admin/properties/${propertyId}/status`, updates);
      fetchProperties(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update property');
    }
  };

  const deleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await httpClient.delete(`/admin/properties/${propertyId}`);
      fetchProperties(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete property');
    }
  };

  const fetchPropertyDetails = async (propertyId: number) => {
    try {
      setLoadingDetails(true);
      const response = await httpClient.get<{ success: boolean; data: PropertyDetailsData }>(`/properties/${propertyId}`);
      setSelectedProperty(response.data);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to load property details');
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Moderation</h1>
          <p className="text-gray-600">Review and manage property listings</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
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
          <div>
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[26%]">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[16%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {property.city} • {property.viewsCount || 0} views • {
                            (property.created_at || property.createdAt)
                              ? new Date(property.created_at || property.createdAt!).toLocaleDateString()
                              : 'N/A'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`${getPropertyTypeBadgeColor(property.property_type || property.propertyType || '')} capitalize`}>
                        {property.property_type || property.propertyType}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {property.owner
                            ? `${property.owner.first_name} ${property.owner.last_name}`
                            : property.user
                              ? `${property.user.firstName} ${property.user.lastName}`
                              : 'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {property.owner?.email || property.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        <Badge variant={(property.is_active ?? property.isActive) ? "default" : "secondary"}>
                          {(property.is_active ?? property.isActive) ? 'Active' : 'Inactive'}
                        </Badge>
                        {(property.is_featured ?? property.isFeatured) && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <TooltipProvider>
                        <div className="flex items-center space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => fetchPropertyDetails(property.id)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                disabled={loadingDetails}
                              >
                                <Icon
                                  icon={loadingDetails ? "solar:refresh-bold" : "solar:document-text-bold"}
                                  className={`size-4 ${loadingDetails ? 'animate-spin' : ''}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updatePropertyStatus(property.id, { isActive: !(property.is_active ?? property.isActive) })}
                                className="h-8 w-8"
                              >
                                <Icon
                                  icon={(property.is_active ?? property.isActive) ? "solar:eye-closed-bold" : "solar:eye-bold"}
                                  className="size-4"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{(property.is_active ?? property.isActive) ? 'Deactivate' : 'Activate'}</p>
                            </TooltipContent>
                          </Tooltip> */}

                          {/* <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updatePropertyStatus(property.id, { isFeatured: !(property.is_featured ?? property.isFeatured) })}
                                className="h-8 w-8"
                              >
                                <Icon
                                  icon={(property.is_featured ?? property.isFeatured) ? "solar:star-bold" : "solar:star-outline-bold"}
                                  className="size-4"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{(property.is_featured ?? property.isFeatured) ? 'Unfeature' : 'Feature'}</p>
                            </TooltipContent>
                          </Tooltip> */}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteProperty(property.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - unchanged */}
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

        {/* Error display - unchanged */}
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
                  (selectedProperty?.created_at || selectedProperty?.createdAt)
                    ? new Date(selectedProperty.created_at || selectedProperty.createdAt!).toLocaleDateString()
                    : 'N/A'
                }
              </DialogDescription>
            </DialogHeader>

            {selectedProperty && (
              <div className="space-y-6">
                {/* Property Images */}
                {selectedProperty.images && selectedProperty.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProperty.images.slice(0, 6).map((image, index) => (
                        <div key={image.id} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `Property image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-property.jpg';
                            }}
                          />
                          {image.is_primary && (
                            <Badge className="absolute top-2 left-2 bg-blue-600">
                              Primary
                            </Badge>
                          )}
                        </div>
                      ))}
                      {selectedProperty.images.length > 6 && (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Icon icon="solar:gallery-bold" className="size-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              +{selectedProperty.images.length - 6} more
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Property Type</label>
                        <p className="text-sm capitalize">{selectedProperty.property_type || selectedProperty.propertyType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Listing Type</label>
                        <p className="text-sm capitalize">{selectedProperty.listing_type || selectedProperty.listingType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Price</label>
                        <p className="text-sm font-semibold">{formatPrice(selectedProperty.price)}</p>
                      </div>
                      {selectedProperty.area_sqft && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Area</label>
                          <p className="text-sm">{selectedProperty.area_sqft.toLocaleString()} sq ft</p>
                        </div>
                      )}
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
                          <Badge variant={(selectedProperty.is_active ?? selectedProperty.isActive) ? "default" : "secondary"}>
                            {(selectedProperty.is_active ?? selectedProperty.isActive) ? 'Active' : 'Inactive'}
                          </Badge>
                          {(selectedProperty.is_featured ?? selectedProperty.isFeatured) && (
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

                {/* Amenities */}
                {selectedProperty.amenities && Object.keys(selectedProperty.amenities).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(selectedProperty.amenities).map(([amenity, available]) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Icon
                              icon={available ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                              className={`size-4 ${available ? 'text-green-600' : 'text-red-600'}`}
                            />
                            <span className={`text-sm capitalize ${available ? 'text-gray-900' : 'text-gray-500'}`}>
                              {amenity.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Listing Management */}
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-3">Listing Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {selectedProperty.expires_at && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Expires At</label>
                          <p className="text-sm">
                            {selectedProperty.expires_at === null
                              ? 'Never'
                              : new Date(selectedProperty.expires_at).toLocaleDateString()
                            }
                          </p>
                        </div>
                      )}
                      {selectedProperty.renewal_period_days && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Renewal Period</label>
                          <p className="text-sm">{selectedProperty.renewal_period_days} days</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Auto Renew</label>
                        <p className="text-sm">
                          <Badge variant={selectedProperty.auto_renew ? "default" : "secondary"}>
                            {selectedProperty.auto_renew ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Owner Information */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Owner Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm">
                          {selectedProperty.owner
                            ? `${selectedProperty.owner.first_name} ${selectedProperty.owner.last_name}`
                            : selectedProperty.user
                              ? `${selectedProperty.user.firstName} ${selectedProperty.user.lastName}`
                              : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">
                          {selectedProperty.owner?.email || selectedProperty.user?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {selectedProperty.owner?.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-sm">{selectedProperty.owner.phone}</p>
                        </div>
                      )}
                      {selectedProperty.owner?.role && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Role</label>
                          <p className="text-sm capitalize">{selectedProperty.owner.role}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500">User ID</label>
                        <p className="text-sm">
                          {selectedProperty.owner?.id || selectedProperty.user?.id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinates */}
                {(selectedProperty.latitude && selectedProperty.longitude) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Coordinates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Latitude</label>
                          <p className="text-sm">{selectedProperty.latitude}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Longitude</label>
                          <p className="text-sm">{selectedProperty.longitude}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Timestamps */}
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-3">Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-sm">
                        {(selectedProperty.created_at || selectedProperty.createdAt)
                          ? new Date(selectedProperty.created_at || selectedProperty.createdAt!).toLocaleString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    {selectedProperty.updated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Updated At</label>
                        <p className="text-sm">
                          {new Date(selectedProperty.updated_at!).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <Separator />
                <div className="flex justify-end space-x-3">
                  {/* <Button
                    variant="outline"
                    onClick={() => {
                      const isActive = selectedProperty.is_active ?? selectedProperty.isActive;
                      updatePropertyStatus(selectedProperty.id, { isActive: !isActive });
                      closeModal();
                    }}
                  >
                    <Icon
                      icon={(selectedProperty.is_active ?? selectedProperty.isActive) ? "solar:eye-closed-bold" : "solar:eye-bold"}
                      className="size-4 mr-2"
                    />
                    {(selectedProperty.is_active ?? selectedProperty.isActive) ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const isFeatured = selectedProperty.is_featured ?? selectedProperty.isFeatured;
                      updatePropertyStatus(selectedProperty.id, { isFeatured: !isFeatured });
                      closeModal();
                    }}
                  >
                    <Icon
                      icon={(selectedProperty.is_featured ?? selectedProperty.isFeatured) ? "solar:star-bold" : "solar:star-outline-bold"}
                      className="size-4 mr-2"
                    />
                    {(selectedProperty.is_featured ?? selectedProperty.isFeatured) ? 'Unfeature' : 'Feature'}
                  </Button> */}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteProperty(selectedProperty.id);
                      closeModal();
                    }}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="size-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}