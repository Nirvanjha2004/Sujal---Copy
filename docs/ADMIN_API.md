# Admin Dashboard API Documentation

This document describes the Admin Dashboard API endpoints for the Real Estate Portal.

## Authentication

All admin endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- User role must be `admin`

## Base URL

All admin endpoints are prefixed with `/api/admin`

## Dashboard Analytics

### GET /dashboard/analytics
Get comprehensive dashboard analytics including user counts, property statistics, and recent activity.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalProperties": 1200,
    "totalInquiries": 450,
    "activeListings": 980,
    "featuredListings": 45,
    "usersByRole": {
      "buyer": 80,
      "owner": 40,
      "agent": 25,
      "builder": 5
    },
    "propertiesByType": {
      "apartment": 600,
      "house": 400,
      "commercial": 150,
      "land": 50
    },
    "recentActivity": {
      "newUsers": 12,
      "newProperties": 35,
      "newInquiries": 28
    },
    "monthlyStats": [...]
  }
}
```

### GET /dashboard/stats
Get system statistics including database counts and user activity.

## User Management

### GET /users
Get users for moderation with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `role` (string): Filter by user role
- `isVerified` (boolean): Filter by verification status
- `isActive` (boolean): Filter by active status
- `search` (string): Search in name and email

### PUT /users/:userId/status
Update user status (active, verified, role).

**Request Body:**
```json
{
  "isActive": true,
  "isVerified": true,
  "role": "agent"
}
```

### DELETE /users/:userId
Deactivate a user (soft delete).

## Property Management

### GET /properties
Get properties for moderation with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `propertyType` (string): Filter by property type
- `isActive` (boolean): Filter by active status
- `isFeatured` (boolean): Filter by featured status
- `search` (string): Search in title, city, address

### PUT /properties/:propertyId/status
Update property status (active, featured).

**Request Body:**
```json
{
  "isActive": true,
  "isFeatured": false
}
```

### DELETE /properties/:propertyId
Delete a property (hard delete).

## SEO Management

### GET /seo/settings
Get SEO settings for entities.

**Query Parameters:**
- `entityType` (required): 'property', 'page', or 'global'
- `entityId` (number): Specific entity ID
- `pageType` (string): Page type for page entities

### POST /seo/settings
Create or update SEO settings.

**Request Body:**
```json
{
  "entityType": "property",
  "entityId": 123,
  "title": "Beautiful 3BHK Apartment in Mumbai",
  "description": "Spacious apartment with modern amenities...",
  "keywords": "apartment, mumbai, 3bhk, rent",
  "ogTitle": "3BHK Apartment for Rent in Mumbai",
  "ogDescription": "Find your perfect home...",
  "ogImage": "/uploads/property-123-main.jpg",
  "canonicalUrl": "/property/123",
  "metaRobots": "index,follow",
  "schemaMarkup": {...},
  "isActive": true
}
```

### GET /seo/property/:propertyId/metadata
Get generated SEO metadata for a property.

### GET /seo/page/:pageType/metadata
Get generated SEO metadata for a page type.

## Content Management System (CMS)

### GET /cms/content
Get all CMS content with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): 'banner', 'announcement', 'page', 'widget'
- `targetAudience` (string): 'all', 'buyers', 'sellers', 'agents', 'builders'
- `isActive` (boolean): Filter by active status
- `search` (string): Search in title, content, key

### POST /cms/content
Create new CMS content.

**Request Body:**
```json
{
  "type": "banner",
  "key": "home-hero-banner",
  "title": "Welcome to Real Estate Portal",
  "content": "<div>Find your dream property today!</div>",
  "metadata": {
    "imageUrl": "/uploads/banner-hero.jpg",
    "linkUrl": "/search"
  },
  "targetAudience": "all",
  "isActive": true,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "priority": 10
}
```

### PUT /cms/content/:id
Update existing CMS content.

### DELETE /cms/content/:id
Delete CMS content.

### PATCH /cms/content/:id/toggle
Toggle content active status.

### GET /cms/content/stats
Get content statistics.

## Public SEO Endpoints

These endpoints are available without authentication:

### GET /api/seo/sitemap.xml
Generate XML sitemap for the website.

### GET /api/seo/property/:propertyId/metadata
Get SEO metadata for a property (for frontend rendering).

### GET /api/seo/page/:pageType/metadata
Get SEO metadata for a page (for frontend rendering).

## Public CMS Endpoints

### GET /api/seo/content/active
Get active content for public display.

### GET /api/seo/banners
Get active banners.

### GET /api/seo/announcements
Get active announcements.

### GET /api/seo/content/key/:key
Get content by key.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Common error codes:
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_SERVER_ERROR` (500): Server error

## Database Tables

The admin functionality uses these additional database tables:

### seo_settings
Stores SEO metadata for properties, pages, and global settings.

### cms_content
Stores CMS content including banners, announcements, pages, and widgets.

Both tables are created automatically when running database migrations.