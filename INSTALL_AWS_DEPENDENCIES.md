# Install AWS S3 Dependencies

Run these commands in your backend directory:

```bash
# Install AWS SDK for S3
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Install UUID for unique filenames
npm install uuid

# Install types for UUID
npm install --save-dev @types/uuid
```

## Verify Installation

After installation, your package.json should include:

```json
"dependencies": {
  "@aws-sdk/client-s3": "^3.x.x",
  "@aws-sdk/s3-request-presigner": "^3.x.x",
  "uuid": "^10.x.x",
  "sharp": "^0.34.4"  // Already installed
}
```

## Next Steps

After running the install command, proceed with implementing the AWS configuration and S3 service.
