# S3 Implementation Testing Guide

## ✅ Completed Steps

1. ✅ AWS S3 bucket created: `real-estate-portal-images-dev`
2. ✅ AWS credentials configured in .env
3. ✅ S3 connection tested successfully
4. ✅ Database migration completed (S3 columns added)
5. ✅ AWS SDK dependencies installed

## 🚀 Next Steps: Testing

### Step 1: Start Your Backend Server

```bash
npm run dev
```

The server should start on `http://localhost:3000`

### Step 2: Test S3 Upload via API

You can test the upload in several ways:

#### Option A: Using Postman/Thunder Client

1. **Create a new POST request**
   - URL: `http://localhost:3000/api/v1/upload/property-image`
   - Method: POST
   - Body: form-data

2. **Add form fields:**
   - Key: `image` (type: File)
   - Value: Select an image file from your computer
   - Key: `propertyId` (type: Text)
   - Value: `1` (or any valid property ID)

3. **Add Authorization header** (if required):
   - Key: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`

4. **Send the request**

**Expected Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": 123,
    "property_id": 1,
    "image_url": "https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/...",
    "thumbnail_url": "https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/...",
    "medium_url": "https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/...",
    "large_url": "https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/...",
    "s3_key": "properties/1/original/uuid-filename.jpg",
    "s3_bucket": "real-estate-portal-images-dev",
    "file_size": 245678,
    "mime_type": "image/jpeg",
    "width": 1920,
    "height": 1080
  }
}
```

#### Option B: Using cURL

```bash
curl -X POST http://localhost:3000/api/v1/upload/property-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "propertyId=1"
```

#### Option C: Using Your Frontend

1. Start your frontend application
2. Navigate to the property upload page
3. Select an image and upload
4. Check the browser console for the response
5. Verify the image displays correctly

### Step 3: Verify Upload in AWS Console

1. Go to AWS S3 Console
2. Open your bucket: `real-estate-portal-images-dev`
3. You should see a folder structure like:
   ```
   properties/
     └── 1/
         ├── original/
         │   └── uuid-filename.jpg
         ├── large/
         │   └── uuid-filename.jpg
         ├── medium/
         │   └── uuid-filename.jpg
         └── thumbnail/
             └── uuid-filename.jpg
   ```

### Step 4: Verify Image is Publicly Accessible

Copy one of the URLs from the response and paste it in your browser. The image should load without any authentication.

Example:
```
https://real-estate-portal-images-dev.s3.ap-south-1.amazonaws.com/properties/1/original/abc123-house.jpg
```

### Step 5: Check Database

Connect to your MySQL database and run:

```sql
SELECT 
  id,
  property_id,
  image_url,
  s3_key,
  s3_bucket,
  thumbnail_url,
  medium_url,
  large_url,
  file_size,
  mime_type,
  width,
  height,
  is_primary
FROM property_images
ORDER BY id DESC
LIMIT 5;
```

You should see the newly uploaded image with all S3 fields populated.

## 🔍 Troubleshooting

### Error: "Access Denied" when uploading

**Solution:**
1. Check AWS credentials in .env file
2. Verify IAM user has S3 permissions
3. Check bucket policy allows PutObject

### Error: "Bucket not found"

**Solution:**
1. Verify bucket name in .env matches AWS
2. Check AWS region is correct
3. Ensure bucket exists in AWS Console

### Error: "Image not publicly accessible"

**Solution:**
1. Add bucket policy for public read access (see S3_BUCKET_POLICY.md)
2. Configure CORS settings
3. Uncheck "Block all public access" in bucket settings

### Images upload but don't display

**Solution:**
1. Check CORS configuration
2. Verify bucket policy allows GetObject
3. Check image URLs in database are correct
4. Open browser console for CORS errors

### Error: "Sharp module not found"

**Solution:**
```bash
npm install sharp
```

## 📊 What to Test

### Basic Functionality
- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Delete image
- [ ] View uploaded images
- [ ] Set primary image

### Image Processing
- [ ] Verify thumbnail generated (300px)
- [ ] Verify medium size generated (800px)
- [ ] Verify large size generated (1600px)
- [ ] Check image quality
- [ ] Verify file sizes are optimized

### Error Handling
- [ ] Upload invalid file type
- [ ] Upload file too large
- [ ] Upload without authentication
- [ ] Upload to non-existent property
- [ ] Network failure during upload

### Performance
- [ ] Upload speed
- [ ] Image loading speed
- [ ] Multiple concurrent uploads
- [ ] Large file handling

## 🎯 Success Criteria

Your S3 implementation is working correctly if:

1. ✅ Images upload successfully to S3
2. ✅ All 4 sizes are generated (original, large, medium, thumbnail)
3. ✅ Images are publicly accessible via URL
4. ✅ Database records contain S3 URLs and metadata
5. ✅ Images display correctly in your application
6. ✅ Delete functionality removes images from S3
7. ✅ No CORS errors in browser console

## 📝 Next Steps After Testing

Once basic upload is working:

1. **Complete remaining tasks:**
   - Implement bulk upload
   - Add metadata handling
   - Create migration service for existing images
   - Add admin tools for monitoring

2. **Optimize:**
   - Add WebP conversion
   - Implement lazy loading
   - Add CDN (CloudFront)
   - Optimize image sizes based on usage

3. **Security:**
   - Create IAM user (if using root credentials)
   - Restrict bucket policy
   - Add rate limiting
   - Implement virus scanning

4. **Monitoring:**
   - Set up CloudWatch alerts
   - Track storage usage
   - Monitor error rates
   - Log all S3 operations

## 🆘 Need Help?

If you encounter issues:

1. Check backend logs for errors
2. Check browser console for CORS errors
3. Verify AWS credentials are correct
4. Test S3 connection with `node test-s3-connection.js`
5. Check database for uploaded records
6. Verify bucket policy and CORS configuration

## 📚 Related Documentation

- `AWS_SETUP_GUIDE.md` - Complete AWS setup instructions
- `S3_BUCKET_POLICY.md` - Bucket policy and CORS configuration
- `AWS_IAM_EXPLAINED.md` - Understanding IAM users
- `S3_IMPLEMENTATION_STATUS.md` - Current implementation status

---

**Ready to test?** Start your backend server and try uploading an image!
