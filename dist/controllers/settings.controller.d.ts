import { Response } from 'express';
export declare class SettingsController {
    getSetting: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getAllSettings: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createSetting: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateSetting: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    bulkUpdateSettings: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteSetting: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const settingsController: SettingsController;
//# sourceMappingURL=settings.controller.d.ts.map