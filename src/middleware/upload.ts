import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import config from '../config';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.upload.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Profile images subdirectory
const profileImagesDir = path.join(uploadDir, 'profiles');
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Storage configuration for profile images
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${extension}`);
  },
});

// File filter for images
const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

// Profile image upload middleware
export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB by default
    files: 1, // Only one file at a time
  },
  fileFilter: imageFileFilter,
}).single('profileImage');

// Property images storage configuration
const propertyImagesDir = path.join(uploadDir, 'properties');
if (!fs.existsSync(propertyImagesDir)) {
  fs.mkdirSync(propertyImagesDir, { recursive: true });
}

const propertyImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, propertyImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${extension}`);
  },
});

// Property images upload middleware (multiple files)
export const uploadPropertyImages = multer({
  storage: propertyImageStorage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10, // Maximum 10 images per property
  },
  fileFilter: imageFileFilter,
}).array('images', 10);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds the maximum limit of ${config.upload.maxFileSize / (1024 * 1024)}MB`,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded',
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
  
  next(error);
};

// Utility function to delete uploaded file
export const deleteUploadedFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Utility function to get file URL
export const getFileUrl = (filename: string, type: 'profile' | 'property'): string => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${config.server.port}`;
  return `${baseUrl}/uploads/${type === 'profile' ? 'profiles' : 'properties'}/${filename}`;
};

// Image processing and optimization
export const processImage = async (
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<void> => {
  const {
    width = 1200,
    height = 800,
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: format === 'jpeg' ? quality : undefined })
      .png({ quality: format === 'png' ? quality : undefined })
      .webp({ quality: format === 'webp' ? quality : undefined })
      .toFile(outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Generate thumbnail
export const generateThumbnail = async (
  inputPath: string,
  outputPath: string,
  size: number = 300
): Promise<void> => {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Enhanced image validation
export const validateImageDimensions = async (
  filePath: string,
  minWidth: number = 400,
  minHeight: number = 300,
  maxWidth: number = 4000,
  maxHeight: number = 3000
): Promise<{ valid: boolean; message?: string; metadata?: any }> => {
  try {
    const metadata = await sharp(filePath).metadata();
    
    if (!metadata.width || !metadata.height) {
      return { valid: false, message: 'Unable to read image dimensions' };
    }

    if (metadata.width < minWidth || metadata.height < minHeight) {
      return {
        valid: false,
        message: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`
      };
    }

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return {
        valid: false,
        message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`
      };
    }

    return { valid: true, metadata };
  } catch (error) {
    return { valid: false, message: 'Invalid image file' };
  }
};

// Bulk image upload for properties
export const uploadBulkPropertyImages = multer({
  storage: propertyImageStorage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 50, // Allow up to 50 images for bulk upload
  },
  fileFilter: imageFileFilter,
}).array('images', 50);

// CSV upload configuration
const csvUploadDir = path.join(uploadDir, 'csv');
if (!fs.existsSync(csvUploadDir)) {
  fs.mkdirSync(csvUploadDir, { recursive: true });
}

const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, csvUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `bulk-upload-${uniqueSuffix}.csv`);
  },
});

// CSV file filter
const csvFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed for bulk upload.'));
  }
};

// CSV upload middleware
export const uploadCSV = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for CSV files
    files: 1,
  },
  fileFilter: csvFileFilter,
}).single('file'); // Change 'csvFile' to 'file'

// CSV parsing and validation
export interface PropertyCSVRow {
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'commercial' | 'land';
  listing_type: 'sale' | 'rent';
  status: 'new' | 'resale' | 'under_construction';
  price: string;
  area_sqft?: string;
  bedrooms?: string;
  bathrooms?: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  amenities?: string; // JSON string or comma-separated
}

export interface CSVValidationResult {
  valid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: any;
  }>;
  validRows: PropertyCSVRow[];
  totalRows: number;
}

// Validate CSV row data
const validateCSVRow = (row: any, rowIndex: number): Array<{ row: number; field: string; message: string; value?: any }> => {
  const errors: Array<{ row: number; field: string; message: string; value?: any }> = [];

  // Required fields validation
  const requiredFields = ['title', 'property_type', 'listing_type', 'status', 'price', 'address', 'city', 'state'];
  
  for (const field of requiredFields) {
    if (!row[field] || row[field].toString().trim() === '') {
      errors.push({
        row: rowIndex,
        field,
        message: `${field} is required`,
        value: row[field]
      });
    }
  }

  // Property type validation
  const validPropertyTypes = ['apartment', 'house', 'commercial', 'land'];
  if (row.property_type && !validPropertyTypes.includes(row.property_type.toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'property_type',
      message: `Invalid property type. Must be one of: ${validPropertyTypes.join(', ')}`,
      value: row.property_type
    });
  }

  // Listing type validation
  const validListingTypes = ['sale', 'rent'];
  if (row.listing_type && !validListingTypes.includes(row.listing_type.toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'listing_type',
      message: `Invalid listing type. Must be one of: ${validListingTypes.join(', ')}`,
      value: row.listing_type
    });
  }

  // Status validation
  const validStatuses = ['new', 'resale', 'under_construction'];
  if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'status',
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      value: row.status
    });
  }

  // Price validation
  if (row.price) {
    const price = parseFloat(row.price.toString().replace(/[,$]/g, ''));
    if (isNaN(price) || price <= 0) {
      errors.push({
        row: rowIndex,
        field: 'price',
        message: 'Price must be a valid positive number',
        value: row.price
      });
    }
  }

  // Numeric field validations
  const numericFields = ['area_sqft', 'bedrooms', 'bathrooms'];
  for (const field of numericFields) {
    if (row[field] && row[field].toString().trim() !== '') {
      const value = parseInt(row[field]);
      if (isNaN(value) || value < 0) {
        errors.push({
          row: rowIndex,
          field,
          message: `${field} must be a valid non-negative number`,
          value: row[field]
        });
      }
    }
  }

  return errors;
};

