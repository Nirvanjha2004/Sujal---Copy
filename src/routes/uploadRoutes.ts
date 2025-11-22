import { Router, Request, Response } from 'express';
import path from 'path';
import { UploadController } from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  uploadPropertyImages, 
  uploadBulkPropertyImages, 
  uploadCSV, 
  handleUploadError 
} from '../middleware/upload';
import fs from 'fs';

const router = Router();

// Property image upload routes
router.post(
  '/properties/:propertyId/images',
  authenticate,
  uploadPropertyImages,
  handleUploadError,
  UploadController.uploadPropertyImages
);

router.post(
  '/properties/:propertyId/images/bulk',
  authenticate,
  uploadBulkPropertyImages,
  handleUploadError,
  UploadController.uploadPropertyImages
);

router.get(
  '/properties/:propertyId/images',
  UploadController.getPropertyImages
);

router.delete(
  '/images/:imageId',
  authenticate,
  UploadController.deletePropertyImage
);

router.put(
  '/images/:imageId/order',
  authenticate,
  UploadController.updateImageOrder
);

// Bulk CSV upload routes
router.post(
  '/bulk/properties',
  authenticate,
  authorize(UserRole.AGENT, UserRole.BUILDER, UserRole.ADMIN),
  uploadCSV,
  handleUploadError,
  UploadController.startBulkUpload
);

router.get(
  '/bulk/progress/:uploadId',
  authenticate,
  UploadController.getBulkUploadProgress
);

router.get(
  '/bulk/history',
  authenticate,
  UploadController.getBulkUploadHistory
);

router.get(
  '/bulk/error-report/:uploadId',
  authenticate,
  UploadController.downloadErrorReport
);

// CSV template download
router.get(
  '/bulk/properties/template',
  (req, res) => {
    const templateContent = 
`title,description,property_type,listing_type,price,address,city,state,postal_code,bedrooms,bathrooms,area_sqft,status,amenities,latitude,longitude
Beautiful Family Home,Spacious 3BHK home in prime location,house,sale,5000000,123 Main St,Mumbai,Maharashtra,400001,3,2,1500,active,"parking,garden,security",19.0760,72.8777
Modern Apartment,Fully furnished 2BHK apartment,apartment,rent,25000,456 Park Ave,Pune,Maharashtra,411001,2,2,1200,active,"gym,pool,parking",18.5204,73.8567`;

    res.header('Content-Type', 'text/csv');
    res.attachment('property-template.csv');
    res.send(templateContent);
  }
);

// Admin routes
router.get(
  '/admin/storage/stats',
  authenticate,
  authorize(UserRole.ADMIN),
  UploadController.getStorageStats
);

router.post(
  '/admin/storage/cleanup',
  authenticate,
  authorize(UserRole.ADMIN),
  UploadController.cleanupOrphanedImages
);

export default router;