import { httpClient } from '@/shared/lib/httpClient';
import type { ApiResponse, PaginatedResponse } from '@/shared/types';
import type { ReviewModerationData } from '../types/moderation';

export interface CmsContent {
  id: number;
  type: 'banner' | 'announcement' | 'page' | 'widget';
  key: string;
  title: string;
  content: string;
  metadata?: any;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFilters {
  type?: string;
  isActive?: boolean;
  search?: string;
}

export interface SeoSetting {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UrlRedirect {
  id: number;
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  isActive: boolean;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected';
  property_id?: number;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContentService {
  // CMS Content Management
  getContent(params: ContentFilters & { page: number; limit: number }): Promise<ApiResponse<PaginatedResponse<CmsContent>>>;
  getContentById(id: number): Promise<ApiResponse<CmsContent>>;
  createContent(contentData: Omit<CmsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CmsContent>>;
  updateContent(id: number, contentData: Partial<CmsContent>): Promise<ApiResponse<CmsContent>>;
  toggleContentStatus(id: number): Promise<ApiResponse<CmsContent>>;
  deleteContent(id: number): Promise<ApiResponse<void>>;

  // SEO Management
  getSeoSettings(filters?: { page?: string }): Promise<ApiResponse<SeoSetting[]>>;
  createSeoSetting(seoData: Omit<SeoSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SeoSetting>>;
  updateSeoSetting(id: number, seoData: Partial<SeoSetting>): Promise<ApiResponse<SeoSetting>>;
  deleteSeoSetting(id: number): Promise<ApiResponse<void>>;
  generateSitemap(): Promise<ApiResponse<any>>;

  // URL Redirects
  getRedirects(): Promise<ApiResponse<UrlRedirect[]>>;
  createRedirect(redirectData: Omit<UrlRedirect, 'id' | 'hitCount' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UrlRedirect>>;
  updateRedirect(id: number, redirectData: Partial<UrlRedirect>): Promise<ApiResponse<UrlRedirect>>;
  deleteRedirect(id: number): Promise<ApiResponse<void>>;

  // Review Moderation
  getReviews(filters?: ReviewFilters): Promise<ApiResponse<PaginatedResponse<ReviewModerationData>>>;
  updateReview(reviewId: number, updates: { isApproved?: boolean; isActive?: boolean }): Promise<ApiResponse<ReviewModerationData>>;
  moderateReview(reviewId: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>>;
  deleteReview(reviewId: number): Promise<ApiResponse<void>>;
}

class ContentServiceImpl implements ContentService {
  // CMS Content Management
  async getContent(params: ContentFilters & { page: number; limit: number }): Promise<ApiResponse<PaginatedResponse<CmsContent>>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...Object.fromEntries(
          Object.entries(params).filter(([key, value]) =>
            key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
          )
        ),
      });

      const response = await httpClient.get<{
        success: boolean;
        data: {
          content: CmsContent[];
          total: number;
          totalPages: number;
        }
      }>(`/admin/cms/content?${queryParams}`);

      return {
        success: true,
        data: {
          data: response.data.content,
          total: response.data.total,
          page: params.page,
          limit: params.limit,
          totalPages: response.data.totalPages
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching content:', error);
      return {
        success: false,
        data: {
          data: [],
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0
        },
        error: {
          code: 'CONTENT_LIST_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch content'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getContentById(id: number): Promise<ApiResponse<CmsContent>> {
    try {
      const response = await httpClient.get<{
        success: boolean;
        data: CmsContent;
      }>(`/admin/cms/content/${id}`);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching content:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'CONTENT_FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch content'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async createContent(contentData: Omit<CmsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CmsContent>> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        data: CmsContent;
      }>('/admin/cms/content', contentData);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error creating content:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'CONTENT_CREATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to create content'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateContent(id: number, contentData: Partial<CmsContent>): Promise<ApiResponse<CmsContent>> {
    try {
      const response = await httpClient.put<{
        success: boolean;
        data: CmsContent;
      }>(`/admin/cms/content/${id}`, contentData);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error updating content:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'CONTENT_UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update content'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async toggleContentStatus(id: number): Promise<ApiResponse<CmsContent>> {
    try {
      const response = await httpClient.patch<{
        success: boolean;
        data: CmsContent;
      }>(`/admin/cms/content/${id}/toggle`);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error toggling content status:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'CONTENT_STATUS_ERROR',
          message: error.response?.data?.error?.message || 'Failed to toggle content status'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteContent(id: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/cms/content/${id}`);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error deleting content:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'CONTENT_DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete content'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // SEO Management
  async getSeoSettings(filters?: { page?: string }): Promise<ApiResponse<SeoSetting[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) {
        params.append('page', filters.page);
      }

      const response = await httpClient.get<{
        data: SeoSetting[];
      }>(`/admin/seo/settings${params.toString() ? `?${params.toString()}` : ''}`);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching SEO settings:', error);
      return {
        success: false,
        data: [] as SeoSetting[],
        error: {
          code: 'SEO_FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch SEO settings'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async createSeoSetting(seoData: Omit<SeoSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SeoSetting>> {
    try {
      const response = await httpClient.post<{
        data: SeoSetting;
      }>('/admin/seo/settings', seoData);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error creating SEO setting:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'SEO_CREATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to create SEO setting'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateSeoSetting(id: number, seoData: Partial<SeoSetting>): Promise<ApiResponse<SeoSetting>> {
    try {
      const response = await httpClient.put<{
        data: SeoSetting;
      }>(`/admin/seo/settings/${id}`, seoData);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error updating SEO setting:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'SEO_UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update SEO setting'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteSeoSetting(id: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/seo/settings/${id}`);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error deleting SEO setting:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'SEO_DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete SEO setting'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateSitemap(): Promise<ApiResponse<any>> {
    try {
      const response = await httpClient.post<{
        data: any;
      }>('/admin/seo/generate-sitemap');

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error generating sitemap:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'SITEMAP_ERROR',
          message: error.response?.data?.error?.message || 'Failed to generate sitemap'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // URL Redirects
  async getRedirects(): Promise<ApiResponse<UrlRedirect[]>> {
    try {
      const response = await httpClient.get<{
        data: UrlRedirect[];
      }>('/admin/redirects');

      console.log('The response is urlRedirects,', response)
      return {
        success: true,
        data: response.data || [],
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching redirects:', error);
      return {
        success: false,
        data: [],
        error: {
          code: 'REDIRECT_FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch redirects'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async createRedirect(redirectData: Omit<UrlRedirect, 'id' | 'hitCount' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UrlRedirect>> {
    try {
      const response = await httpClient.post<{
        data: UrlRedirect;
      }>('/admin/redirects', redirectData);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error creating redirect:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'REDIRECT_CREATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to create redirect'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateRedirect(id: number, redirectData: Partial<UrlRedirect>): Promise<ApiResponse<UrlRedirect>> {
    try {
      const response = await httpClient.put<{
        data: UrlRedirect;
      }>(`/admin/redirects/${id}`, redirectData);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error updating redirect:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'REDIRECT_UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update redirect'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteRedirect(id: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/redirects/${id}`);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error deleting redirect:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'REDIRECT_DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete redirect'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Review Moderation
  async getReviews(filters?: ReviewFilters): Promise<ApiResponse<PaginatedResponse<ReviewModerationData>>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await httpClient.get<{
        success: boolean;
        data: {
          reviews: ReviewModerationData[];
          total: number;
          totalPages: number;
        }
      }>(`/admin/reviews${params.toString() ? `?${params.toString()}` : ''}`);

      console.log("The response in getReviews is", response)
      return {
        success: true,
        data: {
          data: response.data?.reviews || [],
          total: response.data?.total || 0,
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          totalPages: response.data?.totalPages || 0
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return {
        success: false,
        data: {
          data: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          totalPages: 0
        },
        error: {
          code: 'REVIEW_FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch reviews'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateReview(reviewId: number, updates: { isApproved?: boolean; isActive?: boolean }): Promise<ApiResponse<ReviewModerationData>> {
    try {
      const response = await httpClient.put<{
        success: boolean;
        data: ReviewModerationData;
      }>(`/admin/moderation/reviews/${reviewId}`, updates);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error updating review:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'REVIEW_UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update review'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async moderateReview(reviewId: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>> {
    try {
      await httpClient.put(`/admin/moderation/reviews/${reviewId}`, {
        action,
        reason
      });

      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error moderating review:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'REVIEW_MODERATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to moderate review'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteReview(reviewId: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/moderation/reviews/${reviewId}`);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'REVIEW_DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete review'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const contentService = new ContentServiceImpl();