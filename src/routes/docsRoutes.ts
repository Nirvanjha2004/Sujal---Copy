import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { ApiResponseUtil } from '../utils/apiResponse';

const router = Router();

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API Documentation
 *     description: Swagger UI for API documentation
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: API documentation page
 */

// Swagger UI setup options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add any request interceptors here
      return req;
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2563eb }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 4px; }
  `,
  customSiteTitle: 'Real Estate Portal API Documentation',
  customfavIcon: '/favicon.ico',
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerOptions));

/**
 * @swagger
 * /docs/json:
 *   get:
 *     summary: Get OpenAPI JSON specification
 *     description: Returns the OpenAPI specification in JSON format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /docs/yaml:
 *   get:
 *     summary: Get OpenAPI YAML specification
 *     description: Returns the OpenAPI specification in YAML format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/yaml:
 *             schema:
 *               type: string
 */
router.get('/yaml', (req, res) => {
  try {
    const yaml = require('js-yaml');
    const yamlSpec = yaml.dump(swaggerSpec);
    res.setHeader('Content-Type', 'application/yaml');
    res.send(yamlSpec);
  } catch (error) {
    ApiResponseUtil.internalError(res, 'Failed to generate YAML specification');
  }
});

/**
 * @swagger
 * /docs/postman:
 *   get:
 *     summary: Get Postman collection
 *     description: Returns a Postman collection for API testing
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Postman collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/postman', (req, res) => {
  try {
    // Generate basic Postman collection structure
    const postmanCollection = {
      info: {
        name: 'Real Estate Portal API',
        description: 'API collection for Real Estate Portal',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string',
          },
        ],
      },
      variable: [
        {
          key: 'base_url',
          value: `http://localhost:${process.env.PORT || 3000}/api/v1`,
          type: 'string',
        },
        {
          key: 'jwt_token',
          value: '',
          type: 'string',
        },
      ],
      item: [
        {
          name: 'Authentication',
          item: [
            {
              name: 'Register',
              request: {
                method: 'POST',
                header: [
                  {
                    key: 'Content-Type',
                    value: 'application/json',
                  },
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    email: 'user@example.com',
                    password: 'Password123!',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'buyer',
                  }, null, 2),
                },
                url: {
                  raw: '{{base_url}}/auth/register',
                  host: ['{{base_url}}'],
                  path: ['auth', 'register'],
                },
              },
            },
            {
              name: 'Login',
              request: {
                method: 'POST',
                header: [
                  {
                    key: 'Content-Type',
                    value: 'application/json',
                  },
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    email: 'user@example.com',
                    password: 'Password123!',
                  }, null, 2),
                },
                url: {
                  raw: '{{base_url}}/auth/login',
                  host: ['{{base_url}}'],
                  path: ['auth', 'login'],
                },
              },
            },
          ],
        },
        {
          name: 'Properties',
          item: [
            {
              name: 'Get Properties',
              request: {
                method: 'GET',
                header: [],
                url: {
                  raw: '{{base_url}}/properties',
                  host: ['{{base_url}}'],
                  path: ['properties'],
                },
              },
            },
            {
              name: 'Create Property',
              request: {
                method: 'POST',
                header: [
                  {
                    key: 'Content-Type',
                    value: 'application/json',
                  },
                  {
                    key: 'Authorization',
                    value: 'Bearer {{jwt_token}}',
                  },
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    title: 'Beautiful 3BHK Apartment',
                    description: 'Spacious apartment with modern amenities',
                    propertyType: 'apartment',
                    listingType: 'sale',
                    status: 'new',
                    price: 5000000,
                    areaSqft: 1200,
                    bedrooms: 3,
                    bathrooms: 2,
                    address: '123 Main Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    amenities: ['parking', 'gym', 'swimming_pool'],
                  }, null, 2),
                },
                url: {
                  raw: '{{base_url}}/properties',
                  host: ['{{base_url}}'],
                  path: ['properties'],
                },
              },
            },
          ],
        },
      ],
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="real-estate-api.postman_collection.json"');
    res.json(postmanCollection);
  } catch (error) {
    ApiResponseUtil.internalError(res, 'Failed to generate Postman collection');
  }
});

/**
 * @swagger
 * /docs/health:
 *   get:
 *     summary: Documentation service health check
 *     description: Check if documentation service is running
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Documentation service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/health', (req, res) => {
  ApiResponseUtil.success(res, {
    service: 'documentation',
    status: 'healthy',
    version: '1.0.0',
    endpoints: {
      swagger: '/docs',
      json: '/docs/json',
      yaml: '/docs/yaml',
      postman: '/docs/postman',
    },
  }, 'Documentation service is running');
});

export default router;