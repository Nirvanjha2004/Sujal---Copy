import { Response } from 'express';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard API response utility class
 */
export class ApiResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    meta?: PaginationMeta
  ): Response<ApiSuccessResponse<T>> {
    const response: ApiSuccessResponse<T> = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (message) {
      response.message = message;
    }

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
  ): Response<ApiErrorResponse> {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    details: any,
    message: string = 'Validation failed'
  ): Response<ApiErrorResponse> {
    return this.error(res, 'VALIDATION_ERROR', message, 400, details);
  }

  /**
   * Send unauthorized error response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response<ApiErrorResponse> {
    return this.error(res, 'UNAUTHORIZED', message, 401);
  }

  /**
   * Send forbidden error response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response<ApiErrorResponse> {
    return this.error(res, 'FORBIDDEN', message, 403);
  }

  /**
   * Send not found error response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response<ApiErrorResponse> {
    return this.error(res, 'NOT_FOUND', message, 404);
  }

  /**
   * Send conflict error response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): Response<ApiErrorResponse> {
    return this.error(res, 'CONFLICT', message, 409);
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): Response<ApiErrorResponse> {
    return this.error(res, 'INTERNAL_SERVER_ERROR', message, 500, details);
  }

  /**
   * Send paginated success response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response<ApiSuccessResponse<T[]>> {
    const totalPages = Math.ceil(total / limit);
    
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
    };

    return this.success(res, data, message, 200, meta);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): Response<ApiSuccessResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

/**
 * Error code constants
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Server
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/**
 * Success message constants
 */
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_IMAGE_UPLOADED: 'Profile image uploaded successfully',
  
  // Properties
  PROPERTY_CREATED: 'Property created successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_DELETED: 'Property deleted successfully',
  PROPERTY_FEATURED: 'Property featured successfully',
  
  // Images
  IMAGES_UPLOADED: 'Images uploaded successfully',
  IMAGE_DELETED: 'Image deleted successfully',
  
  // Inquiries
  INQUIRY_SENT: 'Inquiry sent successfully',
  INQUIRY_UPDATED: 'Inquiry updated successfully',
  
  // Favorites
  FAVORITE_ADDED: 'Property added to favorites',
  FAVORITE_REMOVED: 'Property removed from favorites',
  
  // Saved Searches
  SEARCH_SAVED: 'Search saved successfully',
  SEARCH_UPDATED: 'Saved search updated successfully',
  SEARCH_DELETED: 'Saved search deleted successfully',
  
  // Admin
  USER_ROLE_UPDATED: 'User role updated successfully',
  USER_STATUS_UPDATED: 'User status updated successfully',
  PROPERTY_MODERATED: 'Property moderated successfully',
} as const;

export default ApiResponseUtil;