import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { BulkUploadService } from '../services/bulkUploadService';
import { ImageService } from '../services/imageService';
import fs from 'fs';

export class UploadController {
  // Upload single property image
  static async uploadPropertyImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No image file provided'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await ImageService.processAndSavePropertyImage(
        parseInt(propertyId),
        req.file,
        {
          generateThumbnail: true,
          optimize: true,
          maxWidth: 1200,
          maxHeight: 800,
          quality: 85
        }
      );

      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            imageId: result.imageId,
            filename: result.filename,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: result.error
          },
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error uploading property image:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload image'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Upload multiple property images
  static async uploadPropertyImages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILES',
            message: 'No image files provided'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      console.log("The files are", files);

      const result = await ImageService.processBulkPropertyImages(
        parseInt(propertyId),
        files,
        {
          generateThumbnail: true,
          optimize: true,
          maxWidth: 1200,
          maxHeight: 800,
          quality: 85
        }
      );
      console.log("The image result is", result);

      res.status(201).json({
        success: true,
        data: {
          successful: result.successful,
          failed: result.failed,
          totalProcessed: result.totalProcessed,
          successCount: result.successful.length,
          failureCount: result.failed.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error uploading property images:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload images'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Delete property image
  static async deletePropertyImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await ImageService.deletePropertyImage(parseInt(imageId), userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Image deleted successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: result.error
          },
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error deleting property image:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete image'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update image display order
  static async updateImageOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const { displayOrder } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (typeof displayOrder !== 'number' || displayOrder < 1) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER',
            message: 'Display order must be a positive number'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await ImageService.updateImageOrder(parseInt(imageId), displayOrder, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Image order updated successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: result.error
          },
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error updating image order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update image order'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get property images
  static async getPropertyImages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const images = await ImageService.getPropertyImages(parseInt(propertyId));

      res.status(200).json({
        success: true,
        data: {
          images,
          count: images.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting property images:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get property images'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Start bulk CSV upload
  static async startBulkUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No CSV file provided'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate CSV format first
      const formatValidation = await BulkUploadService.validateCSVFormat(req.file.path);
      
      if (!formatValidation.valid) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CSV_FORMAT',
            message: formatValidation.message,
            details: {
              requiredColumns: formatValidation.requiredColumns,
              foundColumns: formatValidation.foundColumns,
              missingColumns: formatValidation.missingColumns
            }
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Start bulk upload process
      const { uploadId, progress } = await BulkUploadService.startBulkUpload(
        userId,
        req.file.path,
        req.file.originalname
      );

      res.status(202).json({
        success: true,
        data: {
          uploadId,
          status: progress.status,
          message: 'Bulk upload started successfully'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error starting bulk upload:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start bulk upload'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get bulk upload progress
  static async getBulkUploadProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { uploadId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const progress = BulkUploadService.getUploadProgress(uploadId);

      if (!progress) {
        res.status(404).json({
          success: false,
          error: {
            code: 'UPLOAD_NOT_FOUND',
            message: 'Bulk upload not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify user owns this upload
      if (progress.userId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this upload'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          uploadId: progress.id,
          filename: progress.filename,
          status: progress.status,
          totalRows: progress.totalRows,
          processedRows: progress.processedRows,
          successfulRows: progress.successfulRows,
          failedRows: progress.failedRows,
          errorCount: progress.errors.length,
          startedAt: progress.startedAt,
          completedAt: progress.completedAt,
          hasErrorReport: !!progress.errorReportPath
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting bulk upload progress:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get upload progress'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get user's bulk upload history
  static async getBulkUploadHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const history = BulkUploadService.getUserUploadHistory(userId);

      res.status(200).json({
        success: true,
        data: {
          uploads: history.map(upload => ({
            uploadId: upload.id,
            filename: upload.filename,
            status: upload.status,
            totalRows: upload.totalRows,
            successfulRows: upload.successfulRows,
            failedRows: upload.failedRows,
            startedAt: upload.startedAt,
            completedAt: upload.completedAt,
            hasErrorReport: !!upload.errorReportPath
          })),
          count: history.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting bulk upload history:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get upload history'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Download error report
  static async downloadErrorReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { uploadId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const progress = BulkUploadService.getUploadProgress(uploadId);

      if (!progress) {
        res.status(404).json({
          success: false,
          error: {
            code: 'UPLOAD_NOT_FOUND',
            message: 'Bulk upload not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify user owns this upload
      if (progress.userId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this upload'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const errorReportPath = BulkUploadService.getErrorReportPath(uploadId);

      if (!errorReportPath || !fs.existsSync(errorReportPath)) {
        res.status(404).json({
          success: false,
          error: {
            code: 'REPORT_NOT_FOUND',
            message: 'Error report not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="error-report-${uploadId}.csv"`);

      // Stream the file
      const fileStream = fs.createReadStream(errorReportPath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading error report:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to download error report'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get storage statistics (admin only)
  static async getStorageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Admin access required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const stats = await ImageService.getStorageStats();

      res.status(200).json({
        success: true,
        data: {
          totalImages: stats.totalImages,
          totalSize: stats.totalSize,
          totalSizeMB: Math.round(stats.totalSize / (1024 * 1024) * 100) / 100,
          averageSize: stats.averageSize,
          averageSizeMB: Math.round(stats.averageSize / (1024 * 1024) * 100) / 100,
          oldestImage: stats.oldestImage,
          newestImage: stats.newestImage
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting storage stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get storage statistics'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Cleanup orphaned images (admin only)
  static async cleanupOrphanedImages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Admin access required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await ImageService.cleanupOrphanedImages();

      res.status(200).json({
        success: true,
        data: {
          totalCleaned: result.totalCleaned,
          cleanedFiles: result.cleaned,
          errors: result.errors
        },
        message: `Successfully cleaned up ${result.totalCleaned} orphaned images`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cleanup orphaned images'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}