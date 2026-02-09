import { Router } from 'express';
import multer from 'multer';
import { casesController } from '../controllers/cases.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';
import env from '../config/env';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}-${random}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    // Allow common document and image types
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
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
router.post('/:id/files', upload.single('file'), casesController.addCaseFile);
router.get('/:id/files', casesController.getCaseFiles);
router.delete('/:id/files/:fileId', casesController.deleteCaseFile);

// Case notes
router.post('/:id/notes', casesController.addCaseNote);
router.get('/:id/notes', casesController.getCaseNotes);

// Workflow
router.get('/:id/workflow', casesController.getCaseWorkflow);
router.post('/:id/workflow', casesController.addWorkflowStage);

export default router;
