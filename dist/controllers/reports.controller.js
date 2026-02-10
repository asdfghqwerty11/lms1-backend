"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = exports.ReportsController = void 0;
const reports_service_1 = require("../services/reports.service");
const errorHandler_1 = require("../middleware/errorHandler");
class ReportsController {
    constructor() {
        /**
         * GET /api/reports/dashboard
         * Returns key dashboard metrics
         */
        this.getDashboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const dashboardData = await reports_service_1.reportsService.getDashboardData();
            const response = {
                success: true,
                data: dashboardData,
            };
            res.status(200).json(response);
        });
        /**
         * GET /api/reports/analytics
         * Returns detailed analytics metrics
         */
        this.getAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const analyticsData = await reports_service_1.reportsService.getAnalyticsData();
            const response = {
                success: true,
                data: analyticsData,
            };
            res.status(200).json(response);
        });
    }
}
exports.ReportsController = ReportsController;
exports.reportsController = new ReportsController();
//# sourceMappingURL=reports.controller.js.map