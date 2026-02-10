"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cases_controller_1 = require("../controllers/cases.controller");
const auth_1 = require("../middleware/auth");
const env_1 = __importDefault(require("../config/env"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
// Use memory storage since we're uploading directly to Supabase
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: env_1.default.MAX_FILE_SIZE || 52428800, // 50MB default for dental scans and X-rays
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
        }
        else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images (JPEG, PNG, GIF, TIFF, WebP), documents (PDF, DOC, DOCX), and dental scans (DICOM, STL, glTF)`));
        }
    },
});
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Case CRUD
router.post('/', cases_controller_1.casesController.createCase);
router.get('/', cases_controller_1.casesController.getCases);
router.get('/search', cases_controller_1.casesController.searchCases);
router.get('/:id', cases_controller_1.casesController.getCaseById);
router.put('/:id', cases_controller_1.casesController.updateCase);
router.delete('/:id', cases_controller_1.casesController.deleteCase);
// Case files
// POST: Upload a file for a case (supports X-rays, scans, impressions, photos, documents)
router.post('/:id/files', upload.single('file'), cases_controller_1.casesController.addCaseFile);
// GET: List all files for a case (with signed download URLs)
router.get('/:id/files', cases_controller_1.casesController.getCaseFiles);
// DELETE: Delete a specific file from a case
router.delete('/:id/files/:fileId', cases_controller_1.casesController.deleteCaseFile);
// POST: Upload multiple files at once (bulk upload)
router.post('/:id/files/bulk', upload.array('files', 10), async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
    }
});
// Case notes
router.post('/:id/notes', cases_controller_1.casesController.addCaseNote);
router.get('/:id/notes', cases_controller_1.casesController.getCaseNotes);
// Workflow
router.get('/:id/workflow', cases_controller_1.casesController.getCaseWorkflow);
router.post('/:id/workflow', cases_controller_1.casesController.addWorkflowStage);
exports.default = router;
//# sourceMappingURL=cases.routes.js.map