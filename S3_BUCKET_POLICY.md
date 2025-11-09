# AWS S3 Bucket Policy Configuration

## Bucket Policy for Public Read Access

After creating your S3 bucket `real-estate-portal-images-dev`, you need to add a bucket policy to allow public read access to the images.

### Step 1: Navigate to Bucket Policy

1. Go to your S3 bucket in AWS Console
2. Click on the "Permissions" tab
3. Scroll down to "Bucket policy"
4. Click "Edit"

### Step 2: Add This Bucket Policy

Replace `YOUR-BUCKET-NAME` with your actual bucket name (e.g., `real-estate-portal-images-dev`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

### Example with Your Bucket Name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::real-estate-portal-images-dev/*"
    }
  ]
}
```

### What This Policy Does:

- **Version**: Specifies the policy language version
- **Statement**: Contains the permission rules
  - **Sid**: Statement ID for identification
  - **Effect**: "Allow" grants permission
  - **Principal**: "*" means anyone (public access)
  - **Action**: "s3:GetObject" allows reading/downloading objects
  - **Resource**: Specifies which objects (/* means all objects in the bucket)

### Step 3: CORS Configuration (Required for Web Access)

You also need to configure CORS to allow your frontend to access the images.

1. In the same "Permissions" tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click "Edit"
4. Add this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### For Production (More Restrictive):

Replace the wildcard "*" in AllowedOrigins with your actual domain:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## IAM User Policy for Upload Access

Your backend application needs permissions to upload, delete, and manage objects. Create an IAM user with this policy:

### Step 1: Create IAM User

1. Go to IAM Console → Users → Create user
2. Name: `real-estate-portal-s3-user`
3. Select "Access key - Programmatic access"

### Step 2: Attach This Inline Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::real-estate-portal-images-dev",
        "arn:aws:s3:::real-estate-portal-images-dev/*"
      ]
    }
  ]
}
```

### Step 3: Save Access Keys

After creating the user, AWS will show you:
- **Access Key ID**: Save this
- **Secret Access Key**: Save this (you won't see it again!)

Add these to your `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=ap-south-1
AWS_S3_BUCKET=real-estate-portal-images-dev
```

## Security Best Practices

### 1. Bucket Policy Security

The public read policy only allows:
- ✅ Reading/downloading objects
- ❌ Uploading objects (requires IAM credentials)
- ❌ Deleting objects (requires IAM credentials)
- ❌ Listing bucket contents (requires IAM credentials)

### 2. For Production Environment

Create a separate bucket for production:
- Bucket name: `real-estate-portal-images-prod`
- Use the same policies but with the production bucket name
- Use different IAM credentials for production

### 3. CloudFront CDN (Optional but Recommended)

For better performance and security:
1. Create a CloudFront distribution
2. Set S3 bucket as origin
3. Use CloudFront URL instead of direct S3 URLs
4. Enable HTTPS only
5. Set up custom domain

## Testing the Configuration

After applying the policies, test with:

### 1. Upload Test (from your backend)
```bash
# This should work with your IAM credentials
curl -X POST http://localhost:5000/api/upload \
  -F "image=@test-image.jpg"
```

### 2. Public Access Test
```bash
# This should work without authentication
curl https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/test-image.jpg
```

### 3. Browser Test
Open this URL in your browser (replace with actual uploaded image):
```
https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/your-image.jpg
```

## Troubleshooting

### Error: "Access Denied"
- Check bucket policy is correctly applied
- Verify the resource ARN matches your bucket name
- Ensure "Block all public access" is unchecked

### Error: "CORS Error"
- Verify CORS configuration is applied
- Check AllowedOrigins includes your frontend URL
- Clear browser cache and try again

### Error: "403 Forbidden" on Upload
- Check IAM user has correct permissions
- Verify AWS credentials in .env file
- Ensure credentials are not expired

## Next Steps

1. ✅ Create the S3 bucket with recommended settings
2. ✅ Apply the bucket policy for public read access
3. ✅ Configure CORS for web access
4. ✅ Create IAM user with upload permissions
5. ✅ Add credentials to .env file
6. ✅ Test upload and public access
7. ✅ Continue with remaining S3 implementation tasks

## Related Files

- Backend S3 Service: `src/services/s3Service.ts`
- Image Processing: `src/services/imageProcessingService.ts`
- Upload Controller: `src/controllers/uploadController.ts`
- Environment Config: `.env`
- Setup Guide: `AWS_SETUP_GUIDE.md`
