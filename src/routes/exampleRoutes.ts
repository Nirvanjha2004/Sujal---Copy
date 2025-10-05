import { Router, Request, Response } from 'express';
import { validate, propertySchemas, commonSchemas } from '../middleware/validation';
import { ApiResponseUtil } from '../utils/apiResponse';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExampleProperty:
 *       type: object
 *       required:
 *         - title
 *         - propertyType
 *         - listingType
 *         - status
 *         - price
 *         - address
 *         - city
 *         - state
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 255
 *           example: Beautiful 3BHK Apartment
 *         description:
 *           type: string
 *           maxLength: 2000
 *           example: Spacious apartment with modern amenities
 *         propertyType:
 *           type: string
 *           enum: [apartment, house, commercial, land]
 *           example: apartment
 *         listingType:
 *           type: string
 *           enum: [sale, rent]
 *           example: sale
 *         status:
 *           type: string
 *           enum: [new, resale, under_construction]
 *           example: new
 *         price:
 *           type: number
 *           minimum: 1
 *           example: 5000000
 *         areaSqft:
 *           type: integer
 *           minimum: 1
 *           example: 1200
 *         bedrooms:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           example: 3
 *         bathrooms:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           example: 2
 *         address:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           example: 123 Main Street, Sector 1
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Mumbai
 *         state:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Maharashtra
 *         postalCode:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           example: "400001"
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           example: 19.0760
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           example: 72.8777
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 20
 *           example: [parking, gym, swimming_pool]
 */

/**
 * @swagger
 * /example/properties:
 *   post:
 *     summary: Create a new property (Example with validation)
 *     description: Example endpoint demonstrating comprehensive validation and response standardization
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExampleProperty'
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Property'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/properties',
  authenticate,
  validate(propertySchemas.create, 'body'),
  async (req: Request, res: Response) => {
    try {
      // Simulate property creation
      const propertyData = {
        id: Math.floor(Math.random() * 1000),
        userId: (req as any).user.id,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        isFeatured: false,
        viewsCount: 0,
      };

      return ApiResponseUtil.created(
        res,
        propertyData,
        'Property created successfully'
      );
    } catch (error) {
      console.error('Property creation error:', error);
      return ApiResponseUtil.internalError(
        res,
        'Failed to create property'
      );
    }
  }
);

/**
 * @swagger
 * /example/properties:
 *   get:
 *     summary: Get properties with pagination (Example)
 *     description: Example endpoint demonstrating pagination and search functionality
 *     tags: [Examples]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [apartment, house, commercial, land]
 *         description: Filter by property type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/properties',
  validate(commonSchemas.pagination, 'query'),
  validate(commonSchemas.search, 'query'),
  async (req: Request, res: Response) => {
    try {
      const { page, limit } = req.query as any;
      
      // Simulate property data
      const mockProperties = Array.from({ length: limit }, (_, index) => ({
        id: (page - 1) * limit + index + 1,
        title: `Property ${(page - 1) * limit + index + 1}`,
        propertyType: 'apartment',
        listingType: 'sale',
        status: 'new',
        price: 5000000 + (index * 100000),
        city: 'Mumbai',
        state: 'Maharashtra',
        createdAt: new Date().toISOString(),
      }));

      const total = 100; // Mock total count

      return ApiResponseUtil.paginated(
        res,
        mockProperties,
        page,
        limit,
        total,
        'Properties retrieved successfully'
      );
    } catch (error) {
      console.error('Properties retrieval error:', error);
      return ApiResponseUtil.internalError(
        res,
        'Failed to retrieve properties'
      );
    }
  }
);

/**
 * @swagger
 * /example/properties/{id}:
 *   get:
 *     summary: Get property by ID (Example)
 *     description: Example endpoint demonstrating parameter validation and error handling
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Invalid property ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/properties/:id',
  validate(commonSchemas.id, 'params'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Simulate property lookup
      if (parseInt(id) > 100) {
        return ApiResponseUtil.notFound(
          res,
          'Property not found'
        );
      }

      const mockProperty = {
        id: parseInt(id),
        title: `Property ${id}`,
        description: 'Beautiful property with modern amenities',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return ApiResponseUtil.success(
        res,
        mockProperty,
        'Property retrieved successfully'
      );
    } catch (error) {
      console.error('Property retrieval error:', error);
      return ApiResponseUtil.internalError(
        res,
        'Failed to retrieve property'
      );
    }
  }
);

/**
 * @swagger
 * /example/validation-error:
 *   post:
 *     summary: Example validation error endpoint
 *     description: Endpoint that demonstrates validation error responses
 *     tags: [Examples]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 100
 *     responses:
 *       400:
 *         description: Validation error example
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/validation-error',
  validate(require('joi').object({
    email: require('joi').string().email().required(),
    age: require('joi').number().integer().min(18).max(100).required(),
  }), 'body'),
  (req: Request, res: Response) => {
    return ApiResponseUtil.success(
      res,
      req.body,
      'Validation passed successfully'
    );
  }
);

export default router;