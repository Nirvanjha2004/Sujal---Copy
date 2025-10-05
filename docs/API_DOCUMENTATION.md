# Real Estate Portal API Documentation

## Overview

The Real Estate Portal API is a comprehensive RESTful API built with Node.js, Express.js, and TypeScript. It provides endpoints for property management, user authentication, communication, and administrative functions.

## Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.realestate-portal.com/api/v1`

## Interactive Documentation

- **Swagger UI**: `/api/docs`
- **OpenAPI JSON**: `/api/docs/json`
- **OpenAPI YAML**: `/api/docs/yaml`
- **Postman Collection**: `/api/docs/postman`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Lifecycle

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Token Refresh**: Use `/auth/refresh-token` endpoint

## API Versioning

The API supports versioning through URL paths:

- **Current Version**: `v1`
- **Version Header**: `API-Version: v1`
- **Supported Versions**: `v1`

### Version Strategy

- **URL Path**: `/api/v1/endpoint` (Primary)
- **Header**: `Accept-Version: v1` (Alternative)
- **Query Parameter**: `?version=v1` (Alternative)

## Request/Response Format

### Standard Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "message": "Data retrieved successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Validation

The API uses comprehensive input validation with detailed error messages:

### Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- **Phone**: International format with country code
- **Property Price**: Must be positive number
- **Coordinates**: Latitude (-90 to 90), Longitude (-180 to 180)

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General Endpoints**: 100 requests per 15 minutes
- **Authentication Endpoints**: 5 requests per 15 minutes
- **File Upload Endpoints**: 10 requests per 15 minutes

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Error Codes

### Authentication Errors (401)
- `UNAUTHORIZED`: Invalid or missing token
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_TOKEN`: Malformed or invalid token

### Validation Errors (400)
- `VALIDATION_ERROR`: Input validation failed
- `INVALID_INPUT`: Invalid data format
- `MISSING_REQUIRED_FIELD`: Required field missing

### Resource Errors (404)
- `NOT_FOUND`: Resource not found
- `USER_NOT_FOUND`: User does not exist
- `PROPERTY_NOT_FOUND`: Property does not exist

### Permission Errors (403)
- `FORBIDDEN`: Access denied
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions

### Server Errors (500)
- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: Third-party service error

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction (`asc` or `desc`, default: `desc`)

### Example Request

```
GET /api/v1/properties?page=2&limit=20&sortBy=price&sortOrder=asc
```

## Search and Filtering

### Property Search Parameters

- `q`: General search query
- `propertyType`: apartment, house, commercial, land
- `listingType`: sale, rent
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `city`: City name
- `state`: State name
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `minArea`: Minimum area in sqft
- `maxArea`: Maximum area in sqft
- `amenities`: Array of amenities
- `latitude`: Latitude for location-based search
- `longitude`: Longitude for location-based search
- `radius`: Search radius in km (requires lat/lng)

### Example Search Request

```
GET /api/v1/properties?propertyType=apartment&city=Mumbai&minPrice=1000000&maxPrice=5000000&bedrooms=3
```

## File Uploads

### Supported File Types

- **Images**: JPEG, PNG, WebP
- **Documents**: PDF (for bulk uploads)

### File Size Limits

- **Single Image**: 5MB
- **Multiple Images**: 50MB total
- **CSV Files**: 10MB

### Upload Response

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filename": "property_image_1.jpg",
        "url": "/uploads/properties/property_image_1.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg"
      }
    ]
  },
  "message": "Files uploaded successfully"
}
```

## Webhooks (Future Feature)

The API will support webhooks for real-time notifications:

- Property status changes
- New inquiries
- User registrations
- Payment confirmations

## SDK and Libraries

### JavaScript/Node.js

```javascript
const RealEstateAPI = require('@realestate/api-client');

const client = new RealEstateAPI({
  baseURL: 'https://api.realestate-portal.com/api/v1',
  apiKey: 'your-api-key'
});

// Get properties
const properties = await client.properties.list({
  city: 'Mumbai',
  propertyType: 'apartment'
});
```

### Python

```python
from realestate_api import RealEstateClient

client = RealEstateClient(
    base_url='https://api.realestate-portal.com/api/v1',
    api_key='your-api-key'
)

# Get properties
properties = client.properties.list(
    city='Mumbai',
    property_type='apartment'
)
```

## Testing

### Postman Collection

Download the Postman collection from `/api/docs/postman` to test all endpoints.

### Example Requests

#### Register User

```bash
curl -X POST https://api.realestate-portal.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer"
  }'
```

#### Create Property

```bash
curl -X POST https://api.realestate-portal.com/api/v1/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "title": "Beautiful 3BHK Apartment",
    "propertyType": "apartment",
    "listingType": "sale",
    "status": "new",
    "price": 5000000,
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

## Support

- **Documentation**: `/api/docs`
- **Health Check**: `/health`
- **API Status**: `/api/v1/health`

## Changelog

### Version 1.0.0 (Current)

- Initial API release
- User authentication and management
- Property CRUD operations
- Search and filtering
- File upload functionality
- Admin panel APIs
- Comprehensive documentation

### Upcoming Features

- **v1.1.0**: Enhanced search with ML recommendations
- **v1.2.0**: Real-time notifications via WebSocket
- **v2.0.0**: GraphQL endpoint support

## Security

- HTTPS enforcement in production
- JWT token-based authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration
- Security headers (Helmet.js)

## Performance

- Redis caching for frequently accessed data
- Database query optimization
- Image compression and optimization
- CDN integration for static assets
- Connection pooling
- Gzip compression

## Monitoring

- Request/response logging
- Error tracking
- Performance metrics
- Health checks
- Database monitoring
- Cache hit/miss ratios