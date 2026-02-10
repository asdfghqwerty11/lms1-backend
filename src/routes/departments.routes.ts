import { Router } from 'express';
import { departmentsController } from '../controllers/departments.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Department CRUD
router.post('/', departmentsController.createDepartment);
router.get('/', departmentsController.getDepartments);
router.get('/:id', departmentsController.getDepartmentById);
router.put('/:id', departmentsController.updateDepartment);
router.delete('/:id', departmentsController.deleteDepartment);

// Equipment management
router.post('/:id/equipment', departmentsController.addEquipment);
router.get('/:id/equipment', departmentsController.getDepartmentEquipment);
router.get('/equipment/:equipmentId', departmentsController.getEquipmentById);
router.put('/equipment/:equipmentId', departmentsController.updateEquipment);
router.delete('/equipment/:equipmentId', departmentsController.deleteEquipment);

export default router;
