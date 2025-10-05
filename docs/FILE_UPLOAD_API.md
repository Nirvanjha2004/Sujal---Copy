# File Upload and Media Management API

This document describes the file upload and media management functionality for the Real Estate Portal.

## Features

### Image Upload and Processing
- Single and bulk property image uploads
- Automatic image optimization and compression
- Thumbnail generation
- Image dimension validation
- Secure file storage with access controls
- Image deletion and cleanup

### CSV Bulk Upload System
- Bulk property creation via CSV files
- Data validation and error reporting
- Progress tracking for bulk operations
- Error report generation and download
- CSV template download

## API Endpoints

### Property Image Management

#### Upload Single Property Image
```
POST /api/uploads/properties/:propertyId/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- images: File (image file)
```

#### Upload Multiple Property Images
```
POST /api/uploads/properties/:propertyId/images/bulk
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- images: File[] (up to 50 image files)
```

#### Get Property Images
```
GET /api/uploads/properties/:propertyId/images

Response:
{
  "success": true,
  "data": {
    "images": [
      {
        "id": 1,
        "url": "http://localhost:3000/uploads/properties/property-123456.jpg",
        "thumbnailUrl": "http://localhost:3000/uploads/properties/property-123456_thumb.jpg",
        "altText": "Property image",
        "displayOrder": 1
      }
    ],
    "count": 1
  }
}
```

#### Delete Property Image
```
DELETE /api/uploads/images/:imageId
Authorization: Bearer <token>
```

#### Update Image Display Order
```
PUT /api/uploads/images/:imageId/order
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "displayOrder": 2
}
```

### CSV Bulk Upload

#### Download CSV Template
```
GET /api/uploads/bulk/template

Response: CSV file download
```

#### Start Bulk Upload
```
POST /api/uploads/bulk/properties
Authorization: Bearer <token> (Agent, Builder, or Admin role required)
Content-Type: multipart/form-data

Body:
- csvFile: File (CSV file)

Response:
{
  "success": true,
  "data": {
    "uploadId": "bulk_1234567890_abc123",
    "status": "pending",
    "message": "Bulk upload started successfully"
  }
}
```

#### Get Upload Progress
```
GET /api/uploads/bulk/progress/:uploadId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "uploadId": "bulk_1234567890_abc123",
    "filename": "properties.csv",
    "status": "completed",
    "totalRows": 100,
    "processedRows": 100,
    "successfulRows": 95,
    "failedRows": 5,
    "errorCount": 5,
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T10:05:00Z",
    "hasErrorReport": true
  }
}
```

#### Get Upload History
```
GET /api/uploads/bulk/history
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "uploads": [
      {
        "uploadId": "bulk_1234567890_abc123",
        "filename": "properties.csv",
        "status": "completed",
        "totalRows": 100,
        "successfulRows": 95,
        "failedRows": 5,
        "startedAt": "2024-01-15T10:00:00Z",
        "completedAt": "2024-01-15T10:05:00Z",
        "hasErrorReport": true
      }
    ],
    "count": 1
  }
}
```

#### Download Error Report
```
GET /api/uploads/bulk/error-report/:uploadId
Authorization: Bearer <token>

Response: CSV file download with error details
```

### Admin Endpoints

#### Get Storage Statistics
```
GET /api/uploads/admin/storage/stats
Authorization: Bearer <token> (Admin role required)

Response:
{
  "success": true,
  "data": {
    "totalImages": 1500,
    "totalSize": 524288000,
    "totalSizeMB": 500.0,
    "averageSize": 349525,
    "averageSizeMB": 0.33,
    "oldestImage": "2024-01-01T00:00:00Z",
    "newestImage": "2024-01-15T12:00:00Z"
  }
}
```

#### Cleanup Orphaned Images
```
POST /api/uploads/admin/storage/cleanup
Authorization: Bearer <token> (Admin role required)

Response:
{
  "success": true,
  "data": {
    "totalCleaned": 25,
    "cleanedFiles": ["orphaned-image-1.jpg", "orphaned-image-2.jpg"],
    "errors": []
  },
  "message": "Successfully cleaned up 25 orphaned images"
}
```

## CSV Format

