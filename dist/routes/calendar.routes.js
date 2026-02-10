"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// TODO: Implement calendar/appointment routes
// GET /appointments - List appointments
// POST /appointments - Create appointment
// GET /appointments/:id - Get appointment by ID
// PUT /appointments/:id - Update appointment
// DELETE /appointments/:id - Delete appointment
// GET /calendar/:date - Get calendar for date
// GET /calendar/week/:date - Get week view
// GET /calendar/month/:date - Get month view
// PUT /appointments/:id/confirm - Confirm appointment
// PUT /appointments/:id/cancel - Cancel appointment
// POST /appointments/:id/reminder - Send reminder
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map