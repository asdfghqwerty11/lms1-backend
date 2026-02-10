# File Upload API Documentation

## Overview

The DentalKart LMS backend now includes comprehensive file upload capabilities for case attachments using **Supabase Storage**. This system supports X-rays, dental scans, impressions, photos, and other relevant documents.

## Features

- **Secure Cloud Storage**: Files are stored in Supabase Storage (private bucket)
- **Signed URLs**: Temporary download links with configurable expiration (default 1 hour)
- **Large File Support**: Up to 50MB file size limit suitable for high-resolution dental scans
- **File Type Validation**: Support for medical and dental imaging formats
- **Audit Trail**: All file uploads/deletions are tracked in the database
- **Bulk Operations**: Upload and delete multiple files at once

## File Type Support

### Supported MIME Types

| Category | Types | Use Case |
|----------|-------|----------|
| **Images** | JPEG, PNG, GIF, TIFF, WebP | X-rays, dental photos, impressions |
| **Documents** | PDF, DOC, DOCX | Treatment notes, prescriptions, forms |
| **Dental Scans** | DICOM, DCM | CT scans, cone beam CT (CBCT) |
| **3D Models** | STL, glTF, glTF Binary | CAD designs, 3D printed models |

### Attachment Types

Files are automatically categorized:
- `xray` - X-ray images (DICOM format)
- `scan` - 3D scans and CBCT data
- `impression` - Impression photos and molds
- `photo` - General dental photographs
- `document` - PDFs and documents
- `other` - Miscellaneous files

## API Endpoints

### Case File Upload

#### Upload Single File to Case

```http
POST /api/cases/{caseId}/files
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
file: <binary file data>
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "file_123",
    "caseId": "case_456",
    "filename": "patient_xray.jpg",
    "fileSize": 2097152,
    "fileType": "image/jpeg",
    "fileUrl": "cases/case_456/1707123456-abc123-patient_xray.jpg",
    "uploadedAt": "2024-02-10T10:30:00Z",
    "createdAt": "2024-02-10T10:30:00Z",
    "updatedAt": "2024-02-10T10:30:00Z",
    "signedUrl": "https://sfmwhcxwhfjbxlrrcldd.supabase.co/storage/...",
    "attachmentType": "photo"
  }
}
```

#### Upload Multiple Files (Bulk)

```http
POST /api/cases/{caseId}/files/bulk
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
files: <multiple binary files (max 10)>
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    { /* file 1 */ },
    { /* file 2 */ }
  ]
}
```

### Retrieve Files

#### List All Files for a Case

```http
GET /api/cases/{caseId}/files
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "file_123",
      "caseId": "case_456",
      "filename": "patient_xray.jpg",
      "fileSize": 2097152,
      "fileType": "image/jpeg",
      "fileUrl": "cases/case_456/1707123456-abc123-patient_xray.jpg",
      "uploadedAt": "2024-02-10T10:30:00Z",
      "createdAt": "2024-02-10T10:30:00Z",
      "updatedAt": "2024-02-10T10:30:00Z",
      "signedUrl": "https://sfmwhcxwhfjbxlrrcldd.supabase.co/storage/...",
      "attachmentType": "photo"
    }
  ]
}
```

#### Get File Metadata with Download URL

```http
GET /api/uploads/files/{fileId}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "caseId": "case_456",
    "filename": "patient_xray.jpg",
    "fileSize": 2097152,
    "fileType": "image/jpeg",
    "fileUrl": "cases/case_456/1707123456-abc123-patient_xray.jpg",
    "signedUrl": "https://sfmwhcxwhfjbxlrrcldd.supabase.co/storage/..."
  }
}
```

#### Generate Signed Download URL

```http
GET /api/uploads/download?fileId={fileId}&expiresIn=3600
Authorization: Bearer {token}
```

