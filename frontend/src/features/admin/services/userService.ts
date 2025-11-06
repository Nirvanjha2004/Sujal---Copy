import { httpClient } from '@/shared/lib/httpClient';
import type { ApiResponse, PaginatedResponse } from '@/shared/types';
import type { UserModerationData, UserFilters } from '../types/user';

export interface UserService {
  getUsers(params: UserFilters & { page: number; limit: number }): Promise<ApiResponse<PaginatedResponse<UserModerationData>>>;
  updateUserStatus(userId: number, updates: { isActive?: boolean; isVerified?: boolean; role?: string }): Promise<ApiResponse<void>>;
  deleteUser(userId: number): Promise<ApiResponse<void>>;
}

class UserServiceImpl implements UserService {
  async getUsers(params: UserFilters & { page: number; limit: number }): Promise<ApiResponse<PaginatedResponse<UserModerationData>>> {
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
          users: UserModerationData[]; 
          total: number; 
          totalPages: number; 
        } 
      }>(`/admin/users?${queryParams}`);

      return {
        success: true,
        data: {
          data: response.data.users,
          total: response.data.total,
          page: params.page,
          limit: params.limit,
          totalPages: response.data.totalPages
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching users:', error);
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
          code: 'USER_FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch users'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateUserStatus(userId: number, updates: { isActive?: boolean; isVerified?: boolean; role?: string }): Promise<ApiResponse<void>> {
    try {
      await httpClient.put(`/admin/users/${userId}/status`, updates);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error updating user status:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'USER_UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update user status'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/users/${userId}`);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'USER_DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete user'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const userService = new UserServiceImpl();