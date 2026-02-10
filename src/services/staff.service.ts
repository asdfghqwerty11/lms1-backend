import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import {
  PaginationParams,
  PaginatedResponse,
} from '../types';

export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId: string;
  position: string;
  department: string;
  specialization?: string;
  hireDate: string;
  salary: number;
  qualifications?: string;
  certifications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  department?: string;
  specialization?: string;
  salary?: number;
  qualifications?: string;
  certifications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

export interface AddStaffScheduleRequest {
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
  type?: 'REGULAR' | 'OVERTIME' | 'LEAVE' | 'HOLIDAY';
  notes?: string;
}

export interface AddPerformanceReviewRequest {
  rating: number;
  comments?: string;
}

export interface StaffFilterParams {
  department?: string;
  status?: string;
  position?: string;
  search?: string;
}

export class StaffService {
  async createStaff(data: CreateStaffRequest): Promise<any> {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createAppError('User with this email already exists', 400, 'EMAIL_EXISTS');
    }

    // Check if employee ID is unique
    const existingStaff = await prisma.staffProfile.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (existingStaff) {
      throw createAppError('Employee ID already exists', 400, 'EMPLOYEE_ID_EXISTS');
    }

    // Create user and staff profile together
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: '', // Password will be set during first login/registration
      },
    });

    const staffProfile = await prisma.staffProfile.create({
      data: {
        userId: user.id,
        employeeId: data.employeeId,
        position: data.position,
        department: data.department,
        specialization: data.specialization,
        hireDate: new Date(data.hireDate),
        salary: data.salary,
        qualifications: data.qualifications,
        certifications: data.certifications,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
      },
    });

    const newStaff = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        staffProfile: {
          include: {
            schedules: true,
            reviews: true,
          },
        },
      },
    });

    return newStaff;
  }

  async getStaffById(staffId: string): Promise<any> {
    // Check if staffId is a User ID or StaffProfile ID
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
      include: {
        user: true,
        schedules: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: true,
          },
          orderBy: { reviewDate: 'desc' },
        },
      },
    });

    if (!staffProfile) {
      // Try by staff profile ID
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
        include: {
          user: true,
          schedules: {
            orderBy: { createdAt: 'desc' },
          },
          reviews: {
            include: {
              reviewer: true,
            },
            orderBy: { reviewDate: 'desc' },
          },
        },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    return staffProfile;
  }

  async getStaff(
    filters: StaffFilterParams,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.position) {
      where.position = filters.position;
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' as const } } },
        { employeeId: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    const [staffProfiles, total] = await Promise.all([
      prisma.staffProfile.findMany({
        where: where as any,
        include: {
          user: true,
          schedules: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          reviews: {
            include: {
              reviewer: true,
            },
            orderBy: { reviewDate: 'desc' },
            take: 3,
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staffProfile.count({ where: where as any }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: staffProfiles,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async updateStaff(staffId: string, data: UpdateStaffRequest): Promise<any> {
    // Find staff by user ID or staff profile ID
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
    });

    if (!staffProfile) {
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    const updateData: any = {};

    if (data.position !== undefined) updateData.position = data.position;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.salary !== undefined) updateData.salary = data.salary;
    if (data.qualifications !== undefined) updateData.qualifications = data.qualifications;
    if (data.certifications !== undefined) updateData.certifications = data.certifications;
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
    if (data.emergencyPhone !== undefined) updateData.emergencyPhone = data.emergencyPhone;
    if (data.status !== undefined) updateData.status = data.status;

    const userUpdate: any = {};
    if (data.firstName !== undefined) userUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName;
    if (data.phone !== undefined) userUpdate.phone = data.phone;

    const updatedStaff = await prisma.staffProfile.update({
      where: { id: staffProfile.id },
      data: updateData,
      include: {
        user: true,
        schedules: true,
        reviews: {
          include: {
            reviewer: true,
          },
          orderBy: { reviewDate: 'desc' },
        },
      },
    });

    // Update user info if provided
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: staffProfile.userId },
        data: userUpdate,
      });
    }

    return updatedStaff;
  }

  async deleteStaff(staffId: string): Promise<void> {
    // Find staff by user ID or staff profile ID
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
    });

    if (!staffProfile) {
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    // Deactivate the user instead of deleting
    await prisma.user.update({
      where: { id: staffProfile.userId },
      data: { isActive: false },
    });

    // Mark staff as inactive
    await prisma.staffProfile.update({
      where: { id: staffProfile.id },
      data: { status: 'INACTIVE' },
    });
  }

  async getStaffSchedules(staffId: string): Promise<any[]> {
    // Find staff profile first
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
    });

    if (!staffProfile) {
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    return prisma.staffSchedule.findMany({
      where: { staffId: staffProfile.userId },
      orderBy: { startTime: 'asc' },
    });
  }

  async addStaffSchedule(staffId: string, data: AddStaffScheduleRequest): Promise<any> {
    // Find staff profile first
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
    });

    if (!staffProfile) {
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    const newSchedule = await prisma.staffSchedule.create({
      data: {
        staffId: staffProfile.userId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        dayOfWeek: data.dayOfWeek,
        type: data.type || 'REGULAR',
        notes: data.notes,
        staffProfileId: staffProfile.id,
      },
    });

    return newSchedule;
  }

  async getPerformanceReviews(staffId: string): Promise<any[]> {
    // Find staff profile first
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
    });

    if (!staffProfile) {
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    return prisma.performanceReview.findMany({
      where: { staffId: staffProfile.id },
      include: {
        reviewer: true,
      },
      orderBy: { reviewDate: 'desc' },
    });
  }

  async addPerformanceReview(
    staffId: string,
    reviewerId: string,
    data: AddPerformanceReviewRequest
  ): Promise<any> {
    // Find staff profile first
    let staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: staffId },
    });

    if (!staffProfile) {
      staffProfile = await prisma.staffProfile.findUnique({
        where: { id: staffId },
      });
    }

    if (!staffProfile) {
      throw createAppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    // Verify reviewer exists
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw createAppError('Reviewer not found', 404, 'REVIEWER_NOT_FOUND');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw createAppError('Rating must be between 1 and 5', 400, 'INVALID_RATING');
    }

    const newReview = await prisma.performanceReview.create({
      data: {
        staffId: staffProfile.id,
        reviewerId,
        rating: data.rating,
        comments: data.comments,
        reviewDate: new Date(),
      },
      include: {
        reviewer: true,
      },
    });

    return newReview;
  }
}

export const staffService = new StaffService();
