export declare class SettingsService {
    getSettingByKey(key: string): Promise<any>;
    getAllSettings(): Promise<any[]>;
    updateSetting(key: string, data: {
        value: string;
    }): Promise<any>;
    createSetting(data: {
        key: string;
        value: string;
        type?: string;
    }): Promise<any>;
    bulkUpdateSettings(settings: Array<{
        key: string;
        value: string;
    }>): Promise<any[]>;
    deleteSetting(key: string): Promise<void>;
}
export declare const settingsService: SettingsService;
//# sourceMappingURL=settings.service.d.ts.map