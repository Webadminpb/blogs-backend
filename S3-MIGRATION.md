# AWS S3 Migration Guide

## Overview

This document outlines the migration from Cloudinary to AWS S3 for file uploads in the DaSalon Blog Backend.

## Changes Made

### 1. New Files Created

- **src/lib/s3.service.ts** - S3 service handling all AWS S3 operations with Cloudinary-compatible response format

### 2. Modified Files

- **src/settings/settings.module.ts** - Added S3Service to providers and exports
- **src/settings/settings.service.ts** - Updated `saveUpload()` to use S3Service instead of local storage
- **src/settings/settings.controller.ts** - Updated upload endpoint response format
- **package.json** - Added `@aws-sdk/client-s3` and `mime-types` dependencies

### 3. Environment Variables Required

Add the following to your `.env.local` and `.env.production`:

\`\`\`env
AWS_REGION=ap-south-1
S3_BUCKET=dasalon-blog
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
\`\`\`

## Features

### S3 Upload Response Format (Cloudinary-Compatible)

The S3 service returns responses in the following format for backward compatibility:

\`\`\`typescript
{
secure_url: "https://dasalon-blog.s3.ap-south-1.amazonaws.com/settings/logo-1234567890-abc123.png",
public_id: "settings/logo-1234567890",
bytes: 45678,
format: "png"
}
\`\`\`

### File Upload Endpoint

- **POST /api/settings/upload** - Upload file to S3 (Admin only)
  - Request: multipart/form-data with `file` field
  - Response: `{ url: "https://...", message: "File uploaded successfully to AWS S3" }`

### File Deletion

The `S3Service` provides a `deleteFile()` method for removing files:

\`\`\`typescript
await this.s3Service.deleteFile(public_id);
\`\`\`

## Testing the Migration

### Local Testing

1. Configure `.env.local` with AWS credentials
2. Run: `npm run start:dev`
3. Use Postman or curl to test:
   \`\`\`bash
   curl -X POST http://localhost:4000/api/settings/upload \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -F "file=@/path/to/file.png"
   \`\`\`

### Production Deployment

1. Add environment variables to Vercel/deployment platform
2. Deploy backend
3. Monitor logs for S3 connection issues
4. Verify S3 bucket ACL is set to `public-read`

## Troubleshooting

### Common Issues

**1. Access Denied Error**

- Verify AWS credentials are correct in `.env`
- Ensure IAM user has S3 PutObject and DeleteObject permissions
- Check S3 bucket policy allows public uploads

**2. File Not Found After Upload**

- Verify S3_BUCKET name matches actual bucket name
- Check AWS_REGION is correct
- Ensure ACL is set to 'public-read' in upload configuration

**3. CORS Issues**

- Configure S3 bucket CORS settings to allow requests from frontend domain
- Add to bucket CORS configuration:
  \`\`\`json
  {
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedOrigins": ["https://your-frontend-domain.com"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
  }
  \`\`\`

## Migration Checklist

- [x] Create S3Service with Cloudinary-compatible response format
- [x] Update SettingsService to use S3Service
- [x] Update SettingsController with new upload endpoint
- [x] Add AWS SDK dependencies to package.json
- [x] Document environment variables required
- [x] Add error handling for S3 operations
- [ ] Test upload functionality
- [ ] Test file deletion functionality
- [ ] Deploy to production
- [ ] Monitor S3 bucket for successful uploads

## Rollback Plan

If you need to rollback to local storage:

1. Revert changes to `settings.service.ts`
2. Remove S3Service injection
3. Implement local file storage logic in `saveUpload()`
4. Remove AWS dependencies from package.json

## Support

For issues or questions about this migration, contact the development team.
