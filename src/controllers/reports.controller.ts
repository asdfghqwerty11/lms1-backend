import { Response } from 'express';
import { reportsService } from '../services/reports.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse } from '../types';

export class ReportsController {
  /**
   * GET /api/reports/dashboard
   * Returns key dashboard metrics
   */
  getDashboard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const dashboardData = await reportsService.getDashboardData();

    const response: SuccessResponse<typeof dashboardData> = {
      success: true,
      data: dashboardData,
    };

    res.status(200).json(response);
  });

  /**
   * GET /api/reports/analytics
   * Returns detailed analytics metrics
   */
  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const analyticsData = await reportsService.getAnalyticsData();

    const response: SuccessResponse<typeof analyticsData> = {
      success: true,
      data: analyticsData,
    };

    res.status(200).json(response);
  });
}

export const reportsController = new ReportsController();
