import { Response } from 'express';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface SuccessResponse {
  success: true;
  data: any;
  warning?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

export class EmailDeliveryError extends ApiError {
  constructor(message: string = 'Failed to send email. Please try again or contact support.') {
    super(message, 400, 'EMAIL_DELIVERY_ERROR');
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Invalid input data', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHENTICATED');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

/**
 * Send standardized error response
 */
export function sendErrorResponse(res: Response, error: Error | ApiError, defaultStatusCode: number = 500): void {
  let statusCode = defaultStatusCode;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    
    // Map common error messages to appropriate codes
    if (message.includes('already exists')) {
      statusCode = 409;
      code = 'CONFLICT';
    } else if (message.includes('not found')) {
      statusCode = 404;
      code = 'NOT_FOUND';
    } else if (message.includes('Invalid') || message.includes('required')) {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
    } else if (message.includes('Unauthorized') || message.includes('permission')) {
      statusCode = 403;
      code = 'UNAUTHORIZED';
    } else if (message.includes('Authentication') || message.includes('token')) {
      statusCode = 401;
      code = 'UNAUTHENTICATED';
    } else if (message.includes('email') && (message.includes('send') || message.includes('delivery'))) {
      statusCode = 400;
      code = 'EMAIL_DELIVERY_ERROR';
    }
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Send standardized success response
 */
export function sendSuccessResponse(res: Response, data: any, statusCode: number = 200, warning?: { code: string; message: string }): void {
  const successResponse: SuccessResponse = {
    success: true,
    data,
    ...(warning && { warning }),
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(successResponse);
}

/**
 * Check if error is related to email delivery
 */
export function isEmailDeliveryError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return message.includes('failed to send') && 
         (message.includes('email') || message.includes('verification') || message.includes('reset'));
}

/**
 * Create appropriate error response for email delivery failures
 */
export function handleEmailDeliveryError(error: Error, context: 'registration' | 'verification' | 'password_reset'): ApiError {
  const contextMessages = {
    registration: 'Registration successful, but failed to send verification email. Please try resending the verification code.',
    verification: 'Failed to send verification email. Please try again or contact support.',
    password_reset: 'Failed to send password reset email. Please try again or contact support.',
  };

  return new EmailDeliveryError(contextMessages[context]);
}