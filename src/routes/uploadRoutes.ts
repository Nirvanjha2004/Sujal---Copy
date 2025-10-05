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

const router = Router();

// Property image upload routes
router.post(
  '/properties/:propertyId/images',
  authenticate,
  uploadPropertyImages,
  handleUploadError,
  UploadController.uploadPropertyImage
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
  '/bulk/template',
  (req: Request, res: Response) => {
    const templatePath = path.join(__dirname, '../templates/property-bulk-upload-template.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="property-bulk-upload-template.csv"');
    res.sendFile(templatePath);
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