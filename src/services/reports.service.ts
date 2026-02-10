import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

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

export class ReportsService {
  /**
   * Get dashboard data with key metrics
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      // 1. Active cases (IN_PROGRESS or PENDING)
      const activeCases = await prisma.case.count({
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

      const completedToday = await prisma.case.count({
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

      const paidInvoices = await prisma.invoice.aggregate({
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
      const completedCases = await prisma.case.findMany({
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
            const diffTime = Math.abs(
              (c.completedDate as Date).getTime() - c.createdAt.getTime()
            );
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          })
          .reduce((a, b) => a + b, 0);
        avgTurnaround = Math.round(turnaroundDays / completedCases.length);
      }

      // 5. Total active staff
      const totalStaff = await prisma.staffProfile.count({
        where: {
          status: 'ACTIVE',
        },
      });

      // 6. Total verified dentists
      const totalDentists = await prisma.dentistProfile.count({
        where: {
          status: 'VERIFIED',
        },
      });

      // 7. Low stock items (quantity < minStock)
      const allItems = await prisma.inventoryItem.findMany({
        select: {
          quantity: true,
          minStock: true,
        },
      });
      const lowStockItems = allItems.filter((item) => item.quantity < item.minStock).length;

      // 8. Recent cases (last 10)
      const recentCases = await prisma.case.findMany({
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
      const caseStatusGroups = await prisma.case.groupBy({
        by: ['status'],
        _count: true,
      });

      const casesByStatus: Record<string, number> = {};
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
    } catch (error) {
      console.error('Dashboard data error:', error);
      throw createAppError('Failed to fetch dashboard data', 500, 'DASHBOARD_ERROR');
    }
  }

  /**
   * Get detailed analytics data
   */
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // 1. Total cases
      const totalCases = await prisma.case.count();

      // 2. Completion rate
      const completedCases = await prisma.case.count({
        where: { status: 'COMPLETED' },
      });
      const completionRate =
        totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

      // 3. Average case value (from invoices)
      const invoiceStats = await prisma.invoice.aggregate({
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
      const departmentStats = await prisma.case.groupBy({
        by: ['priority'],
        _count: true,
      });
      const casesByType: Record<string, number> = {};
      for (const group of departmentStats) {
        casesByType[group.priority] = group._count;
      }

      // 6. Top dentists by case count
      const topDentists = await prisma.case.groupBy({
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

      const topDentistsList = await Promise.all(
        topDentists.map(async (d) => {
          const dentist = await prisma.dentistProfile.findUnique({
            where: { id: d.dentistId },
            include: { user: true },
          });
          return {
            id: d.dentistId,
            name: dentist ? `${dentist.user.firstName} ${dentist.user.lastName}` : 'Unknown',
            caseCount: d._count.id,
          };
        })
      );

      // 7. Department metrics
      const departmentCases = await prisma.case.groupBy({
        by: ['departmentId'],
        _count: true,
        where: {
          departmentId: { not: null },
        },
      });

      const departmentMetrics: Record<string, number> = {};
      for (const dept of departmentCases) {
        if (dept.departmentId) {
          const department = await prisma.department.findUnique({
            where: { id: dept.departmentId },
          });
          departmentMetrics[department?.name || dept.departmentId] = dept._count;
        }
      }

      // 8. Billing overview
      const billingStats = await prisma.invoice.aggregate({
        _sum: {
          total: true,
        },
      });

      const paidStats = await prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: {
          total: true,
        },
      });

      const totalInvoiced = billingStats._sum.total ? Number(billingStats._sum.total) : 0;
      const totalPaid = paidStats._sum.total ? Number(paidStats._sum.total) : 0;
      const outstanding = totalInvoiced - totalPaid;

      const overdueCount = await prisma.invoice.count({
        where: {
          status: 'OVERDUE',
        },
      });

      // 9. Inventory overview
      const totalItems = await prisma.inventoryItem.count();

      const allInventoryItems = await prisma.inventoryItem.findMany({
        select: {
          quantity: true,
          minStock: true,
        },
      });
      const lowStockCount = allInventoryItems.filter(
        (item) => item.quantity < item.minStock
      ).length;

      // Calculate total inventory value (quantity * unitPrice for each item)
      const inventoryItemsForValue = await prisma.inventoryItem.findMany({
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
    } catch (error) {
      console.error('Analytics data error:', error);
      throw createAppError('Failed to fetch analytics data', 500, 'ANALYTICS_ERROR');
    }
  }

  /**
   * Get monthly revenue for the last 6 months
   */
  private async getRevenueByMonth(): Promise<Array<{ month: string; revenue: number }>> {
    const monthData: Array<{ month: string; revenue: number }> = [];
    const months: Array<{ year: number; month: number; label: string }> = [];

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

      const revenue = await prisma.invoice.aggregate({
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
  private async getCasesByMonth(): Promise<Array<{ month: string; count: number }>> {
    const monthData: Array<{ month: string; count: number }> = [];
    const months: Array<{ year: number; month: number; label: string }> = [];

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

      const count = await prisma.case.count({
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

export const reportsService = new ReportsService();
