"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class ReportsService {
    /**
     * Get dashboard data with key metrics
     */
    async getDashboardData() {
        try {
            // 1. Active cases (IN_PROGRESS or PENDING)
            const activeCases = await database_1.prisma.case.count({
                where: {
                    status: {
                        in: ['IN_PROGRESS', 'RECEIVED'],
                    },
                },
            });
            // 2. Completed today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const completedToday = await database_1.prisma.case.count({
                where: {
                    status: 'COMPLETED',
                    completedDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            });
            // 3. Revenue (sum of paid invoices this month)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const paidInvoices = await database_1.prisma.invoice.aggregate({
                where: {
                    status: 'PAID',
                    paidDate: {
                        gte: startOfMonth,
                    },
                },
                _sum: {
                    total: true,
                },
            });
            const revenue = paidInvoices._sum.total ? Number(paidInvoices._sum.total) : 0;
            // 4. Average turnaround (days between creation and completion)
            const completedCases = await database_1.prisma.case.findMany({
                where: {
                    status: 'COMPLETED',
                    completedDate: { not: null },
                },
                select: {
                    createdAt: true,
                    completedDate: true,
                },
            });
            let avgTurnaround = 0;
            if (completedCases.length > 0) {
                const turnaroundDays = completedCases
                    .map((c) => {
                    const diffTime = Math.abs(c.completedDate.getTime() - c.createdAt.getTime());
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                })
                    .reduce((a, b) => a + b, 0);
                avgTurnaround = Math.round(turnaroundDays / completedCases.length);
            }
            // 5. Total active staff
            const totalStaff = await database_1.prisma.staffProfile.count({
                where: {
                    status: 'ACTIVE',
                },
            });
            // 6. Total verified dentists
            const totalDentists = await database_1.prisma.dentistProfile.count({
                where: {
                    status: 'VERIFIED',
                },
            });
            // 7. Low stock items (quantity < minStock)
            const allItems = await database_1.prisma.inventoryItem.findMany({
                select: {
                    quantity: true,
                    minStock: true,
                },
            });
            const lowStockItems = allItems.filter((item) => item.quantity < item.minStock).length;
            // 8. Recent cases (last 10)
            const recentCases = await database_1.prisma.case.findMany({
                select: {
                    id: true,
                    caseNumber: true,
                    patientName: true,
                    status: true,
                    dueDate: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            });
            // 9. Cases by status
            const caseStatusGroups = await database_1.prisma.case.groupBy({
                by: ['status'],
                _count: true,
            });
            const casesByStatus = {};
            for (const group of caseStatusGroups) {
                casesByStatus[group.status] = group._count;
            }
            // 10. Revenue by month (last 6 months)
            const revenueByMonth = await this.getRevenueByMonth();
            return {
                activeCases,
                completedToday,
                revenue,
                avgTurnaround,
                totalStaff,
                totalDentists,
                lowStockItems,
                recentCases,
                casesByStatus,
                revenueByMonth,
            };
        }
        catch (error) {
            console.error('Dashboard data error:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch dashboard data', 500, 'DASHBOARD_ERROR');
        }
    }
    /**
     * Get detailed analytics data
     */
    async getAnalyticsData() {
        try {
            // 1. Total cases
            const totalCases = await database_1.prisma.case.count();
            // 2. Completion rate
            const completedCases = await database_1.prisma.case.count({
                where: { status: 'COMPLETED' },
            });
            const completionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
            // 3. Average case value (from invoices)
            const invoiceStats = await database_1.prisma.invoice.aggregate({
                _avg: {
                    total: true,
                },
                _sum: {
                    total: true,
                },
                _count: true,
            });
            const avgCaseValue = invoiceStats._avg.total ? Number(invoiceStats._avg.total) : 0;
            // 4. Cases by month (last 12 months)
            const casesByMonth = await this.getCasesByMonth();
            // 5. Cases by department (using department field, but cases may not have priority as type)
            const departmentStats = await database_1.prisma.case.groupBy({
                by: ['priority'],
                _count: true,
            });
            const casesByType = {};
            for (const group of departmentStats) {
                casesByType[group.priority] = group._count;
            }
            // 6. Top dentists by case count
            const topDentists = await database_1.prisma.case.groupBy({
                by: ['dentistId'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 5,
            });
            const topDentistsList = await Promise.all(topDentists.map(async (d) => {
                const dentist = await database_1.prisma.dentistProfile.findUnique({
                    where: { id: d.dentistId },
                    include: { user: true },
                });
                return {
                    id: d.dentistId,
                    name: dentist ? `${dentist.user.firstName} ${dentist.user.lastName}` : 'Unknown',
                    caseCount: d._count.id,
                };
            }));
            // 7. Department metrics
            const departmentCases = await database_1.prisma.case.groupBy({
                by: ['departmentId'],
                _count: true,
                where: {
                    departmentId: { not: null },
                },
            });
            const departmentMetrics = {};
            for (const dept of departmentCases) {
                if (dept.departmentId) {
                    const department = await database_1.prisma.department.findUnique({
                        where: { id: dept.departmentId },
                    });
                    departmentMetrics[department?.name || dept.departmentId] = dept._count;
                }
            }
            // 8. Billing overview
            const billingStats = await database_1.prisma.invoice.aggregate({
                _sum: {
                    total: true,
                },
            });
            const paidStats = await database_1.prisma.invoice.aggregate({
                where: { status: 'PAID' },
                _sum: {
                    total: true,
                },
            });
            const totalInvoiced = billingStats._sum.total ? Number(billingStats._sum.total) : 0;
            const totalPaid = paidStats._sum.total ? Number(paidStats._sum.total) : 0;
            const outstanding = totalInvoiced - totalPaid;
            const overdueCount = await database_1.prisma.invoice.count({
                where: {
                    status: 'OVERDUE',
                },
            });
            // 9. Inventory overview
            const totalItems = await database_1.prisma.inventoryItem.count();
            const allInventoryItems = await database_1.prisma.inventoryItem.findMany({
                select: {
                    quantity: true,
                    minStock: true,
                },
            });
            const lowStockCount = allInventoryItems.filter((item) => item.quantity < item.minStock).length;
            // Calculate total inventory value (quantity * unitPrice for each item)
            const inventoryItemsForValue = await database_1.prisma.inventoryItem.findMany({
                select: {
                    quantity: true,
                    unitPrice: true,
                },
            });
            let totalValue = 0;
            for (const item of inventoryItemsForValue) {
                totalValue += item.quantity * Number(item.unitPrice);
            }
            return {
                totalCases,
                completionRate,
                avgCaseValue,
                casesByMonth,
                casesByType,
                topDentists: topDentistsList,
                departmentMetrics,
                billingOverview: {
                    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
                    totalPaid: Math.round(totalPaid * 100) / 100,
                    outstanding: Math.round(outstanding * 100) / 100,
                    overdueCount,
                },
                inventoryOverview: {
                    totalItems,
                    lowStockCount,
                    totalValue: Math.round(totalValue * 100) / 100,
                },
            };
        }
        catch (error) {
            console.error('Analytics data error:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch analytics data', 500, 'ANALYTICS_ERROR');
        }
    }
    /**
     * Get monthly revenue for the last 6 months
     */
    async getRevenueByMonth() {
        const monthData = [];
        const months = [];
        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                year: d.getFullYear(),
                month: d.getMonth(),
                label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            });
        }
        for (const m of months) {
            const startDate = new Date(m.year, m.month, 1);
            const endDate = new Date(m.year, m.month + 1, 1);
            const revenue = await database_1.prisma.invoice.aggregate({
                where: {
                    status: 'PAID',
                    paidDate: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
                _sum: {
                    total: true,
                },
            });
            monthData.push({
                month: m.label,
                revenue: revenue._sum.total ? Number(revenue._sum.total) : 0,
            });
        }
        return monthData;
    }
    /**
     * Get case counts by month for the last 12 months
     */
    async getCasesByMonth() {
        const monthData = [];
        const months = [];
        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                year: d.getFullYear(),
                month: d.getMonth(),
                label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            });
        }
        for (const m of months) {
            const startDate = new Date(m.year, m.month, 1);
            const endDate = new Date(m.year, m.month + 1, 1);
            const count = await database_1.prisma.case.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
            });
            monthData.push({
                month: m.label,
                count,
            });
        }
        return monthData;
    }
}
exports.ReportsService = ReportsService;
exports.reportsService = new ReportsService();
//# sourceMappingURL=reports.service.js.map