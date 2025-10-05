import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';
import config from './index';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Real Estate Portal API',
    version: '1.0.0',
    description: 'Comprehensive API for Real Estate Portal - Property listings, user management, and communication features',
    contact: {
      name: 'API Support',
      email: 'support@realestate-portal.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.server.port}/api/v1`,
      description: 'Development server',
    },
    {
      url: 'https://api.realestate-portal.com/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication',
      },
    },
    schemas: {
      // Common response schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z',
          },
        },
        required: ['success', 'timestamp'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                example: 'Invalid input data',
              },
              details: {
                type: 'object',
                description: 'Additional error details',
              },
            },
            required: ['code', 'message'],
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z',
          },
        },
        required: ['success', 'error', 'timestamp'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            example: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 10,
          },
          total: {
            type: 'integer',
            minimum: 0,
            example: 100,
          },
          totalPages: {
            type: 'integer',
            minimum: 0,
            example: 10,
          },
        },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          role: {
            type: 'string',
            enum: ['buyer', 'owner', 'agent', 'builder', 'admin'],
            example: 'buyer',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          phone: {
            type: 'string',
            example: '+1234567890',
          },
          profileImage: {
            type: 'string',
            example: '/uploads/profiles/user123.jpg',
          },
          isVerified: {
            type: 'boolean',
            example: true,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['id', 'email', 'role', 'firstName', 'lastName'],
      },
      // Property schemas
      Property: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          userId: {
            type: 'integer',
            example: 1,
          },
          title: {
            type: 'string',
            example: 'Beautiful 3BHK Apartment',
          },
          description: {
            type: 'string',
            example: 'Spacious apartment with modern amenities',
          },
          propertyType: {
            type: 'string',
            enum: ['apartment', 'house', 'commercial', 'land'],
            example: 'apartment',
          },
          listingType: {
            type: 'string',
            enum: ['sale', 'rent'],
            example: 'sale',
          },
          status: {
            type: 'string',
            enum: ['new', 'resale', 'under_construction'],
            example: 'new',
          },
          price: {
            type: 'number',
            format: 'decimal',
            example: 5000000,
          },
          areaSqft: {
            type: 'integer',
            example: 1200,
          },
          bedrooms: {
            type: 'integer',
            example: 3,
          },
          bathrooms: {
            type: 'integer',
            example: 2,
          },
          address: {
            type: 'string',
            example: '123 Main Street',
          },
          city: {
            type: 'string',
            example: 'Mumbai',
          },
          state: {
            type: 'string',
            example: 'Maharashtra',
          },
          postalCode: {
            type: 'string',
            example: '400001',
          },
          latitude: {
            type: 'number',
            format: 'decimal',
            example: 19.0760,
          },
          longitude: {
            type: 'number',
            format: 'decimal',
            example: 72.8777,
          },
          amenities: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['parking', 'gym', 'swimming_pool'],
          },
          isFeatured: {
            type: 'boolean',
            example: false,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          viewsCount: {
            type: 'integer',
            example: 150,
          },
          images: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PropertyImage',
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['id', 'userId', 'title', 'propertyType', 'listingType', 'status', 'price', 'address', 'city', 'state'],
      },
      PropertyImage: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          propertyId: {
            type: 'integer',
            example: 1,
          },
          imageUrl: {
            type: 'string',
            example: '/uploads/properties/property1_image1.jpg',
          },
          altText: {
            type: 'string',
            example: 'Living room view',
          },
          displayOrder: {
            type: 'integer',
            example: 1,
          },
        },
        required: ['id', 'propertyId', 'imageUrl'],
      },
      // Inquiry schemas
      Inquiry: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          propertyId: {
            type: 'integer',
            example: 1,
          },
          inquirerId: {
            type: 'integer',
            example: 2,
          },
          name: {
            type: 'string',
            example: 'Jane Smith',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane@example.com',
          },
          phone: {
            type: 'string',
            example: '+1234567890',
          },
          message: {
            type: 'string',
            example: 'I am interested in this property',
          },
          status: {
            type: 'string',
            enum: ['new', 'contacted', 'closed'],
            example: 'new',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['id', 'propertyId', 'name', 'email', 'message'],
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;