"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Role management (must be before /:id to avoid matching "roles" as an id)
router.post('/roles', users_controller_1.usersController.createRole);
router.get('/roles', users_controller_1.usersController.getRoles);
router.get('/roles/:id', users_controller_1.usersController.getRoleById);
router.put('/roles/:id', users_controller_1.usersController.updateRole);
router.delete('/roles/:id', users_controller_1.usersController.deleteRole);
// Permission management
router.get('/permissions', users_controller_1.usersController.getPermissions);
// User CRUD
router.post('/', users_controller_1.usersController.createUser);
router.get('/', users_controller_1.usersController.getUsers);
router.get('/search', users_controller_1.usersController.searchUsers);
router.get('/:id', users_controller_1.usersController.getUserById);
router.put('/:id', users_controller_1.usersController.updateUser);
router.delete('/:id', users_controller_1.usersController.deactivateUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map