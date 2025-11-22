# CloudFront Cache Invalidation - AWS Console Guide

## Step-by-Step Instructions

### Step 1: Open CloudFront Console

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Sign in with your credentials
3. In the search bar at the top, type "CloudFront"
4. Click on "CloudFront" service

### Step 2: Find Your Distribution

1. You'll see a list of CloudFront distributions
2. Look for distribution ID: **E1AQ1UDP341U7C**
3. Or look for domain name: **d1ju5fpewrbfx8.cloudfront.net**
4. Click on the distribution ID to open it

### Step 3: Create Invalidation

1. In the distribution details page, click on the **"Invalidations"** tab
2. Click the **"Create invalidation"** button (orange button on the right)
3. In the "Add object paths" field, enter: `/*`
   - This means "invalidate all files"
4. Click **"Create invalidation"** button at the bottom

### Step 4: Wait for Completion

1. You'll see the invalidation in the list with status "In Progress"
2. Refresh the page every few minutes
3. Wait until the status changes to **"Completed"**
4. This usually takes **5-15 minutes**

### Step 5: Test Your Images

After the invalidation is complete:

1. **Clear your browser cache**:
   - Chrome/Edge: Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"

2. **Hard refresh your page**:
   - Press `Ctrl + F5` (or `Ctrl + Shift + R`)

3. **Check if images load**:
   - Go to your FeaturedProjectDetailsPage
   - Images should now load properly!

## Visual Guide

```
AWS Console
    ↓
Search "CloudFront"
    ↓
Click on distribution E1AQ1UDP341U7C
    ↓
Click "Invalidations" tab
    ↓
Click "Create invalidation" button
    ↓
Enter: /*
    ↓
Click "Create invalidation"
    ↓
Wait for "Completed" status (5-15 min)
    ↓
Clear browser cache + Hard refresh
    ↓
Images should load! ✓
```

## What This Does

- **Clears CloudFront cache**: Removes all cached images
- **Forces fresh fetch**: CloudFront will fetch new copies from S3
- **Includes CORS headers**: New copies will have proper CORS headers
- **Fixes ORB error**: Browser will no longer block the images

## Troubleshooting

If images still don't load after invalidation:

1. **Check invalidation status**: Make sure it shows "Completed"
2. **Clear browser cache again**: Sometimes you need to clear it twice
3. **Try incognito mode**: Open page in private/incognito window
4. **Check browser console**: Look for any new error messages

## Alternative: Temporary Fix

If you can't wait for invalidation, temporarily disable CloudFront:

1. Open `frontend/.env` file
2. Comment out the CloudFront URL:
   ```env
   # AWS_CLOUDFRONT_URL=https://d1ju5fpewrbfx8.cloudfront.net
   ```
3. Restart your frontend server
4. Images will load directly from S3 (slower but works immediately)

## Need Help?

If you're stuck, take a screenshot of:
1. The CloudFront invalidations page
2. The browser console errors
3. The network tab showing the failed image requests

This will help diagnose the issue!
