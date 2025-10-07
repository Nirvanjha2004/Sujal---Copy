import { getValidToken } from '@/utils/tokenUtils';

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

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface PropertyFilters {
  location?: string;
  city?: string;
  state?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  amenities?: string[];
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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

export interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  filters: PropertyFilters;
  created_at: string;
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
    return response.data;
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
  getSavedSearches: (): Promise<{ data: any[] }> => {
    return apiRequest('/saved-searches');
  },

  saveSearch: (searchData: any): Promise<any> => {
    return apiRequest('/saved-searches', {
      method: 'POST',
      body: JSON.stringify(searchData),
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
  createInquiry: (inquiryData: { propertyId: number; message: string; contactInfo?: any }): Promise<any> => {
    return apiRequest('/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        property_id: inquiryData.propertyId,
        message: inquiryData.message,
        ...inquiryData.contactInfo,
      }),
    });
  },

  // File Upload
  upload: {
    bulkPropertyCSV: (formData: FormData): Promise<any> => {
      const validToken = getValidToken();
      return fetch(`${API_BASE_URL}/upload/bulk/properties`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(validToken && { Authorization: `Bearer ${validToken}` }),
        },
      }).then(res => res.json());
    },
    getProgress: (uploadId: string): Promise<any> => {
      return apiRequest(`/upload/bulk/progress/${uploadId}`);
    },
    getReportUri: (uploadId: string): string => {
      const validToken = getValidToken();
      return `${API_BASE_URL}/upload/bulk/error-report/${uploadId}?token=${validToken}`;
    },
    propertyImages: (propertyId: number, formData: FormData): Promise<any> => {
      const validToken = getValidToken();
      return fetch(`${API_BASE_URL}/upload/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(validToken && { Authorization: `Bearer ${validToken}` }),
        },
      }).then(res => res.json());
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
};

export { ApiError };