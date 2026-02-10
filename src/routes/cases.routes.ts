import { Router } from 'express';
import multer from 'multer';
import { casesController } from '../controllers/cases.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';
import env from '../config/env';

const router = Router();

// Configure multer for file uploads
// Use memory storage since we're uploading directly to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE || 52428800, // 50MB default for dental scans and X-rays
  },
  fileFilter: (_req, file, cb) => {
    // Allow dental-specific file types
    const allowedMimes = [
      // Images (X-rays, photos, impressions)
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/tiff',
      'image/x-tiff',
      'image/webp',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Dental scan formats
      'application/dicom',
      'application/x-dcm',
      // 3D model formats
      'model/stl',
      'model/gltf+json',
      'model/gltf-binary',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images (JPEG, PNG, GIF, TIFF, WebP), documents (PDF, DOC, DOCX), and dental scans (DICOM, STL, glTF)`));
    }
  },
});

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Case CRUD
router.post('/', casesController.createCase);
router.get('/', casesController.getCases);
router.get('/search', casesController.searchCases);
router.get('/:id', casesController.getCaseById);
router.put('/:id', casesController.updateCase);
router.delete('/:id', casesController.deleteCase);

// Case files
// POST: Upload a file for a case (supports X-rays, scans, impressions, photos, documents)
router.post('/:id/files', upload.single('file'), casesController.addCaseFile);

// GET: List all files for a case (with signed download URLs)
router.get('/:id/files', casesController.getCaseFiles);

// DELETE: Delete a specific file from a case
router.delete('/:id/files/:fileId', casesController.deleteCaseFile);

// POST: Upload multiple files at once (bulk upload)
router.post('/:id/files/bulk', upload.array('files', 10), async (req: any, res: any) => {
  // Bulk upload handler - can be implemented in controller
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    // TODO: Implement bulk file upload in controller
    res.status(501).json({
      success: false,
      message: 'Bulk upload coming soon',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

// Case notes
router.post('/:id/notes', casesController.addCaseNote);
router.get('/:id/notes', casesController.getCaseNotes);

// Workflow
router.get('/:id/workflow', casesController.getCaseWorkflow);
router.post('/:id/workflow', casesController.addWorkflowStage);

export default router;
