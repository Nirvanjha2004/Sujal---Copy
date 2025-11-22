# CORS Fix Guide for S3 Images

## Problem
Images are being blocked with `ERR_BLOCKED_BY_ORB` error because:
1. S3 responses don't include CORS headers
2. CloudFront is caching old responses without CORS headers

## Solution

### Step 1: Verify S3 CORS Configuration

Your current CORS config is correct:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET","HEAD"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}]
```

### Step 2: Invalidate CloudFront Cache

The CloudFront distribution is caching old responses. Run this command:

```powershell
aws cloudfront create-invalidation `
  --distribution-id E1AQ1UDP341U7C `
  --paths "/*"
```

This will clear all cached images and force CloudFront to fetch fresh copies from S3 with CORS headers.

### Step 3: Wait for Invalidation

Check the invalidation status:

```powershell
aws cloudfront list-invalidations --distribution-id E1AQ1UDP341U7C
```

Wait until the status shows "Completed" (usually 5-15 minutes).

### Step 4: Test Image Loading

After invalidation completes:

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Check if images load

### Step 5: Verify CORS Headers

Test if CORS headers are present:

```powershell
curl -I -H "Origin: http://localhost:3001" `
  https://d1ju5fpewrbfx8.cloudfront.net/landing-page/projects/Amanora/Gateway%20II%20Main%20Brochure%20Final_page-0005.jpg
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Expose-Headers: ETag
```

## Alternative: Use Direct S3 URLs Temporarily

If CloudFront invalidation takes too long, you can temporarily use direct S3 URLs by commenting out the CloudFront URL in your `.env` file:

```env
# AWS_CLOUDFRONT_URL=https://d1ju5fpewrbfx8.cloudfront.net
```

Then restart your frontend. Images will load directly from S3 (slower but will work immediately).

## Quick Fix Script

Run this PowerShell script to do everything automatically:

```powershell
# Invalidate CloudFront cache
Write-Host "Invalidating CloudFront cache..." -ForegroundColor Yellow
$invalidation = aws cloudfront create-invalidation `
  --distribution-id E1AQ1UDP341U7C `
  --paths "/*" `
  --output json | ConvertFrom-Json

$invalidationId = $invalidation.Invalidation.Id
Write-Host "Invalidation created: $invalidationId" -ForegroundColor Green

# Wait for completion
Write-Host "Waiting for invalidation to complete (this may take 5-15 minutes)..." -ForegroundColor Cyan
do {
  Start-Sleep -Seconds 30
  $status = aws cloudfront get-invalidation `
    --distribution-id E1AQ1UDP341U7C `
    --id $invalidationId `
    --query 'Invalidation.Status' `
    --output text
  Write-Host "Status: $status" -ForegroundColor Yellow
} while ($status -ne "Completed")

Write-Host "✓ Invalidation complete! Clear your browser cache and refresh." -ForegroundColor Green
```

## Why This Happens

1. **S3 CORS** is configured correctly
2. **CloudFront** cached the images BEFORE CORS was configured
3. **Browser** receives cached responses without CORS headers
4. **ORB (Opaque Response Blocking)** blocks the images for security

The invalidation forces CloudFront to fetch fresh copies from S3 with proper CORS headers.
