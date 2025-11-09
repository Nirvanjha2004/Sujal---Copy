# AWS S3 Setup Guide for Real Estate Portal

## Prerequisites
- AWS Account (create at https://aws.amazon.com if you don't have one)
- AWS CLI installed (optional but recommended)

## Step 1: Create S3 Bucket

### Via AWS Console:

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Navigate to S3**: Search for "S3" in the services search bar
3. **Create Bucket**:
   - Click "Create bucket"
   - **Bucket name**: `real-estate-portal-images-[your-unique-id]` (must be globally unique)
     - Example: `real-estate-portal-images-prod-2024`
   - **Region**: Choose closest to your users (e.g., `us-east-1`, `ap-south-1`)
   - **Block Public Access settings**: 
     - ✅ Uncheck "Block all public access" (we need public read for images)
     - ⚠️ Acknowledge the warning
   - **Bucket Versioning**: Disabled (optional: enable for backup)
   - **Tags**: Add tags if needed (e.g., `Environment: Production`)
   - **Default encryption**: Enable (SSE-S3)
   - Click "Create bucket"

### Via AWS CLI:
```bash
# Replace with your bucket name and region
aws s3 mb s3://real-estate-portal-images-prod-2024 --region us-east-1
```

## Step 2: Configure Bucket Policy

1. **Go to your bucket** → **Permissions** tab
2. **Bucket Policy** → Click "Edit"
3. **Paste this policy** (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/properties/*/original/*"
    },
    {
      "Sid": "PublicReadThumbnails",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME/properties/*/thumbnails/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME/properties/*/medium/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME/properties/*/large/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME/projects/*/original/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME/projects/*/thumbnails/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME/projects/*/medium/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME/projects/*/large/*"
      ]
    }
  ]
}
```

4. Click "Save changes"

## Step 3: Configure CORS

1. **Go to your bucket** → **Permissions** tab
2. **Cross-origin resource sharing (CORS)** → Click "Edit"
3. **Paste this CORS configuration**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

4. Click "Save changes"

## Step 4: Create IAM User for Backend

### Via AWS Console:

1. **Navigate to IAM**: Search for "IAM" in services
2. **Users** → Click "Create user"
3. **User details**:
   - **User name**: `real-estate-portal-s3-user`
   - Click "Next"
4. **Set permissions**:
   - Select "Attach policies directly"
   - Click "Create policy" (opens new tab)
   
5. **Create Custom Policy**:
   - Click "JSON" tab
   - Paste this policy (replace `YOUR-BUCKET-NAME`):

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
        "s3:GetObjectAcl",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

   - Click "Next"
   - **Policy name**: `RealEstatePortalS3Policy`
   - Click "Create policy"

6. **Back to Create User tab**:
   - Refresh the policies list
   - Search for `RealEstatePortalS3Policy`
   - Select it
   - Click "Next"
   - Click "Create user"

## Step 5: Generate Access Keys

1. **Click on the user** you just created
2. **Security credentials** tab
3. **Access keys** → Click "Create access key"
4. **Use case**: Select "Application running outside AWS"
5. Check the confirmation box
6. Click "Next"
7. **Description**: `Real Estate Portal Backend`
8. Click "Create access key"
9. **⚠️ IMPORTANT**: Copy both:
   - **Access key ID**: `AKIA...`
   - **Secret access key**: `wJalr...` (only shown once!)
10. Click "Done"

## Step 6: Configure Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=real-estate-portal-images-prod-2024
AWS_ACCESS_KEY_ID=AKIA...your-access-key-id
AWS_SECRET_ACCESS_KEY=wJalr...your-secret-access-key

# Optional: CloudFront CDN URL (set up later)
# AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## Step 7: Test S3 Connection

After implementing the backend code, test with:

```bash
# From your backend directory
npm run test:s3
```

Or manually test upload:

```bash
# Using AWS CLI
aws s3 cp test-image.jpg s3://YOUR-BUCKET-NAME/test/ --region us-east-1
aws s3 ls s3://YOUR-BUCKET-NAME/test/
aws s3 rm s3://YOUR-BUCKET-NAME/test/test-image.jpg
```

## Security Best Practices

### ✅ DO:
- ✅ Use IAM user with minimal permissions
- ✅ Rotate access keys every 90 days
- ✅ Enable S3 bucket encryption
- ✅ Use environment variables for credentials
- ✅ Never commit credentials to Git
- ✅ Enable CloudTrail for audit logging
- ✅ Set up billing alerts

### ❌ DON'T:
- ❌ Use root account credentials
- ❌ Make entire bucket public
- ❌ Commit `.env` file to Git
- ❌ Share access keys
- ❌ Use same keys for dev and prod

## Cost Monitoring

### Set up Billing Alert:

1. **AWS Console** → **Billing Dashboard**
2. **Budgets** → **Create budget**
3. **Budget type**: Cost budget
4. **Budget amount**: $10/month (adjust as needed)
5. **Alert threshold**: 80% of budgeted amount
6. **Email**: your-email@example.com

### Estimated Monthly Costs:
```
Storage (400GB):     $9.20
PUT requests:        $0.25
GET requests:        $0.40
Data transfer:       $9.00
------------------------
Total:              ~$19/month
```

## Optional: CloudFront CDN Setup

For better performance (recommended for production):

1. **Navigate to CloudFront**
2. **Create distribution**
3. **Origin domain**: Select your S3 bucket
4. **Origin access**: Public
5. **Viewer protocol policy**: Redirect HTTP to HTTPS
6. **Cache policy**: CachingOptimized
7. **Create distribution**
8. **Copy distribution domain**: `d1234567890.cloudfront.net`
9. **Add to .env**: `AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net`

## Troubleshooting

### Issue: "Access Denied" errors
- Check IAM policy has correct permissions
- Verify bucket policy allows public read
- Check CORS configuration

### Issue: "Bucket not found"
- Verify bucket name in .env matches actual bucket
- Check region is correct
- Ensure bucket exists

### Issue: Images not loading
- Check bucket policy allows public read
- Verify CORS configuration
- Check browser console for errors
- Test direct S3 URL in browser

## Next Steps

After completing AWS setup:
1. ✅ Verify all credentials are in `.env`
2. ✅ Test S3 connection
3. ✅ Proceed to Task 2: Backend Configuration
4. ✅ Implement S3 service code

## Support

- AWS Documentation: https://docs.aws.amazon.com/s3/
- AWS Support: https://console.aws.amazon.com/support/
- Pricing Calculator: https://calculator.aws/

---

**⚠️ IMPORTANT REMINDERS:**
1. Never commit AWS credentials to Git
2. Add `.env` to `.gitignore`
3. Use different buckets for dev/staging/prod
4. Enable MFA on AWS account
5. Review AWS bill monthly
