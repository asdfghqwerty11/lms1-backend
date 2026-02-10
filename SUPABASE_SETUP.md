# Supabase Storage Setup Guide

This guide walks you through configuring Supabase Storage for the DentalKart LMS file upload system.

## Prerequisites

- Supabase project already created ([create one here](https://app.supabase.com))
- DentalKart LMS backend cloned and dependencies installed
- Supabase credentials (Project URL and Service Key)

## Step-by-Step Setup

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click on your project (or create a new one)
3. Click on **Settings** (gear icon) in the left sidebar
4. Click on **API** section
5. Copy the following:
   - **Project URL** - Usually looks like: `https://sfmwhcxwhfjbxlrrcldd.supabase.co`
   - **Project ID** - From the URL (e.g., `sfmwhcxwhfjbxlrrcldd`)
   - **Service Role Key** - Find in the "API keys" section, copy the service role key

### 2. Set Environment Variables

Create or update your `.env` file with:

```bash
# Supabase Configuration
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key-here"

# File Upload Settings (already set, for reference)
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR="./uploads"  # For fallback local storage
```

**Example:**
```bash
SUPABASE_URL="https://sfmwhcxwhfjbxlrrcldd.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Verify Connection

Start the server to automatically initialize the storage bucket:

```bash
npm run dev
```

You should see in the logs:
```
Storage bucket 'case-attachments' created successfully
```

Or if it already exists:
```
Storage bucket 'case-attachments' already exists
```

### 4. Check Supabase Dashboard

To verify the bucket was created:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **Storage** in the left sidebar
4. You should see a bucket named **`case-attachments`**

If not visible, click the **"New bucket"** button and create it manually with these settings:
- **Name**: `case-attachments`
- **Public bucket**: Toggle OFF (keep private)
- **File size limit**: 50 MB

### 5. Configure Storage Policies (Optional but Recommended)

For additional security, you can set up Row Level Security (RLS) policies:

1. In Supabase Dashboard, go to **Storage**
2. Click on the **`case-attachments`** bucket
3. Go to the **Policies** tab
4. Add policy to restrict access to authenticated users only

Example SQL policy:
```sql
-- Allow authenticated users to list files in their case paths
CREATE POLICY "Authenticated users can list case files" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'case-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 6. Test File Upload

Use the API to test uploading a file:

```bash
# Get your authentication token first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Use the token to upload a file
curl -X POST http://localhost:3000/api/cases/CASE_ID/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/your/file.jpg"
```

### 7. Monitor Storage Usage

In Supabase Dashboard:

1. Go to **Storage**
2. Click on **`case-attachments`** bucket
3. View total storage used at the top

## Troubleshooting

### Error: "Service Key not configured"

**Problem**: `SUPABASE_SERVICE_KEY` environment variable is missing or incorrect

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Copy the **Service Role Key** (not the Anon key)
3. Add it to `.env`: `SUPABASE_SERVICE_KEY="key-here"`
4. Restart the server

### Error: "Failed to create bucket"

**Problem**: Bucket already exists or permission denied

**Solution**:
1. Check if `case-attachments` bucket already exists in Supabase
2. If it exists, that's fine - the server will use it
3. If you get permission errors, verify the Service Key has permissions
4. Try creating the bucket manually through Supabase Dashboard

### Error: "Upload failed: Network error"

**Problem**: Cannot connect to Supabase

**Solution**:
1. Verify `SUPABASE_URL` is correct
2. Check internet connection
3. Verify Supabase project is active (not paused)
4. Check firewall/proxy settings if behind corporate network

### Files not accessible after upload

**Problem**: Signed URLs return 403 Forbidden

**Solution**:
1. Verify the Service Key has storage permissions
2. Check that the file path matches the storage structure
3. Ensure signed URL hasn't expired
4. Try generating a new signed URL with longer expiration

## Storage Structure

Files are organized as follows:

```
case-attachments/
├── cases/
│   ├── case_123/
│   │   ├── 1707123456-abc123-xray.jpg
│   │   ├── 1707123457-def456-scan.dcm
│   │   └── 1707123458-ghi789-document.pdf
│   ├── case_124/
│   │   └── 1707123459-jkl012-photo.png
```

## File Size Considerations

### Bandwidth Usage Calculation

- Single upload: ~2-10 MB (typical X-ray)
- Case with 10 files: ~20-100 MB
- Average clinic usage: 100-500 MB per month

Supabase provides generous quotas. Check your plan details.

## Production Deployment

### Before Going Live

1. **Backup your Supabase project**:
   ```bash
   # Via Supabase dashboard: Settings → Backups
   ```

2. **Test with realistic file sizes**:
   - Upload 50MB file (max size)
   - Verify download works
   - Check bandwidth usage

3. **Set up monitoring**:
   - Monitor Supabase Storage dashboard
   - Set up alerts for storage quota

4. **Review security policies**:
   - Ensure bucket is private
   - Verify authentication is required
   - Test that unauthorized users cannot access files

5. **Configure CORS if needed**:
   - If frontend is on different domain
   - Add frontend URL to CORS settings in Supabase

## Advanced Configuration

### Custom Signed URL Expiration

You can customize URL expiration per request:

```javascript
// Short-lived URL (5 minutes)
GET /api/uploads/download?fileId=xyz&expiresIn=300

// Long-lived URL (7 days)
GET /api/uploads/download?fileId=xyz&expiresIn=604800
```

### Bulk Upload via API

Upload multiple files at once:

```bash
curl -X POST http://localhost:3000/api/cases/case_123/files/bulk \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@file1.jpg" \
  -F "files=@file2.dcm" \
  -F "files=@file3.pdf"
```

### Storage Quotas and Plans

| Plan | Storage | Bandwidth |
|------|---------|-----------|
| Free | 1 GB | 1 GB/month |
| Pro | 100 GB | 100 GB/month |
| Enterprise | Custom | Custom |

[View Supabase Pricing](https://supabase.com/pricing)

## Related Files

- **Configuration**: `/src/config/storage.ts`
- **API Endpoints**: `/src/routes/uploads.routes.ts`
- **API Documentation**: `UPLOADS_API.md`
- **Service Implementation**: `/src/services/cases.service.ts`

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase REST API Docs](https://supabase.com/docs/reference/api/storage-new-object)
- [Supabase Auth Integration](https://supabase.com/docs/guides/auth)

## Support

For issues with:
- **DentalKart Backend**: Check backend logs with `npm run dev`
- **Supabase Storage**: Visit [Supabase Support](https://supabase.com/support)
- **File Upload Issues**: See UPLOADS_API.md Troubleshooting section

---

Last Updated: February 2024
