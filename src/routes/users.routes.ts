import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// User CRUD
router.post('/', usersController.createUser);
router.get('/', usersController.getUsers);
router.get('/search', usersController.searchUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deactivateUser);

// Role management
router.post('/roles', usersController.createRole);
router.get('/roles', usersController.getRoles);
router.get('/roles/:id', usersController.getRoleById);
router.put('/roles/:id', usersController.updateRole);
router.delete('/roles/:id', usersController.deleteRole);

// Permission management
router.get('/permissions', usersController.getPermissions);

export default router;