**Query Parameters:**
- `fileId` (required): File ID
- `expiresIn` (optional): URL expiration in seconds (default: 3600 = 1 hour)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://sfmwhcxwhfjbxlrrcldd.supabase.co/storage/...",
    "expiresIn": 3600
  }
}
```

### Delete Files

#### Delete Single File

```http
DELETE /api/cases/{caseId}/files/{fileId}
Authorization: Bearer {token}
```

**Alternative:**
```http
DELETE /api/uploads/files/{fileId}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": null
}
```

#### Bulk Delete Multiple Files

```http
POST /api/uploads/bulk-delete
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "fileIds": ["file_123", "file_456", "file_789"]
}
```

**Response (200 OK or 207 Multi-Status):**
```json
{
  "success": true,
  "message": "All files deleted successfully",
  "data": {
    "deleted": ["file_123", "file_456", "file_789"],
    "failed": []
  }
}
```

### File Statistics

#### Get Case File Statistics

```http
GET /api/uploads/cases/{caseId}/stats
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalFiles": 5,
    "totalSize": 15728640,
    "totalSizeMB": "15.00",
    "averageFileSize": 3145728,
    "averageFileSizeMB": "3.00",
    "fileTypes": {
      "image/jpeg": 3,
      "application/dicom": 1,
      "application/pdf": 1
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "code": "INVALID_FILE_TYPE",
  "message": "Invalid file type: application/octet-stream. Allowed types: images (JPEG, PNG, GIF, TIFF, WebP), documents (PDF, DOC, DOCX), and dental scans (DICOM, STL, glTF)"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "User not authenticated"
}
```

### 404 Not Found
```json
{
  "success": false,
  "code": "FILE_NOT_FOUND",
  "message": "File not found"
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "code": "FILE_TOO_LARGE",
  "message": "File size exceeds 50MB limit"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "code": "FILE_UPLOAD_FAILED",
  "message": "Failed to upload file: Network error"
}
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL="https://sfmwhcxwhfjbxlrrcldd.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key-here"

# File Upload Settings
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR="./uploads"  # Fallback for local storage (not used with Supabase)
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Service Role Key → `SUPABASE_SERVICE_KEY`

## Usage Examples

### Upload File (cURL)

```bash
curl -X POST http://localhost:3000/api/cases/case_123/files \
  -H "Authorization: Bearer your_token_here" \
  -F "file=@patient_xray.jpg"
```

### Upload File (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/cases/case_123/files', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
if (result.success) {
  const downloadUrl = result.data.signedUrl;
  console.log('File uploaded, download URL:', downloadUrl);
}
```

### Get Download URL (JavaScript)

```javascript
const response = await fetch('/api/uploads/download?fileId=file_123&expiresIn=7200', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
if (result.success) {
  window.location.href = result.data.url; // Download file
}
```

### List Case Files (JavaScript)

```javascript
const response = await fetch('/api/cases/case_123/files', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
if (result.success) {
  result.data.forEach(file => {
    console.log(`${file.filename} (${(file.fileSize / 1024 / 1024).toFixed(2)}MB)`);
  });
}
```

## Best Practices

1. **Always Validate File Types Client-Side**: Check MIME type before sending to server
2. **Use Short Expiration Times**: Keep signed URLs valid for only as long as needed
3. **Monitor Storage Usage**: Regularly check case file statistics
4. **Delete Unused Files**: Remove old or duplicate files to save storage space
5. **Handle Large Files**: Show progress bars for files > 10MB
6. **Implement Retry Logic**: Network issues may require retry attempts
7. **Set Appropriate Expiration Times**:
   - Quick downloads: 1 hour (3600 seconds)
   - Sharing links: 24 hours (86400 seconds)
   - Long-term access: 7 days (604800 seconds)

## Limits & Quotas

| Parameter | Limit |
|-----------|-------|
| Max file size | 50 MB |
| Max files per request | 10 (bulk upload) |
| Max files per case | Unlimited |
| Signed URL expiration | 1 - 604800 seconds |
| Storage per project | Per Supabase plan |

## Troubleshooting

### "Failed to upload file: Service Key not configured"
**Solution**: Ensure `SUPABASE_SERVICE_KEY` is set in your `.env` file

### "Invalid file type"
**Solution**: Check that your file MIME type is in the supported list. Use a correct file extension.

### "Signed URL generation failed"
**Solution**: Verify Supabase credentials and ensure the bucket exists

### "File not found" when deleting
**Solution**: The file may have already been deleted. Check case files list first.

## Database Schema

Files are stored with this schema:

```prisma
model CaseFile {
  id         String   @id @default(cuid())
  caseId     String
  filename   String
  fileSize   BigInt
  fileType   String
  fileUrl    String    // Supabase Storage path
  uploadedAt DateTime  @default(now())
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  case Case @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
}
```

## Security

- **Private Bucket**: Files are not publicly accessible
- **Signed URLs**: Temporary access with expiration
- **Authentication Required**: All endpoints require valid JWT token
- **Path Isolation**: Files are organized by case ID
- **Audit Trail**: All uploads are recorded with user ID
- **No Direct Access**: Files must be accessed through API endpoints

---

For more information, see the [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
