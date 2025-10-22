import { getValidToken } from '@/features/auth/utils';

// Update the API_BASE_URL to match your backend port
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api/v1';

export interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  property_type: string;
  listing_type: string;
  status: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
  owner?: any;
  // Computed fields for backward compatibility
  location?: string;
  area?: number;
}

export interface ProjectFilters {
  status?: string;
  project_type?: string;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  blockedUnits: number;
}

export interface ProjectUnit {
  id: number;
  project_id: number;
  unit_number: string;
  unit_type: string;
  floor_number: number;
  tower?: string;
  area_sqft: number;
  area_sqm: number;
  price: number;
  price_per_sqft: number;
  maintenance_charge?: number;
  parking_spaces: number;
  balconies: number;
  bathrooms: number;
  bedrooms: number;
  status: 'available' | 'sold' | 'blocked' | 'reserved';
  floor_plan_image?: string;
  specifications?: Record<string, any>;
  amenities?: string[];
  is_corner_unit: boolean;
  has_terrace: boolean;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  alt_text?: string;
  image_type: 'exterior' | 'interior' | 'amenity' | 'floor_plan' | 'site_plan' | 'location' | 'gallery';
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  builder_id: number;
  name: string;
  description?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  project_type: 'residential' | 'commercial' | 'mixed_use' | 'villa' | 'apartment' | 'office' | 'retail';
  status: 'planning' | 'pre_launch' | 'under_construction' | 'ready_to_move' | 'completed' | 'on_hold';
  total_units: number;
  available_units: number;
  sold_units: number;
  blocked_units: number;
  start_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  rera_number?: string;
  approval_status: string;
  amenities?: string[];
  specifications?: Record<string, any>;
  pricing?: Record<string, any>;
  floor_plans?: string[];
  brochure_url?: string;
  video_url?: string;
  virtual_tour_url?: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  builder?: User;
  images?: ProjectImage[];
  units?: ProjectUnit[];
  unitStats?: {
    total: number;
    available: number;
    sold: number;
    blocked: number;
  };
}
export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

// Add or update these types
export interface PropertyFilters {
  location?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  status?: string;
  is_featured?: boolean;
  keywords?: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  filters: PropertyFilters;
  created_at: string;
}

export interface SearchHistoryItem {
  id: number;
  search_query: string;
  filters: PropertyFilters;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: number;
  property_id: number;
  user_id: number;
  message: string;
  contact_info?: any;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  property?: Property;
  user?: User;
}

