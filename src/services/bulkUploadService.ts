import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { Property } from '../models';
import PropertyService from './propertyService';
import { PropertyType, PropertyStatus } from '../models/Property';

// Define the expected CSV headers
const REQUIRED_HEADERS = [
  'title', 'description', 'property_type', 'listing_type', 'status',
  'price', 'address', 'city', 'state'
];

// In-memory store for upload progress
const uploadProgress: { [key: string]: BulkUploadProgress } = {};

interface BulkUploadProgress {
  id: string;
  userId: number;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errors: { row: number; message: string; data: any }[];
  startedAt: Date;
  completedAt?: Date;
  errorReportPath?: string;
}

export class BulkUploadService {

  static async validateCSVFormat(filePath: string): Promise<{
    valid: boolean;
    message: string;
    requiredColumns?: string[];
    foundColumns?: string[];
    missingColumns?: string[];
  }> {
    return new Promise((resolve) => {
      const fileStream = fs.createReadStream(filePath);

      Papa.parse(fileStream, {
        header: true,
        preview: 1, // only parse first row
        complete: (results) => {
          const foundHeaders = results.meta.fields || [];
          const missingHeaders = REQUIRED_HEADERS.filter(
            (h) => !foundHeaders.includes(h)
          );

          if (missingHeaders.length > 0) {
            resolve({
              valid: false,
              message: "CSV file is missing required columns.",
              requiredColumns: REQUIRED_HEADERS,
              foundColumns: foundHeaders,
              missingColumns: missingHeaders,
            });
          } else {
            resolve({ valid: true, message: "CSV format is valid." });
          }
        },
        error: (error) => {
          resolve({ valid: false, message: `Failed to parse CSV: ${error.message}` });
        }
      });
    });
  }

  static async startBulkUpload(userId: number, filePath: string, originalFilename: string): Promise<{ uploadId: string; progress: BulkUploadProgress }> {
    const uploadId = uuidv4();
    const progress: BulkUploadProgress = {
      id: uploadId,
      userId,
      filename: originalFilename,
      status: 'pending',
      totalRows: 0,
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0,
      errors: [],
      startedAt: new Date(),
    };

    uploadProgress[uploadId] = progress;

    // Process the file asynchronously
    this.processFile(uploadId, filePath, userId);

    return { uploadId, progress };
  }

  private static async processFile(uploadId: string, filePath: string, userId: number): Promise<void> {
    const progress = uploadProgress[uploadId];
    if (!progress) return;

    progress.status = 'processing';

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    progress.totalRows = parseResult.data.length;

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i] as any;
      progress.processedRows++;

      try {
        // Map the status from the CSV to a valid PropertyStatus enum value
        // Use the exact enum values, not enum properties
        let propertyStatus: PropertyStatus;
        
        switch ((row.status || '').toLowerCase()) {
          case 'available':
          case 'active':
            propertyStatus = PropertyStatus.ACTIVE;
            break;
          case 'sold':
            propertyStatus = PropertyStatus.SOLD;
            break;
          case 'rented':
            propertyStatus = PropertyStatus.RENTED;
            break;
          case 'pending':
            propertyStatus = PropertyStatus.PENDING;
            break;
          default:
            propertyStatus = PropertyStatus.ACTIVE; // Default value
        }

        // Check PropertyCreateData interface to make sure all properties match
        const propertyData = {
          title: row.title,
          description: row.description,
          propertyType: row.property_type as PropertyType,
          listingType: row.listing_type,
          status: propertyStatus as PropertyStatus, // Explicitly cast to PropertyStatus
          price: parseFloat(row.price),
          areaSqft: row.area_sqft ? parseInt(row.area_sqft, 10) : undefined,
          bedrooms: row.bedrooms ? parseInt(row.bedrooms, 10) : undefined,
          bathrooms: row.bathrooms ? parseInt(row.bathrooms, 10) : undefined,
          address: row.address,
          city: row.city,
          state: row.state,
          postalCode: row.postal_code,
        };

        // More robust validation
        if (!propertyData.title || isNaN(propertyData.price) || !propertyData.city) {
          throw new Error('Missing required fields: title, price, or city.');
        }
        if (!Object.values(PropertyType).includes(propertyData.propertyType)) {
          throw new Error(`Invalid property_type: ${propertyData.propertyType}`);
        }

        const propertyService = new PropertyService();
        await propertyService.createProperty(userId, propertyData);
        progress.successfulRows++;
      } catch (error: any) {
        console.error(`Error processing row ${i+2}:`, error);
        progress.failedRows++;
        progress.errors.push({
          row: i + 2, // CSV rows are 1-based, +1 for header
          message: error.message || 'An unknown error occurred.',
          data: row,
        });
      }
    }

    progress.status = 'completed';
    progress.completedAt = new Date();

    if (progress.errors.length > 0) {
      this.generateErrorReport(uploadId);
    }

    // Clean up the uploaded file
    fs.unlinkSync(filePath);
  }

  private static generateErrorReport(uploadId: string): void {
    const progress = uploadProgress[uploadId];
    if (!progress || progress.errors.length === 0) return;

    const errorReportData = progress.errors.map(err => ({
      row: err.row,
      error: err.message,
      ...err.data,
    }));

    const csv = Papa.unparse(errorReportData);
    const reportDir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `error-report-${uploadId}.csv`);
    fs.writeFileSync(reportPath, csv);
    progress.errorReportPath = reportPath;
  }

  static getUploadProgress(uploadId: string): BulkUploadProgress | undefined {
    return uploadProgress[uploadId];
  }

  static getUserUploadHistory(userId: number): BulkUploadProgress[] {
    return Object.values(uploadProgress).filter(p => p.userId === userId);
  }

  static getErrorReportPath(uploadId: string): string | undefined {
    const progress = uploadProgress[uploadId];
    return progress?.errorReportPath;
  }
}