// Parse and validate CSV file
export const parseAndValidateCSV = (filePath: string): Promise<CSVValidationResult> => {
  return new Promise((resolve) => {
    // First check if file is empty
    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        resolve({
          valid: false,
          errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }],
          validRows: [],
          totalRows: 0
        });
        return;
      }
    } catch (err) {
      resolve({
        valid: false,
        errors: [{ row: 0, field: 'file', message: `Error reading file: ${err instanceof Error ? err.message : String(err)}` }],
        validRows: [],
        totalRows: 0
      });
      return;
    }
    
    // Read file content to check format and detect issues
    let fileContent: string;
    try {
      fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
      
      // Handle BOM character that Excel sometimes adds
      if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.substring(1);
        // Write back the file without BOM
        fs.writeFileSync(filePath, fileContent);
      }
      
      // Check if file has any content after headers
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        resolve({
          valid: false,
          errors: [{ row: 0, field: 'file', message: 'CSV file has no data rows' }],
          validRows: [],
          totalRows: 0
        });
        return;
      }
    } catch (err) {
      resolve({
        valid: false,
        errors: [{ row: 0, field: 'file', message: `Error reading file content: ${err instanceof Error ? err.message : String(err)}` }],
        validRows: [],
        totalRows: 0
      });
      return;
    }
    
    const results: PropertyCSVRow[] = [];
    const errors: Array<{ row: number; field: string; message: string; value?: any }> = [];
    let rowIndex = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser({
        skipLines: 0,
        headers: true
      }))
      .on('data', (row) => {
        rowIndex++;
        
        // Log row data for debugging
        console.log(`Processing row ${rowIndex}:`, row);
        
        // Skip rows with all empty values
        if (Object.values(row).every(val => !val || val.toString().trim() === '')) {
          console.log(`Skipping empty row ${rowIndex}`);
          return;
        }
        
        // Validate row
        const rowErrors = validateCSVRow(row, rowIndex);
        
        if (rowErrors.length > 0) {
          console.log(`Row ${rowIndex} has ${rowErrors.length} errors:`, rowErrors);
          errors.push(...rowErrors);
        } else {
          // Clean and format the row data
          const cleanRow: PropertyCSVRow = {
            title: row.title?.trim() || '',
            description: row.description?.trim() || '',
            property_type: (row.property_type || 'house').toLowerCase(),
            listing_type: (row.listing_type || 'sale').toLowerCase(),
            status: (row.status || 'new').toLowerCase(),
            price: row.price?.toString().replace(/[,$]/g, '') || '0',
            area_sqft: row.area_sqft ? row.area_sqft.toString() : undefined,
            bedrooms: row.bedrooms ? row.bedrooms.toString() : undefined,
            bathrooms: row.bathrooms ? row.bathrooms.toString() : undefined,
            address: row.address?.trim() || '',
            city: row.city?.trim() || '',
            state: row.state?.trim() || '',
            postal_code: row.postal_code?.trim(),
            amenities: row.amenities?.trim()
          };
          
          results.push(cleanRow);
        }
      })
      .on('end', () => {
        console.log(`CSV parsing complete. ${rowIndex} rows processed. ${results.length} valid rows. ${errors.length} errors.`);
        
        if (rowIndex === 0) {
          resolve({
            valid: false,
            errors: [{ row: 0, field: 'file', message: 'CSV file appears to be empty or invalid. Check headers and formatting.' }],
            validRows: [],
            totalRows: 0
          });
          return;
        }
        
        resolve({
          valid: errors.length === 0 && results.length > 0,
          errors,
          validRows: results,
          totalRows: rowIndex
        });
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        resolve({
          valid: false,
          errors: [{ row: 0, field: 'file', message: `CSV parsing error: ${error.message}` }],
          validRows: [],
          totalRows: 0
        });
      });
  });
};

// Generate error report CSV
export const generateErrorReport = async (
  errors: Array<{ row: number; field: string; message: string; value?: any }>,
  outputPath: string
): Promise<void> => {
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'row', title: 'Row Number' },
      { id: 'field', title: 'Field' },
      { id: 'message', title: 'Error Message' },
      { id: 'value', title: 'Invalid Value' }
    ]
  });

  await csvWriter.writeRecords(errors);
};

// Bulk delete images
export const bulkDeleteImages = async (imagePaths: string[]): Promise<{ deleted: string[]; failed: string[] }> => {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const imagePath of imagePaths) {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        deleted.push(imagePath);
        
        // Also delete thumbnail if exists
        const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
    } catch (error) {
      console.error(`Error deleting image ${imagePath}:`, error);
      failed.push(imagePath);
    }
  }

  return { deleted, failed };
};

// Clean up orphaned images (images not referenced in database)
export const cleanupOrphanedImages = async (
  referencedImages: string[],
  directory: string
): Promise<{ cleaned: string[]; errors: string[] }> => {
  const cleaned: string[] = [];
  const errors: string[] = [];

  try {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      
      // Skip if file is still referenced
      if (referencedImages.includes(file)) {
        continue;
      }

      try {
        fs.unlinkSync(filePath);
        cleaned.push(file);
      } catch (error) {
        console.error(`Error deleting orphaned file ${file}:`, error);
        errors.push(file);
      }
    }
  } catch (error) {
    console.error('Error reading directory for cleanup:', error);
    errors.push(`Directory read error: ${error}`);
  }

  return { cleaned, errors };
};