export interface Favorite {
  id: number;
  user_id: number;
  property_id: number;
  created_at: string;
  property?: Property;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get valid token (automatically clears invalid tokens)
  const validToken = getValidToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(validToken && { Authorization: `Bearer ${validToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 responses by clearing invalid tokens
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.code === 'INVALID_TOKEN' || errorData.error?.code === 'MISSING_TOKEN') {
        console.warn('Received 401 with invalid token, clearing from localStorage');
        localStorage.removeItem('token');
      }
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  // Properties
  getProperties: async (filters?: PropertyFilters): Promise<{ data: Property[]; total: number; page: number; limit: number }> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Map frontend parameter names to backend parameter names
          let backendKey = key;
          // Note: 'location' stays as 'location' - backend now supports this for searching city, state, and address
          if (key === 'property_type') backendKey = 'property_type';
          if (key === 'listing_type') backendKey = 'listing_type';
          if (key === 'price') backendKey = 'price';
          if (key === 'area') backendKey = 'area_sqft';
          if (key === 'sort_by') backendKey = 'sort_by';
          if (key === 'sort_order') backendKey = 'sort_order';

          // Handle amenities array specially
          if (key === 'amenities' && Array.isArray(value)) {
            if (value.length > 0) {
              params.append('amenities', value.join(','));
            }
            return;
          }

          params.append(backendKey, value.toString());
        }
      });
    }

    console.log("The params are", params.toString())

    const queryString = params.toString();
    const response = await apiRequest(`/properties${queryString ? `?${queryString}` : ''}`) as any;
    return response;
  },

  getProperty: async (id: number): Promise<Property> => {
    const response = await apiRequest(`/properties/${id}`) as any;
    return response.data;
  },

  searchProperties: async (query: string, filters?: PropertyFilters): Promise<{ data: Property[]; total: number }> => {
    const params = new URLSearchParams({ keywords: query });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle location field specially - send as location parameter for backend to process
          if (key === 'location') {
            params.append('location', value.toString());
            return;
          }

          // Handle amenities array specially
          if (key === 'amenities' && Array.isArray(value) && value.length > 0) {
            params.append('amenities', value.join(','));
            return;
          }

          // Map other frontend parameter names to backend parameter names
          let backendKey = key;
          if (key === 'property_type') backendKey = 'propertyType';
          if (key === 'listing_type') backendKey = 'listingType';
          if (key === 'min_price') backendKey = 'minPrice';
          if (key === 'max_price') backendKey = 'maxPrice';
          if (key === 'min_area') backendKey = 'minArea';
          if (key === 'max_area') backendKey = 'maxArea';
          if (key === 'sort_by') backendKey = 'sortBy';
          if (key === 'sort_order') backendKey = 'sortOrder';

          params.append(backendKey, value.toString());
        }
      });
    }

    const response = await apiRequest(`/properties/search?${params.toString()}`) as any;
    return { data: response.data, total: response.pagination?.total || response.data?.length || 0 };
  },



  updateProperty: (id: number, propertyData: Partial<Property>): Promise<Property> => {
    return apiRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },

  deleteProperty: (id: number): Promise<void> => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  getPropertyImages: (propertyId: number): Promise<{ data: { images: PropertyImage[] } }> => {
    return apiRequest(`/upload/properties/${propertyId}/images`);
  },

  deletePropertyImage: (propertyId: number, imageId: number): Promise<void> => {
    return apiRequest(`/upload/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  getPropertyAnalytics: (propertyId: number): Promise<any> => {
    return apiRequest(`/properties/${propertyId}/analytics`);
  },

  getUserPropertyAnalytics: (): Promise<any> => {
    return apiRequest('/properties/analytics/dashboard');
  },

  getPropertyPerformance: (propertyId: number): Promise<any> => {
    return apiRequest(`/properties/${propertyId}/performance`);
  },

  // Authentication
  login: async (email: string, password: string): Promise<{ user: any; token: string }> => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }) as any;
    // Backend returns { success: true, data: { user, tokens: { accessToken, refreshToken } } }
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken
    };
  },

  register: async (userData: { email: string; password: string; firstName: string; lastName: string; role?: string; phone?: string }): Promise<{ user: any; token: string }> => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }) as any;
    // Backend returns { success: true, data: { user, tokens: { accessToken, refreshToken } } }
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken
    };
  },

  logout: (): Promise<void> => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  verifyEmail: async (email: string, otp: string): Promise<void> => {
    await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resendVerificationOTP: async (email: string): Promise<void> => {
    await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // User Management
  getProfile: async (): Promise<any> => {
    const response = await apiRequest('/auth/profile') as any;
    // Backend returns { success: true, data: { user } }
    return response.data.user;
  },

  updateProfile: (userData: any): Promise<any> => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Favorites
  getFavorites: (): Promise<{ data: Property[] }> => {
    return apiRequest('/favorites');
  },

  addToFavorites: (propertyId: number): Promise<void> => {
    return apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  removeFromFavorites: (propertyId: number): Promise<void> => {
    return apiRequest(`/favorites/${propertyId}`, {
      method: 'DELETE',
    });
  },

  // User Properties
  getUserProperties: (): Promise<{ data: Property[] }> => {
    return apiRequest('/properties/my-properties') as Promise<{ data: Property[] }>;
  },

  // Inquiries
  getInquiries: (): Promise<{ data: any[] }> => {
    return apiRequest('/inquiries') as Promise<{ data: any[] }>;
  },

  respondToInquiry: (inquiryId: number, message: string): Promise<void> => {
    return apiRequest(`/inquiries/${inquiryId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  updateInquiryStatus: (inquiryId: number, status: string): Promise<void> => {
    return apiRequest(`/inquiries/${inquiryId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Property Management
  createProperty: async (propertyData: any): Promise<{ data: Property }> => {
    const response = await apiRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    }) as any;
    return response;
  },

  // Saved Searches
  getSavedSearches: (): Promise<{ data: { savedSearches: SavedSearch[] } }> => {
    return apiRequest('/saved-searches');
  },

  createSavedSearch: (name: string, filters: PropertyFilters): Promise<SavedSearch> => {
    return apiRequest('/saved-searches', {
      method: 'POST',
      body: JSON.stringify({ search_name: name, search_criteria: filters }),
    });
  },

  deleteSavedSearch: (id: number): Promise<void> => {
    return apiRequest(`/saved-searches/${id}`, {
      method: 'DELETE',
    });
  },

  // Communication - Inquiries and Messaging
  communication: {
    // Inquiries
    createInquiry: (inquiryData: {
      property_id: number;
      name: string;
      email: string;
      phone?: string;
      message: string;
    }): Promise<{ data: any }> => {
      return apiRequest('/inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiryData),
      });
    },

    getInquiries: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      property_id?: number;
    }): Promise<{ data: any[]; total: number; page: number; totalPages: number }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/inquiries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    getInquiryById: (id: number): Promise<{ data: any }> => {
      return apiRequest(`/inquiries/${id}`);
    },

    updateInquiryStatus: (id: number, status: string): Promise<{ data: any }> => {
      return apiRequest(`/inquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    deleteInquiry: (id: number): Promise<void> => {
      return apiRequest(`/inquiries/${id}`, {
        method: 'DELETE',
      });
    },

    getInquiryStats: (propertyId?: number): Promise<{ data: any }> => {
      const params = propertyId ? `?property_id=${propertyId}` : '';
      return apiRequest(`/inquiries/stats${params}`);
    },

    // Messaging
    sendMessage: (messageData: {
      recipient_id: number;
      content: string;
      property_id?: number;
      inquiry_id?: number;
    }): Promise<{ data: any }> => {
      return apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },

    getMessages: (conversationId: string, params?: {
      page?: number;
      limit?: number;
      unread_only?: boolean;
    }): Promise<{ data: any[]; total: number; page: number; totalPages: number }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
            queryParams.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/messages/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    getConversations: (params?: {
      page?: number;
      limit?: number;
      property_id?: number;
      unread_only?: boolean;
    }): Promise<{ data: any[]; total: number; page: number; totalPages: number }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
            queryParams.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/messages/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    markAsRead: (conversationId: string): Promise<{ data: any }> => {
      return apiRequest(`/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
      });
    },

    deleteMessage: (messageId: number): Promise<void> => {
      return apiRequest(`/messages/${messageId}`, {
        method: 'DELETE',
      });
    },

    getUnreadCount: (): Promise<{ data: { unread_count: number } }> => {
      return apiRequest('/messages/unread-count');
    },

    getConversationStats: (conversationId: string): Promise<{ data: any }> => {
      return apiRequest(`/messages/conversations/${conversationId}/stats`);
    },
  },

  // Legacy inquiry methods (for backward compatibility)
  createInquiry: (inquiryData: {
    property_id: number;
    message: string;
    name: string;
    email: string;
    inquirer_id?: number;
    phone?: string;
  }): Promise<any> => {
    return apiRequest('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },

  // File Upload
  upload: {
    // This method is fine
    bulkPropertyCSV: (formData: FormData): Promise<any> => {
      const validToken = getValidToken();
      return fetch(`${API_BASE_URL}/uploads/bulk/properties`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(validToken && { Authorization: `Bearer ${validToken}` }),
        },
      }).then(res => {
        console.log("The response from the backend is", res);
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error?.message || 'Upload failed') });
        }
        return res.json();
      });
    },

    // This is the method that needs fixing - note the 's' in 'uploads'
    getProgress: (uploadId: string): Promise<any> => {
      return apiRequest(`/uploads/bulk/progress/${uploadId}`);
    },

    // Also check this method if you're having issues with error reports
    getReportUri: (uploadId: string): string => {
      return `${API_BASE_URL}/uploads/bulk/error-report/${uploadId}`;
    },

    downloadPropertyTemplate: (): string => {
      return `${API_BASE_URL}/uploads/bulk/properties/template`;
    }
  },

  // Admin APIs
  admin: {
    // Add the analytics endpoint
    getAnalytics: async (): Promise<any> => {
      const response = await apiRequest('/admin/dashboard/analytics') as any;
      return response;
    },

    getUsers: (filters?: any): Promise<{ data: any[]; total: number }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
    },

    updateUser: (userId: number, userData: any): Promise<any> => {
      return apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    deleteUser: (userId: number): Promise<void> => {
      return apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    getDashboardStats: (): Promise<any> => {
      return apiRequest('/admin/dashboard/stats');
    },

    moderateProperty: (propertyId: number, action: 'approve' | 'reject', reason?: string): Promise<void> => {
      return apiRequest(`/admin/properties/${propertyId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      });
    },

    // Analytics APIs
    getTrafficAnalytics: (range: string = '30d'): Promise<any> => {
      return apiRequest(`/admin/analytics/traffic?range=${range}`);
    },

    getLeadAnalytics: (range: string = '30d'): Promise<any> => {
      return apiRequest(`/admin/analytics/leads?range=${range}`);
    },

    getListingAnalytics: (range: string = '30d'): Promise<any> => {
      return apiRequest(`/admin/analytics/listings?range=${range}`);
    },

    // Property Moderation
    getPropertiesForModeration: (filters?: any): Promise<{ data: any[]; total: number }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/admin/properties${params.toString() ? `?${params.toString()}` : ''}`);
    },

    updatePropertyStatus: (propertyId: number, updates: { isActive?: boolean; isFeatured?: boolean }): Promise<any> => {
      return apiRequest(`/admin/properties/${propertyId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    deleteProperty: (propertyId: number): Promise<void> => {
      return apiRequest(`/admin/properties/${propertyId}`, {
        method: 'DELETE',
      });
    },

    // User Management
    getUsersForModeration: (filters?: any): Promise<{ data: any[]; total: number }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
    },

    updateUserStatus: (userId: number, updates: { isActive?: boolean; isVerified?: boolean; role?: string }): Promise<any> => {
      return apiRequest(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    // System Stats
    getSystemStats: (): Promise<any> => {
      return apiRequest('/admin/system/stats');
    },
  },

  // CMS Management
  cms: {
    // Get all content (admin only)
    getContent: (filters?: {
      type?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }): Promise<{
      success: boolean;
      data: {
        content: any[];
        total: number;
        totalPages: number;
      }
    }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/cms/content`);
    },

    // Get active content (public)
    getActiveContent: (type?: string): Promise<{
      success: boolean;
      data: any[]
    }> => {
      const params = type ? `?type=${type}` : '';
      return apiRequest(`/cms/active${params}`, {
        headers: {} // No auth required for public routes
      });
    },

    // Get banners (public)
    getBanners: (): Promise<{
      success: boolean;
      data: any[]
    }> => {
      return apiRequest('/cms/banners', {
        headers: {} // No auth required for public routes
      });
    },

    // Get announcements (public)
    getAnnouncements: (): Promise<{
      success: boolean;
      data: any[]
    }> => {
      return apiRequest('/cms/announcements', {
        headers: {} // No auth required for public routes
      });
    },

    // Get content by key (public)
    getContentByKey: (key: string): Promise<{
      success: boolean;
      data: any
    }> => {
      return apiRequest(`/cms/key/${key}`, {
        headers: {} // No auth required for public routes
      });
    },

    // Get content by ID (admin only)
    getContentById: (id: number): Promise<{
      success: boolean;
      data: any
    }> => {
      return apiRequest(`/cms/content/${id}`);
    },

    // Create content (admin only)
    createContent: (contentData: {
      type: 'banner' | 'announcement' | 'page' | 'widget';
      key: string;
      title: string;
      content: string;
      metadata?: object;
      isActive?: boolean;
      displayOrder?: number;
    }): Promise<{
      success: boolean;
      data: any
    }> => {
      return apiRequest('/cms/content', {
        method: 'POST',
        body: JSON.stringify(contentData),
      });
    },

    // Update content (admin only)
    updateContent: (id: number, contentData: {
      title?: string;
      content?: string;
      metadata?: object;
      isActive?: boolean;
      displayOrder?: number;
    }): Promise<{
      success: boolean;
      data: any
    }> => {
      return apiRequest(`/cms/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contentData),
      });
    },

    // Toggle content status (admin only)
    toggleContentStatus: (id: number): Promise<{
      success: boolean;
      data: any
    }> => {
      return apiRequest(`/cms/content/${id}/toggle`, {
        method: 'PATCH',
      });
    },

    // Delete content (admin only)
    deleteContent: (id: number): Promise<{
      success: boolean;
      message: string
    }> => {
      return apiRequest(`/cms/content/${id}`, {
        method: 'DELETE',
      });
    },

    // Get content stats (admin only)
    getContentStats: (): Promise<{
      success: boolean;
      data: {
        totalContent: number;
        activeContent: number;
        contentByType: Record<string, number>;
      }
    }> => {
      return apiRequest('/cms/stats');
    },
  },

  // SEO Management
  seo: {
    getSettings: (filters?: { page?: string }): Promise<{ data: any[] }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/seo/settings${params.toString() ? `?${params.toString()}` : ''}`);
    },

    createSetting: (seoData: any): Promise<{ data: any }> => {
      return apiRequest('/seo/settings', {
        method: 'POST',
        body: JSON.stringify(seoData),
      });
    },

    updateSetting: (id: number, seoData: any): Promise<{ data: any }> => {
      return apiRequest(`/seo/settings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(seoData),
      });
    },

    deleteSetting: (id: number): Promise<void> => {
      return apiRequest(`/seo/settings/${id}`, {
        method: 'DELETE',
      });
    },

    generateSitemap: (): Promise<{ data: any }> => {
      return apiRequest('/seo/generate-sitemap', {
        method: 'POST',
      });
    },
  },

  // URL Redirects
  redirects: {
    getRedirects: (): Promise<{ data: any[] }> => {
      return apiRequest('/redirects');
    },

    createRedirect: (redirectData: any): Promise<{ data: any }> => {
      return apiRequest('/redirects', {
        method: 'POST',
        body: JSON.stringify(redirectData),
      });
    },

    updateRedirect: (id: number, redirectData: any): Promise<{ data: any }> => {
      return apiRequest(`/redirects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(redirectData),
      });
    },

    deleteRedirect: (id: number): Promise<void> => {
      return apiRequest(`/redirects/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Review Moderation
  reviews: {
    getReviews: (filters?: { status?: string; property_id?: number }): Promise<{ data: any[] }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      return apiRequest(`/moderation/reviews${params.toString() ? `?${params.toString()}` : ''}`);
    },

    moderateReview: (reviewId: number, action: 'approve' | 'reject', reason?: string): Promise<void> => {
      return apiRequest(`/moderation/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, reason }),
      });
    },

    deleteReview: (reviewId: number): Promise<void> => {
      return apiRequest(`/moderation/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    },
  },

  // Conversation methods
  getConversations: (params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiRequest(`/conversations${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getConversationById: (conversationId: number): Promise<any> => {
    return apiRequest(`/conversations/${conversationId}`, {
      method: 'GET',
    });
  },

  // Message methods
  getMessages: (conversationId: number, params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiRequest(`/messages/conversation/${conversationId}${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  sendMessage: (conversationId: number, content: string): Promise<any> => {
    return apiRequest(`/messages/conversation/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Site Visits - Updated to match backend routes
  createSiteVisit: (visitData: {
    property_id: number;
    scheduled_at: string;
    visitor_name: string;
    visitor_email: string;
    visitor_id?: number;
    visitor_phone?: string;
    notes?: string;
  }): Promise<any> => {
    // Public endpoint - no auth required based on backend routes
    return fetch(`${API_BASE_URL}/site-visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitData)
    }).then(res => {
      if (!res.ok) {
        throw new ApiError(res.status, `HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  },

  getSiteVisits: (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    propertyId?: number
  }): Promise<{
    success: boolean;
    data: {
      visits: any[]
    }
  }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/site-visits/agent${params.toString() ? `?${params.toString()}` : ''}`);
  },

  getPropertySiteVisits: (propertyId: number): Promise<{
    success: boolean;
    data: {
      visits: any[]
    }
  }> => {
    return apiRequest(`/site-visits/property/${propertyId}`);
  },

  getSiteVisitStats: (): Promise<{
    success: boolean;
    data: {
      total: number;
      scheduled: number;
      completed: number;
      cancelled: number;
      no_show: number;
      upcoming: number;
    }
  }> => {
    return apiRequest('/site-visits/stats');
  },

  updateSiteVisit: (visitId: number, updates: {
    status?: string;
    scheduled_at?: string;
    agent_notes?: string;
  }): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> => {
    return apiRequest(`/site-visits/${visitId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },


  // Builder Project Management APIs
  projects: {
    // Get all projects for the authenticated builder
    getBuilderProjects: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      project_type?: string;
    }): Promise<{
      success: boolean;
      data: {
        projects: Project[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const query = queryParams.toString();
      return apiRequest(`/projects${query ? `?${query}` : ''}`);
    },

    // Get project by ID
    getProjectById: (id: number): Promise<{
      success: boolean;
      data: { project: Project };
    }> => {
      return apiRequest(`/projects/${id}`);
    },

    // Create new project
    createProject: (projectData: {
      name: string;
      description?: string;
      location: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      projectType: string;
      totalUnits?: number;
      startDate?: string;
      expectedCompletion?: string;
      reraNumber?: string;
      amenities?: string[];
      specifications?: Record<string, any>;
      pricing?: Record<string, any>;
    }): Promise<{
      success: boolean;
      data: { project: Project };
      message: string;
    }> => {
      return apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    },

    // Update project
    updateProject: (id: number, projectData: Partial<Project>): Promise<{
      success: boolean;
      data: { project: Project };
      message: string;
    }> => {
      return apiRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
    },

    // Update project status
    updateProjectStatus: (id: number, status: string): Promise<{
      success: boolean;
      data: { project: Project };
      message: string;
    }> => {
      return apiRequest(`/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    // Delete project
    deleteProject: (id: number): Promise<{
      success: boolean;
      message: string;
    }> => {
      return apiRequest(`/projects/${id}`, {
        method: 'DELETE',
      });
    },

    // Get project statistics
    getProjectStats: (): Promise<{
      success: boolean;
      data: ProjectStats;
    }> => {
      return apiRequest('/projects/stats');
    },

    // Project Units Management
    units: {
      // Get units for a project
      getUnits: async (projectId: number, params?: {
        page?: number;
        limit?: number;
        status?: string;
        unitType?: string;
        floorNumber?: number;
        tower?: string;
      }): Promise<{
        success: boolean;
        data: {
          units: ProjectUnit[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }> => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, value.toString());
            }
          });
        }

        const query = queryParams.toString();
        return apiRequest(`/projects/${projectId}/units${query ? `?${query}` : ''}`);
      },

      // Get unit by ID
      getUnit: async (projectId: number, unitId: number): Promise<{
        success: boolean;
        data: { unit: ProjectUnit };
      }> => {
        return apiRequest(`/projects/${projectId}/units/${unitId}`);
      },

      // Create new unit
      createUnit: async (projectId: number, unitData: {
        unitNumber: string;
        unitType: string;
        floorNumber: number;
        tower?: string;
        areaSqft: number;
        areaSqm?: number;
        carpetArea?: number;
        builtUpArea?: number;
        superBuiltUpArea?: number;
        price: number;
        pricePerSqft?: number;
        maintenanceCharge?: number;
        parkingSpaces?: number;
        balconies?: number;
        bathrooms: number;
        bedrooms: number;
        facing?: string;
        specifications?: Record<string, any>;
        amenities?: string[];
        isCornerUnit?: boolean;
        hasTerrace?: boolean;
      }): Promise<{
        success: boolean;
        data: { unit: ProjectUnit };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units`, {
          method: 'POST',
          body: JSON.stringify(unitData),
        });
      },

      // Update unit
      updateUnit: async (projectId: number, unitId: number, unitData: {
        unitNumber?: string;
        unitType?: string;
        floorNumber?: number;
        tower?: string;
        areaSqft?: number;
        areaSqm?: number;
        carpetArea?: number;
        builtUpArea?: number;
        superBuiltUpArea?: number;
        price?: number;
        pricePerSqft?: number;
        maintenanceCharge?: number;
        parkingSpaces?: number;
        balconies?: number;
        bathrooms?: number;
        bedrooms?: number;
        facing?: string;
        status?: string;
        specifications?: Record<string, any>;
        amenities?: string[];
        isCornerUnit?: boolean;
        hasTerrace?: boolean;
      }): Promise<{
        success: boolean;
        data: { unit: ProjectUnit };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units/${unitId}`, {
          method: 'PUT',
          body: JSON.stringify(unitData),
        });
      },

      // Update unit status
      updateUnitStatus: async (projectId: number, unitId: number, status: string): Promise<{
        success: boolean;
        data: { unit: ProjectUnit };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units/${unitId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
      },

      // Delete unit
      deleteUnit: async (projectId: number, unitId: number): Promise<{
        success: boolean;
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units/${unitId}`, {
          method: 'DELETE',
        });
      },

      // Bulk create units
      bulkCreateUnits: async (projectId: number, units: Array<{
        unitNumber: string;
        unitType: string;
        floorNumber: number;
        tower?: string;
        areaSqft: number;
        areaSqm?: number;
        carpetArea?: number;
        builtUpArea?: number;
        superBuiltUpArea?: number;
        price: number;
        pricePerSqft?: number;
        maintenanceCharge?: number;
        parkingSpaces?: number;
        balconies?: number;
        bathrooms: number;
        bedrooms: number;
        facing?: string;
        specifications?: Record<string, any>;
        amenities?: string[];
        isCornerUnit?: boolean;
        hasTerrace?: boolean;
      }>): Promise<{
        success: boolean;
        data: { units: ProjectUnit[]; count: number };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units/bulk`, {
          method: 'POST',
          body: JSON.stringify({ units }),
        });
      },

      // Bulk create units from CSV
      bulkCreateUnitsFromCSV: async (projectId: number, file: File): Promise<{
        success: boolean;
        data: { units: ProjectUnit[]; count: number; errors?: string[] };
        message: string;
      }> => {
        const formData = new FormData();
        formData.append('file', file);

        const validToken = getValidToken();
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/units/bulk-csv`, {
          method: 'POST',
          headers: {
            ...(validToken && { Authorization: `Bearer ${validToken}` }),
          },
          body: formData,
        });

        return response.json();
      },

      // Download CSV template
      downloadTemplate: async (projectId: number): Promise<Blob> => {
        const validToken = getValidToken();
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/units/template`, {
          headers: {
            ...(validToken && { Authorization: `Bearer ${validToken}` }),
          },
        });

        return response.blob();
      },

      // Bulk update units
      bulkUpdateUnits: async (projectId: number, updates: Array<{
        unitId: number;
        data: Partial<ProjectUnit>;
      }>): Promise<{
        success: boolean;
        data: { units: ProjectUnit[]; count: number };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units/bulk-update`, {
          method: 'PUT',
          body: JSON.stringify({ updates }),
        });
      },

      // Get unit statistics for a project
      getUnitStats: async (projectId: number): Promise<{
        success: boolean;
        data: {
          total: number;
          available: number;
          sold: number;
          blocked: number;
          reserved: number;
          byType: Record<string, number>;
          byFloor: Record<number, number>;
          byTower: Record<string, number>;
          averagePrice: number;
          priceRange: { min: number; max: number };
        };
      }> => {
        return apiRequest(`/projects/${projectId}/units/stats`);
      },

      // Generate unit pricing
      generateUnitPricing: async (projectId: number, pricingData: {
        basePrice: number;
        floorRisePercent?: number;
        cornerUnitPremium?: number;
        facingPremiums?: Record<string, number>;
        unitTypePremiums?: Record<string, number>;
      }): Promise<{
        success: boolean;
        data: { updatedUnits: number };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/units/generate-pricing`, {
          method: 'POST',
          body: JSON.stringify(pricingData),
        });
      },
    },

    // Project Images Management
    images: {
      // Get project images
      getProjectImages: (projectId: number, imageType?: string): Promise<{
        success: boolean;
        data: { images: ProjectImage[] };
      }> => {
        const params = imageType ? `?image_type=${imageType}` : '';
        return apiRequest(`/projects/${projectId}/images${params}`);
      },

      // Upload project images
      uploadProjectImages: (projectId: number, formData: FormData): Promise<{
        success: boolean;
        data: { images: ProjectImage[] };
        message: string;
      }> => {
        const validToken = getValidToken();
        return fetch(`${API_BASE_URL}/projects/${projectId}/images`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(validToken && { Authorization: `Bearer ${validToken}` }),
          },
        }).then(res => res.json());
      },

      // Update image details
      updateProjectImage: (projectId: number, imageId: number, imageData: {
        alt_text?: string;
        image_type?: string;
        is_primary?: boolean;
        display_order?: number;
      }): Promise<{
        success: boolean;
        data: { image: ProjectImage };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/images/${imageId}`, {
          method: 'PUT',
          body: JSON.stringify(imageData),
        });
      },

      // Set primary image
      setPrimaryImage: (projectId: number, imageId: number): Promise<{
        success: boolean;
        data: { image: ProjectImage };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/images/${imageId}/primary`, {
          method: 'PATCH',
        });
      },

      // Delete project image
      deleteProjectImage: (projectId: number, imageId: number): Promise<{
        success: boolean;
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/images/${imageId}`, {
          method: 'DELETE',
        });
      },

      // Reorder images
      reorderImages: (projectId: number, imageOrders: Array<{
        imageId: number;
        displayOrder: number;
      }>): Promise<{
        success: boolean;
        data: { images: ProjectImage[] };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/images/reorder`, {
          method: 'PUT',
          body: JSON.stringify({ imageOrders }),
        });
      },
    },

    // Project Marketing Management
    marketing: {
      // Upload brochure
      uploadBrochure: (projectId: number, formData: FormData): Promise<{
        success: boolean;
        data: { brochure_url: string };
        message: string;
      }> => {
        const validToken = getValidToken();
        return fetch(`${API_BASE_URL}/projects/${projectId}/brochure`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(validToken && { Authorization: `Bearer ${validToken}` }),
          },
        }).then(res => res.json());
      },

      // Update marketing materials
      updateMarketingMaterials: (projectId: number, materials: {
        brochure_url?: string;
        video_url?: string;
        virtual_tour_url?: string;
        floor_plans?: string[];
      }): Promise<{
        success: boolean;
        data: { project: Project };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/marketing`, {
          method: 'PUT',
          body: JSON.stringify(materials),
        });
      },

      // Get marketing analytics
      getMarketingAnalytics: (projectId: number, range?: string): Promise<{
        success: boolean;
        data: {
          views: number;
          inquiries: number;
          brochureDownloads: number;
          virtualTourViews: number;
          leadConversion: number;
        };
      }> => {
        const params = range ? `?range=${range}` : '';
        return apiRequest(`/projects/${projectId}/marketing/analytics${params}`);
      },
    },

    // Project Timeline Management
    timeline: {
      // Get project timeline
      getProjectTimeline: (projectId: number): Promise<{
        success: boolean;
        data: {
          milestones: Array<{
            id: number;
            title: string;
            description?: string;
            planned_date: string;
            actual_date?: string;
            status: 'pending' | 'in_progress' | 'completed' | 'delayed';
            completion_percentage: number;
          }>;
        };
      }> => {
        return apiRequest(`/projects/${projectId}/timeline`);
      },

      // Add milestone
      addMilestone: (projectId: number, milestone: {
        title: string;
        description?: string;
        planned_date: string;
        status?: string;
      }): Promise<{
        success: boolean;
        data: { milestone: any };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/timeline/milestones`, {
          method: 'POST',
          body: JSON.stringify(milestone),
        });
      },

      // Update milestone
      updateMilestone: (projectId: number, milestoneId: number, milestone: {
        title?: string;
        description?: string;
        planned_date?: string;
        actual_date?: string;
        status?: string;
        completion_percentage?: number;
      }): Promise<{
        success: boolean;
        data: { milestone: any };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/timeline/milestones/${milestoneId}`, {
          method: 'PUT',
          body: JSON.stringify(milestone),
        });
      },

      // Delete milestone
      deleteMilestone: (projectId: number, milestoneId: number): Promise<{
        success: boolean;
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/timeline/milestones/${milestoneId}`, {
          method: 'DELETE',
        });
      },
    },

    // Project Analytics
    analytics: {
      // Get project performance analytics
      getProjectAnalytics: (projectId: number, range?: string): Promise<{
        success: boolean;
        data: {
          views: number;
          inquiries: number;
          unitsSold: number;
          revenue: number;
          conversionRate: number;
          averagePricePerSqft: number;
          topPerformingUnits: ProjectUnit[];
          monthlyTrends: Array<{
            month: string;
            views: number;
            inquiries: number;
            sales: number;
          }>;
        };
      }> => {
        const params = range ? `?range=${range}` : '';
        return apiRequest(`/projects/${projectId}/analytics${params}`);
      },

      // Get builder dashboard analytics
      getBuilderAnalytics: (range?: string): Promise<{
        success: boolean;
        data: {
          totalProjects: number;
          activeProjects: number;
          totalUnits: number;
          soldUnits: number;
          totalRevenue: number;
          averageUnitPrice: number;
          projectPerformance: Array<{
            project: Project;
            performance: {
              views: number;
              inquiries: number;
              sales: number;
              revenue: number;
            };
          }>;
          monthlyTrends: Array<{
            month: string;
            projects: number;
            units: number;
            sales: number;
            revenue: number;
          }>;
        };
      }> => {
        const params = range ? `?range=${range}` : '';
        return apiRequest(`/projects/analytics/dashboard${params}`);
      },
    },

    // Project Reports
    reports: {
      // Generate project report
      generateProjectReport: (projectId: number, reportType: 'sales' | 'inventory' | 'financial', format?: 'pdf' | 'excel'): Promise<{
        success: boolean;
        data: { reportUrl: string };
        message: string;
      }> => {
        return apiRequest(`/projects/${projectId}/reports`, {
          method: 'POST',
          body: JSON.stringify({ reportType, format: format || 'pdf' }),
        });
      },

      // Get available reports
      getProjectReports: (projectId: number): Promise<{
        success: boolean;
        data: {
          reports: Array<{
            id: number;
            type: string;
            format: string;
            generated_at: string;
            download_url: string;
          }>;
        };
      }> => {
        return apiRequest(`/projects/${projectId}/reports`);
      },

      // Download report
      downloadProjectReport: (projectId: number, reportId: number): string => {
        const validToken = getValidToken();
        return `${API_BASE_URL}/projects/${projectId}/reports/${reportId}/download?token=${validToken}`;
      },
    },
  },

  // Projects - Public projects listing
  getProjects: async (filters?: ProjectFilters): Promise<{
    success: boolean;
    data: {
      projects: Project[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const query = params.toString();
    return apiRequest(`/public/projects${query ? `?${query}` : ''}`);
  },

  // Project details - Public project view
  getProject: async (id: number): Promise<{
    success: boolean;
    data: {
      project: Project;
    };
  }> => {
    return apiRequest(`/public/projects/${id}`);
  },

  // Search projects
  searchProjects: async (query: string, filters?: ProjectFilters): Promise<{
    success: boolean;
    data: {
      projects: Project[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> => {
    const queryParams = new URLSearchParams({ keywords: query });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    return apiRequest(`/public/projects/search?${queryParams.toString()}`);
  },
};
export const getSavedSearches = api.getSavedSearches;
export const deleteSavedSearch = api.deleteSavedSearch;
export { ApiError };