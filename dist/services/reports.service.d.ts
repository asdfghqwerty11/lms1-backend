export interface DashboardData {
    activeCases: number;
    completedToday: number;
    revenue: number;
    avgTurnaround: number;
    totalStaff: number;
    totalDentists: number;
    lowStockItems: number;
    recentCases: Array<{
        id: string;
        caseNumber: string;
        patientName: string;
        status: string;
        dueDate: Date | null;
    }>;
    casesByStatus: Record<string, number>;
    revenueByMonth: Array<{
        month: string;
        revenue: number;
    }>;
}
export interface AnalyticsData {
    totalCases: number;
    completionRate: number;
    avgCaseValue: number;
    casesByMonth: Array<{
        month: string;
        count: number;
    }>;
    casesByType: Record<string, number>;
    topDentists: Array<{
        id: string;
        name: string;
        caseCount: number;
    }>;
    departmentMetrics: Record<string, number>;
    billingOverview: {
        totalInvoiced: number;
        totalPaid: number;
        outstanding: number;
        overdueCount: number;
    };
    inventoryOverview: {
        totalItems: number;
        lowStockCount: number;
        totalValue: number;
    };
}
export declare class ReportsService {
    /**
     * Get dashboard data with key metrics
     */
    getDashboardData(): Promise<DashboardData>;
    /**
     * Get detailed analytics data
     */
    getAnalyticsData(): Promise<AnalyticsData>;
    /**
     * Get monthly revenue for the last 6 months
     */
    private getRevenueByMonth;
    /**
     * Get case counts by month for the last 12 months
     */
    private getCasesByMonth;
}
export declare const reportsService: ReportsService;
//# sourceMappingURL=reports.service.d.ts.map