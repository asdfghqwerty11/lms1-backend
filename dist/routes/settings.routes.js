"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Settings management
router.post('/', settings_controller_1.settingsController.createSetting);
router.get('/', settings_controller_1.settingsController.getAllSettings);
router.get('/:key', settings_controller_1.settingsController.getSetting);
router.put('/:key', settings_controller_1.settingsController.updateSetting);
router.put('/', settings_controller_1.settingsController.bulkUpdateSettings);
router.delete('/:key', settings_controller_1.settingsController.deleteSetting);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map