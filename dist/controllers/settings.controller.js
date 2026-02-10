"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = exports.SettingsController = void 0;
const zod_1 = require("zod");
const settings_service_1 = require("../services/settings.service");
const errorHandler_1 = require("../middleware/errorHandler");
// Validation schemas
const createSettingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Setting key is required'),
    value: zod_1.z.string().min(1, 'Setting value is required'),
    type: zod_1.z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON']).optional(),
});
const updateSettingSchema = zod_1.z.object({
    value: zod_1.z.string().min(1, 'Setting value is required'),
});
const bulkUpdateSettingsSchema = zod_1.z.object({
    settings: zod_1.z.array(zod_1.z.object({
        key: zod_1.z.string(),
        value: zod_1.z.string(),
    })),
});
class SettingsController {
    constructor() {
        this.getSetting = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { key } = req.params;
            const setting = await settings_service_1.settingsService.getSettingByKey(key);
            const response = {
                success: true,
                data: setting,
            };
            res.status(200).json(response);
        });
        this.getAllSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const settings = await settings_service_1.settingsService.getAllSettings();
            const response = {
                success: true,
                data: settings,
            };
            res.status(200).json(response);
        });
        this.createSetting = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createSettingSchema.parse(req.body);
            const setting = await settings_service_1.settingsService.createSetting(validatedData);
            const response = {
                success: true,
                message: 'Setting created successfully',
                data: setting,
            };
            res.status(201).json(response);
        });
        this.updateSetting = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { key } = req.params;
            const validatedData = updateSettingSchema.parse(req.body);
            const setting = await settings_service_1.settingsService.updateSetting(key, validatedData);
            const response = {
                success: true,
                message: 'Setting updated successfully',
                data: setting,
            };
            res.status(200).json(response);
        });
        this.bulkUpdateSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = bulkUpdateSettingsSchema.parse(req.body);
            const settings = await settings_service_1.settingsService.bulkUpdateSettings(validatedData.settings);
            const response = {
                success: true,
                message: 'Settings updated successfully',
                data: settings,
            };
            res.status(200).json(response);
        });
        this.deleteSetting = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { key } = req.params;
            await settings_service_1.settingsService.deleteSetting(key);
            const response = {
                success: true,
                message: 'Setting deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
    }
}
exports.SettingsController = SettingsController;
exports.settingsController = new SettingsController();
//# sourceMappingURL=settings.controller.js.map