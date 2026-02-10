"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reports_controller_1 = require("../controllers/reports.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Dashboard and Analytics routes
router.get('/dashboard', reports_controller_1.reportsController.getDashboard);
router.get('/analytics', reports_controller_1.reportsController.getAnalytics);
exports.default = router;
//# sourceMappingURL=reports.routes.js.map