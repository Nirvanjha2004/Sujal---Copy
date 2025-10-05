import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (message) {
      response.data = { ...data, message } as T;
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, details: any): Response {
    return this.error(res, 'VALIDATION_ERROR', 'Invalid input data', 400, details);
  }

  static notFound(res: Response, resource: string = 'Resource'): Response {
    return this.error(res, 'NOT_FOUND', `${resource} not found`, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, 'UNAUTHORIZED', message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, 'FORBIDDEN', message, 403);
  }

  static internalError(res: Response, message: string = 'Internal server error'): Response {
    return this.error(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
}