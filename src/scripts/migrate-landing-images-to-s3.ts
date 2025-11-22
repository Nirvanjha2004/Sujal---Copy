import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables FIRST before importing AWS config
dotenv.config();

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, s3Config, getS3BaseUrl } from '../config/aws';

/**
 * Migration result interface
 */
interface MigrationResult {
  success: boolean;
  uploaded: UploadedFile[];
  failed: FailedFile[];
  totalSize: number;
  duration: number;
}

/**
 * Uploaded file details
 */
interface UploadedFile {
  localPath: string;
  s3Key: string;
  size: number;
  url: string;
}

/**
 * Failed file details
 */
interface FailedFile {
  localPath: string;
  error: string;
}

/**
 * Migration statistics
 */
interface MigrationStats {
  totalFiles: number;
  successCount: number;
  failureCount: number;
  totalSize: number;
  startTime: number;
}

/**
 * Get content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Generate S3 key from local path
 * Converts: frontend/public/landingpage/images/1.png -> landing-page/images/1.png
 * Converts: frontend/public/landingpage/ProjectImages/shalimar/c1.jpg -> landing-page/projects/shalimar/c1.jpg
 * Converts: frontend/public/landingpage/icons/overview.png -> landing-page/icons/overview.png
 */
function generateS3Key(localPath: string): string {
  // Normalize path separators
  const normalizedPath = localPath.replace(/\\/g, '/');

  // Extract the part after 'landingpage/'
  const match = normalizedPath.match(/landingpage\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid path format: ${localPath}`);
  }

  let relativePath = match[1];

  // Replace 'ProjectImages' with 'projects'
  relativePath = relativePath.replace(/^ProjectImages\//, 'projects/');

  // Construct final S3 key
  return `landing-page/${relativePath}`;
}

/**
 * Upload file to S3 with retry logic
 */
async function uploadFileWithRetry(
  localPath: string,
  s3Key: string,
  maxRetries: number = 3
): Promise<UploadedFile> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Read file
      const fileBuffer = fs.readFileSync(localPath);
      const fileSize = fileBuffer.length;
      const contentType = getContentType(localPath);

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'original-path': localPath,
          'migration-batch': 'landing-page-migration',
        },
      });

      await s3Client.send(command);

      // Generate public URL
      const baseUrl = getS3BaseUrl();
      const url = `${baseUrl}/${s3Key}`;

      console.log(`✅ Uploaded: ${s3Key} (${(fileSize / 1024).toFixed(2)} KB)`);

      return {
        localPath,
        s3Key,
        size: fileSize,
        url,
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.warn(`⚠️  Retry ${attempt}/${maxRetries} for ${s3Key} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Upload failed after retries');
}

/**
 * Recursively get all files from a directory
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      // Skip README files
      if (!file.toLowerCase().includes('readme')) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Migrate images to S3
 */
async function migrateImagesToS3(): Promise<MigrationResult> {
  const stats: MigrationStats = {
    totalFiles: 0,
    successCount: 0,
    failureCount: 0,
    totalSize: 0,
    startTime: Date.now(),
  };

  const uploaded: UploadedFile[] = [];
  const failed: FailedFile[] = [];

  console.log('🚀 Starting landing page ICONS migration to S3...\n');
  console.log(`📦 Bucket: ${s3Config.bucket}`);
  console.log(`🌍 Region: ${s3Config.region}`);
  console.log(`🔗 Base URL: ${getS3BaseUrl()}\n`);

  // Define source directory - ONLY ICONS
  const iconsDir = path.join(process.cwd(), 'frontend', 'public', 'landingpage', 'icons');

  // Check if icons directory exists
  if (!fs.existsSync(iconsDir)) {
    console.error(`❌ Directory not found: ${iconsDir}`);
    return {
      success: false,
      uploaded: [],
      failed: [{ localPath: iconsDir, error: 'Directory not found' }],
      totalSize: 0,
      duration: Date.now() - stats.startTime,
    };
  }

  // Collect all files - ONLY FROM ICONS
  const allFiles: string[] = [];

  // Get files from icons directory only
  const iconFiles = getAllFiles(iconsDir);
  allFiles.push(...iconFiles);
  console.log(`📁 Found ${iconFiles.length} files in icons directory`);

  stats.totalFiles = allFiles.length;
  console.log(`\n📊 Total files to migrate: ${stats.totalFiles}\n`);

  // Upload each file
  for (let i = 0; i < allFiles.length; i++) {
    const localPath = allFiles[i];
    const progress = `[${i + 1}/${allFiles.length}]`;

    try {
      const s3Key = generateS3Key(localPath);
      console.log(`${progress} Uploading: ${path.basename(localPath)}`);

      const result = await uploadFileWithRetry(localPath, s3Key);

      uploaded.push(result);
      stats.successCount++;
      stats.totalSize += result.size;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`${progress} ❌ Failed: ${path.basename(localPath)} - ${errorMessage}`);

      failed.push({
        localPath,
        error: errorMessage,
      });
      stats.failureCount++;
    }
  }

  const duration = Date.now() - stats.startTime;

  return {
    success: stats.failureCount === 0,
    uploaded,
    failed,
    totalSize: stats.totalSize,
    duration,
  };
}

/**
 * Generate and display migration report
 */
function generateMigrationReport(result: MigrationResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('📋 MIGRATION REPORT');
  console.log('='.repeat(80));

  console.log(`\n⏱️  Duration: ${(result.duration / 1000).toFixed(2)} seconds`);
  console.log(`📊 Total Files: ${result.uploaded.length + result.failed.length}`);
  console.log(`✅ Successful: ${result.uploaded.length}`);
  console.log(`❌ Failed: ${result.failed.length}`);
  console.log(`💾 Total Size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n🎯 Success Rate: ${((result.uploaded.length / (result.uploaded.length + result.failed.length)) * 100).toFixed(2)}%`);

  if (result.uploaded.length > 0) {
    console.log('\n✅ SUCCESSFULLY UPLOADED FILES:');
    console.log('-'.repeat(80));
    result.uploaded.forEach((file, index) => {
      console.log(`${index + 1}. ${file.s3Key}`);
      console.log(`   Local: ${file.localPath}`);
      console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`   URL: ${file.url}`);
      console.log('');
    });
  }

  if (result.failed.length > 0) {
    console.log('\n❌ FAILED UPLOADS:');
    console.log('-'.repeat(80));
    result.failed.forEach((file, index) => {
      console.log(`${index + 1}. ${file.localPath}`);
      console.log(`   Error: ${file.error}`);
      console.log('');
    });
  }

  console.log('='.repeat(80));

  if (result.success) {
    console.log('\n🎉 Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review failed uploads.');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await migrateImagesToS3();
    generateMigrationReport(result);

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Migration failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
main();
