"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const departments_controller_1 = require("../controllers/departments.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Department CRUD
router.post('/', departments_controller_1.departmentsController.createDepartment);
router.get('/', departments_controller_1.departmentsController.getDepartments);
router.get('/:id', departments_controller_1.departmentsController.getDepartmentById);
router.put('/:id', departments_controller_1.departmentsController.updateDepartment);
router.delete('/:id', departments_controller_1.departmentsController.deleteDepartment);
// Equipment management
router.post('/:id/equipment', departments_controller_1.departmentsController.addEquipment);
router.get('/:id/equipment', departments_controller_1.departmentsController.getDepartmentEquipment);
router.get('/equipment/:equipmentId', departments_controller_1.departmentsController.getEquipmentById);
router.put('/equipment/:equipmentId', departments_controller_1.departmentsController.updateEquipment);
router.delete('/equipment/:equipmentId', departments_controller_1.departmentsController.deleteEquipment);
exports.default = router;
//# sourceMappingURL=departments.routes.js.map