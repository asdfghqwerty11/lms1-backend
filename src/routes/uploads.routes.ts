import { Router } from 'express';
import { uploadsController } from '../controllers/uploads.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

/**
 * File Download & Metadata Routes
 */

// GET: Generate signed download URL for a file
// Query params: fileId, expiresIn (optional, default 3600 seconds)
// Example: GET /api/uploads/download?fileId=xyz&expiresIn=7200
router.get('/download', uploadsController.getDownloadUrl);

// GET: Get file metadata with signed download URL
// Example: GET /api/uploads/files/:fileId
router.get('/files/:fileId', uploadsController.getFileMetadata);

/**
 * File Deletion Routes
 */

// DELETE: Delete a single file
// Example: DELETE /api/uploads/files/:fileId
router.delete('/files/:fileId', uploadsController.deleteFile);

// POST: Bulk delete multiple files
// Body: { fileIds: ['id1', 'id2', ...] }
// Example: POST /api/uploads/bulk-delete
router.post('/bulk-delete', uploadsController.deleteMultipleFiles);

/**
 * Statistics Routes
 */

// GET: Get file statistics for a case
// Example: GET /api/uploads/cases/:caseId/stats
router.get('/cases/:caseId/stats', uploadsController.getCaseFileStats);

export default router;
