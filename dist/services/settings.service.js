"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = exports.SettingsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class SettingsService {
    async getSettingByKey(key) {
        const setting = await database_1.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw (0, errorHandler_1.createAppError)('Setting not found', 404, 'SETTING_NOT_FOUND');
        }
        return setting;
    }
    async getAllSettings() {
        return database_1.prisma.setting.findMany({
            orderBy: { key: 'asc' },
        });
    }
    async updateSetting(key, data) {
        // Get existing setting to verify it exists
        const existingSetting = await database_1.prisma.setting.findUnique({
            where: { key },
        });
        if (!existingSetting) {
            throw (0, errorHandler_1.createAppError)('Setting not found', 404, 'SETTING_NOT_FOUND');
        }
        const updated = await database_1.prisma.setting.update({
            where: { key },
            data: {
                value: data.value,
                updatedAt: new Date(),
            },
        });
        return updated;
    }
    async createSetting(data) {
        // Check if key already exists
        const existing = await database_1.prisma.setting.findUnique({
            where: { key: data.key },
        });
        if (existing) {
            throw (0, errorHandler_1.createAppError)('Setting key already exists', 400, 'SETTING_KEY_EXISTS');
        }
        const setting = await database_1.prisma.setting.create({
            data: {
                key: data.key,
                value: data.value,
                type: data.type || 'STRING',
            },
        });
        return setting;
    }
    async bulkUpdateSettings(settings) {
        const updated = await Promise.all(settings.map((s) => database_1.prisma.setting.update({
            where: { key: s.key },
            data: {
                value: s.value,
                updatedAt: new Date(),
            },
        }).catch(() => {
            throw (0, errorHandler_1.createAppError)(`Setting '${s.key}' not found`, 404, 'SETTING_NOT_FOUND');
        })));
        return updated;
    }
    async deleteSetting(key) {
        const setting = await database_1.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw (0, errorHandler_1.createAppError)('Setting not found', 404, 'SETTING_NOT_FOUND');
        }
        await database_1.prisma.setting.delete({
            where: { key },
        });
    }
}
exports.SettingsService = SettingsService;
exports.settingsService = new SettingsService();
//# sourceMappingURL=settings.service.js.map