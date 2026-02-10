"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const cases_routes_1 = __importDefault(require("./cases.routes"));
const workflow_routes_1 = __importDefault(require("./workflow.routes"));
const billing_routes_1 = __importDefault(require("./billing.routes"));
const inventory_routes_1 = __importDefault(require("./inventory.routes"));
const staff_routes_1 = __importDefault(require("./staff.routes"));
const departments_routes_1 = __importDefault(require("./departments.routes"));
const communications_routes_1 = __importDefault(require("./communications.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const dentists_routes_1 = __importDefault(require("./dentists.routes"));
const logistics_routes_1 = __importDefault(require("./logistics.routes"));
const reports_routes_1 = __importDefault(require("./reports.routes"));
const uploads_routes_1 = __importDefault(require("./uploads.routes"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});
// API routes
router.use('/api/auth', auth_routes_1.default);
router.use('/api/cases', cases_routes_1.default);
router.use('/api/workflow', workflow_routes_1.default);
router.use('/api/billing', billing_routes_1.default);
router.use('/api/inventory', inventory_routes_1.default);
router.use('/api/staff', staff_routes_1.default);
router.use('/api/departments', departments_routes_1.default);
router.use('/api/communications', communications_routes_1.default);
router.use('/api/settings', settings_routes_1.default);
router.use('/api/users', users_routes_1.default);
router.use('/api/dentists', dentists_routes_1.default);
router.use('/api/logistics', logistics_routes_1.default);
router.use('/api/reports', reports_routes_1.default);
router.use('/api/uploads', uploads_routes_1.default);
// Placeholder routes for modules not yet needed
router.use('/api/calendar', (_req, res) => {
    res.status(501).json({
        success: false,
        message: 'Calendar module not yet implemented',
    });
});
// 404 handler
router.use((_req, res) => {
    res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map