### Required Columns
- `title`: Property title (required)
- `property_type`: apartment, house, commercial, land (required)
- `listing_type`: sale, rent (required)
- `status`: new, resale, under_construction (required)
- `price`: Numeric price value (required)
- `address`: Full address (required)
- `city`: City name (required)
- `state`: State name (required)

### Optional Columns
- `description`: Property description
- `area_sqft`: Area in square feet (numeric)
- `bedrooms`: Number of bedrooms (numeric)
- `bathrooms`: Number of bathrooms (numeric)
- `postal_code`: Postal/ZIP code
- `amenities`: JSON array or comma-separated list

### Sample CSV Row
```csv
title,description,property_type,listing_type,status,price,area_sqft,bedrooms,bathrooms,address,city,state,postal_code,amenities
"Modern 2BHK Apartment","Spacious apartment with modern amenities",apartment,sale,new,5500000,1200,2,2,"123 Main Street",Mumbai,Maharashtra,400001,"parking,gym,swimming_pool"
```

## Image Processing

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Image Validation
- **File Size**: Maximum 5MB per image
- **Dimensions**: 
  - Minimum: 400x300 pixels
  - Maximum: 4000x3000 pixels
- **File Type**: Only image files allowed

### Automatic Processing
- **Optimization**: Images are automatically compressed and optimized
- **Resizing**: Large images are resized to maximum 1200x800 pixels
- **Thumbnails**: 300x300 pixel thumbnails are generated
- **Format**: Images are converted to JPEG for optimal storage

## Security Features

### Access Control
- Authentication required for all upload operations
- Role-based access for bulk uploads (Agent, Builder, Admin only)
- Users can only manage their own property images
- Admin-only access for storage management

### File Validation
- File type validation
- File size limits
- Image dimension validation
- Malicious file detection

### Secure Storage
- Files stored outside web root
- Unique filename generation
- Access control for file serving
- Automatic cleanup of temporary files

## Error Handling

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `ACCESS_DENIED`: Insufficient permissions
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file format
- `INVALID_DIMENSIONS`: Image dimensions out of range
- `UPLOAD_FAILED`: General upload failure
- `INVALID_CSV_FORMAT`: CSV format validation failed

### Bulk Upload Errors
- Row-level validation errors are tracked
- Error reports generated for failed uploads
- Detailed error messages with row numbers
- Downloadable error reports in CSV format

## Usage Examples

### JavaScript/TypeScript Client

```typescript
// Upload single image
const uploadImage = async (propertyId: number, imageFile: File) => {
  const formData = new FormData();
  formData.append('images', imageFile);

  const response = await fetch(`/api/uploads/properties/${propertyId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};

// Start bulk upload
const startBulkUpload = async (csvFile: File) => {
  const formData = new FormData();
  formData.append('csvFile', csvFile);

  const response = await fetch('/api/uploads/bulk/properties', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};

// Check upload progress
const checkProgress = async (uploadId: string) => {
  const response = await fetch(`/api/uploads/bulk/progress/${uploadId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};
```

### cURL Examples

```bash
# Upload property image
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@property-image.jpg" \
  http://localhost:3000/api/uploads/properties/123/images

# Download CSV template
curl -O http://localhost:3000/api/uploads/bulk/template

# Start bulk upload
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "csvFile=@properties.csv" \
  http://localhost:3000/api/uploads/bulk/properties

# Check upload progress
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/uploads/bulk/progress/bulk_1234567890_abc123
```

## Performance Considerations

### Image Processing
- Images are processed asynchronously
- Thumbnails generated in background
- Optimized storage with compression
- CDN-ready file structure

### Bulk Uploads
- Asynchronous processing for large files
- Progress tracking for user feedback
- Memory-efficient CSV streaming
- Batch database operations

### Caching
- Static file serving with proper headers
- Image metadata caching
- Upload progress caching in Redis

## Monitoring and Maintenance

### Storage Management
- Regular cleanup of orphaned files
- Storage usage monitoring
- Automated backup recommendations
- Performance metrics tracking

### Error Monitoring
- Upload failure tracking
- Error rate monitoring
- Performance bottleneck identification
- User experience metrics