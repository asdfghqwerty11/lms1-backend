"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploads_controller_1 = require("../controllers/uploads.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
/**
 * File Download & Metadata Routes
 */
// GET: Generate signed download URL for a file
// Query params: fileId, expiresIn (optional, default 3600 seconds)
// Example: GET /api/uploads/download?fileId=xyz&expiresIn=7200
router.get('/download', uploads_controller_1.uploadsController.getDownloadUrl);
// GET: Get file metadata with signed download URL
// Example: GET /api/uploads/files/:fileId
router.get('/files/:fileId', uploads_controller_1.uploadsController.getFileMetadata);
/**
 * File Deletion Routes
 */
// DELETE: Delete a single file
// Example: DELETE /api/uploads/files/:fileId
router.delete('/files/:fileId', uploads_controller_1.uploadsController.deleteFile);
// POST: Bulk delete multiple files
// Body: { fileIds: ['id1', 'id2', ...] }
// Example: POST /api/uploads/bulk-delete
router.post('/bulk-delete', uploads_controller_1.uploadsController.deleteMultipleFiles);
/**
 * Statistics Routes
 */
// GET: Get file statistics for a case
// Example: GET /api/uploads/cases/:caseId/stats
router.get('/cases/:caseId/stats', uploads_controller_1.uploadsController.getCaseFileStats);
exports.default = router;
//# sourceMappingURL=uploads.routes.js.map