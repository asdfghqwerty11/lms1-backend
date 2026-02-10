import { Router } from 'express';
import { dentistsController } from '../controllers/dentists.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Applications (must be before /:id to avoid matching "applications" as an id)
router.get('/applications', dentistsController.getDentistApplications);
router.put('/applications/:applicationId/review', dentistsController.reviewApplication);

// Dentist CRUD
router.post('/', dentistsController.createDentist);
router.get('/', dentistsController.getDentists);
router.get('/:id', dentistsController.getDentistById);
router.put('/:id', dentistsController.updateDentist);
router.delete('/:id', dentistsController.deleteDentist);

export default router;
