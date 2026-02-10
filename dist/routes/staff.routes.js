"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("../controllers/staff.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Staff CRUD
router.post('/', staff_controller_1.staffController.createStaff);
router.get('/', staff_controller_1.staffController.getStaff);
router.get('/:id', staff_controller_1.staffController.getStaffById);
router.put('/:id', staff_controller_1.staffController.updateStaff);
router.delete('/:id', staff_controller_1.staffController.deleteStaff);
// Staff schedules
router.get('/:id/schedules', staff_controller_1.staffController.getStaffSchedules);
router.post('/:id/schedules', staff_controller_1.staffController.addStaffSchedule);
// Performance reviews
router.get('/:id/reviews', staff_controller_1.staffController.getPerformanceReviews);
router.post('/:id/reviews', staff_controller_1.staffController.addPerformanceReview);
exports.default = router;
//# sourceMappingURL=staff.routes.js.map