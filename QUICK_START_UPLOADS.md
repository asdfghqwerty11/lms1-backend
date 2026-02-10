# Quick Start: File Uploads

## 1-Minute Setup

### Install
```bash
npm install @supabase/supabase-js  # Already done
```

### Configure
Add to `.env`:
```bash
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"
```

### Build & Run
```bash
npm run build
npm run dev
```

Should see: `Storage bucket 'case-attachments' created successfully`

## Basic Usage

### Upload File
```javascript
const formData = new FormData();
formData.append('file', file); // file from input

const res = await fetch('/api/cases/CASE_ID/files', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data } = await res.json();
console.log('Uploaded:', data.filename);
console.log('Download:', data.signedUrl);
```

### List Files
```javascript
const res = await fetch('/api/cases/CASE_ID/files', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await res.json();
data.forEach(f => console.log(f.filename, f.signedUrl));
```

### Delete File
```javascript
const res = await fetch(`/api/uploads/files/${FILE_ID}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Supported File Types

| Format | Types |
|--------|-------|
| Images | JPEG, PNG, GIF, TIFF, WebP |
| Documents | PDF, DOC, DOCX |
| Dental Scans | DICOM (DCM) |
| 3D Models | STL, glTF |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/cases/{id}/files` | Upload file |
| GET | `/api/cases/{id}/files` | List files |
| DELETE | `/api/uploads/files/{id}` | Delete file |
| GET | `/api/uploads/files/{id}` | Get metadata |
| GET | `/api/uploads/download?fileId=X` | Get download URL |
| GET | `/api/uploads/cases/{id}/stats` | File stats |

## Troubleshooting

**"Service Key not configured"**
→ Add `SUPABASE_SERVICE_KEY` to .env

**"Failed to create bucket"**
→ Bucket might already exist (that's fine)

**"Invalid file type"**
→ Check file extension matches MIME type

**"Upload failed"**
→ Check internet connection, file size < 50MB

## Documentation

- **Full API**: See `UPLOADS_API.md`
- **Setup**: See `SUPABASE_SETUP.md`
- **Implementation**: See `FILE_UPLOAD_IMPLEMENTATION.md`

## Next Steps

1. Get Supabase credentials from dashboard
2. Add to `.env`
3. Restart server
4. Test with sample file
5. Integrate into frontend

---

Need help? Check the full documentation files listed above.
