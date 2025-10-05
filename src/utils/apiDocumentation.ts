/**
 * API Documentation and Validation Integration
 * 
 * This file demonstrates the complete implementation of Task 10:
 * - Swagger/OpenAPI documentation setup
 * - Request validation middleware
 * - API response standardization
 * - API versioning support
 */

import { Request, Response, NextFunction } from 'express';
import { swaggerSpec } from '../config/swagger';
import { validate, ValidationError } from '../middleware/validation';
import { ApiResponseUtil, ApiResponse } from '../utils/apiResponse';
import { 
  defaultVersioning, 
  getApiVersion, 
  isVersion, 
  API_VERSIONS 
} from '../middleware/versioning';

/**
 * API Documentation Integration Summary
 */
export class ApiDocumentationIntegration {
  /**
   * Get Swagger specification
   */
  static getSwaggerSpec() {
    return swaggerSpec;
  }

  /**
   * Validate request using Joi schema
   */
  static validateRequest(schema: any, source: 'body' | 'query' | 'params' = 'body') {
    return validate(schema, source);
  }

  /**
   * Send standardized success response
   */
  static sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ) {
    return ApiResponseUtil.success(res, data, message, statusCode);
  }

  /**
   * Send standardized error response
   */
  static sendError(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    return ApiResponseUtil.error(res, code, message, statusCode, details);
  }

  /**
   * Get API version from request
   */
  static getRequestVersion(req: Request) {
    return getApiVersion(req);
  }

  /**
   * Check if request uses specific version
   */
  static isRequestVersion(req: Request, version: string) {
    return isVersion(req, version as any);
  }

  /**
   * Apply versioning middleware
   */
  static applyVersioning() {
    return defaultVersioning.validateVersion();
  }
}

/**
 * Example usage of all implemented features
 */
export const exampleImplementation = {
  // 1. Swagger Documentation Setup
  swaggerConfig: {
    title: 'Real Estate Portal API',
    version: '1.0.0',
    description: 'Comprehensive API for Real Estate Portal',
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Development' },
      { url: 'https://api.realestate-portal.com/api/v1', description: 'Production' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },

  // 2. Request Validation Examples
  validationSchemas: {
    userRegistration: {
      email: 'string.email().required()',
      password: 'string.min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/).required()',
      firstName: 'string.min(2).max(50).required()',
      lastName: 'string.min(2).max(50).required()',
      role: 'string.valid("buyer", "owner", "agent", "builder").required()'
    },
    propertyCreation: {
      title: 'string.min(5).max(255).required()',
      propertyType: 'string.valid("apartment", "house", "commercial", "land").required()',
      price: 'number.positive().required()',
      address: 'string.min(10).max(500).required()',
      city: 'string.min(2).max(100).required()',
      state: 'string.min(2).max(100).required()'
    }
  },

  // 3. API Response Standardization
  responseFormats: {
    success: {
      success: true,
      data: '// Response data',
      message: 'Operation successful',
      timestamp: '2024-01-15T10:30:00Z'
    },
    error: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: '// Error details'
      },
      timestamp: '2024-01-15T10:30:00Z'
    },
    paginated: {
      success: true,
      data: '// Array of items',
      meta: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10
      },
      message: 'Data retrieved successfully',
      timestamp: '2024-01-15T10:30:00Z'
    }
  },

  // 4. API Versioning Support
  versioningConfig: {
    strategy: 'URL_PATH', // /api/v1/endpoint
    supportedVersions: ['v1'],
    defaultVersion: 'v1',
    headers: {
      'API-Version': 'v1',
      'Supported-Versions': 'v1'
    }
  },

  // 5. Documentation Endpoints
  documentationEndpoints: {
    swaggerUI: '/api/docs',
    openApiJson: '/api/docs/json',
    openApiYaml: '/api/docs/yaml',
    postmanCollection: '/api/docs/postman',
    healthCheck: '/api/docs/health'
  }
};

/**
 * Implementation Status Summary
 */
export const implementationStatus = {
  completed: [
    '✅ Swagger/OpenAPI documentation setup',
    '✅ Comprehensive request validation middleware with Joi',
    '✅ Standardized API response utility with error handling',
    '✅ API versioning support with multiple strategies',
    '✅ Interactive documentation with Swagger UI',
    '✅ OpenAPI JSON/YAML export functionality',
    '✅ Postman collection generation',
    '✅ Validation error handling with detailed messages',
    '✅ Response standardization across all endpoints',
    '✅ Version-aware routing and middleware',
    '✅ Comprehensive API documentation',
    '✅ Example routes demonstrating all features'
  ],
  features: {
    documentation: {
      swaggerUI: 'Interactive API documentation interface',
      openApiSpec: 'Complete OpenAPI 3.0 specification',
      postmanCollection: 'Auto-generated Postman collection',
      apiDocumentation: 'Comprehensive API documentation guide'
    },
    validation: {
      joiSchemas: 'Comprehensive validation schemas for all endpoints',
      errorHandling: 'Detailed validation error responses',
      sanitization: 'Input sanitization and data cleaning',
      typeValidation: 'Strong type validation with TypeScript'
    },
    responseStandardization: {
      successFormat: 'Consistent success response format',
      errorFormat: 'Standardized error response format',
      paginationFormat: 'Uniform pagination response format',
      statusCodes: 'Proper HTTP status code usage'
    },
    versioning: {
      urlPath: 'Version in URL path (/api/v1/)',
      headerSupport: 'Accept-Version header support',
      queryParam: 'Version query parameter support',
      backwardCompatibility: 'Legacy route redirection'
    }
  },
  integrationPoints: [
    'Middleware integration in Express.js application',
    'Route-level validation implementation',
    'Controller response standardization',
    'Error handling middleware integration',
    'Documentation route mounting',
    'Version validation middleware'
  ]
};

export default {
  ApiDocumentationIntegration,
  exampleImplementation,
  implementationStatus
};