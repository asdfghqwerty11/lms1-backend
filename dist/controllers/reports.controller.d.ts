import { Response } from 'express';
export declare class ReportsController {
    /**
     * GET /api/reports/dashboard
     * Returns key dashboard metrics
     */
    getDashboard: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /api/reports/analytics
     * Returns detailed analytics metrics
     */
    getAnalytics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const reportsController: ReportsController;
//# sourceMappingURL=reports.controller.d.ts.map