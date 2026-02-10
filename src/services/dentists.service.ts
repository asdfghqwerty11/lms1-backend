import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import {
  PaginationParams,
  PaginatedResponse,
} from '../types';

interface CreateDentistRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  licenseNumber: string;
  specialization?: string;
  clinic?: string;
  clinicPhone?: string;
  clinicEmail?: string;
}

interface UpdateDentistRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
  clinic?: string;
  clinicPhone?: string;
  clinicEmail?: string;
}

interface DentistFilterParams {
  specialization?: string;
  status?: string;
  search?: string;
}

interface ReviewApplicationRequest {
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  notes?: string;
}

export class DentistsService {
  async createDentist(data: CreateDentistRequest): Promise<any> {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createAppError('User with this email already exists', 400, 'USER_EXISTS');
    }

    // Check if license number is already used
    const existingLicense = await prisma.dentistProfile.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existingLicense) {
      throw createAppError('License number already registered', 400, 'LICENSE_EXISTS');
    }

    // Create user and dentist profile together
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: '', // Password will be set during first login/registration
        roles: {
          connect: [{ name: 'dentist' }],
        },
      },
    });

    const dentistProfile = await prisma.dentistProfile.create({
      data: {
        userId: user.id,
        licenseNumber: data.licenseNumber,
        specialization: data.specialization,
        clinic: data.clinic,
        clinicPhone: data.clinicPhone,
        clinicEmail: data.clinicEmail,
        status: 'PENDING_VERIFICATION',
      },
      include: {
        user: true,
      },
    });

    // Create initial application
    await prisma.dentistApplication.create({
      data: {
        dentistId: dentistProfile.id,
        status: 'SUBMITTED',
      },
    });

    return dentistProfile;
  }

  async getDentistById(dentistId: string): Promise<any> {
    const dentist = await prisma.dentistProfile.findUnique({
      where: { id: dentistId },
      include: {
        user: true,
        cases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        applications: {
          orderBy: { submittedDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!dentist) {
      throw createAppError('Dentist not found', 404, 'DENTIST_NOT_FOUND');
    }

    return dentist;
  }

  async getDentists(
    filters: DentistFilterParams,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.specialization) {
      where.specialization = {
        contains: filters.specialization,
        mode: 'insensitive' as const,
      };
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' as const } } },
        { clinic: { contains: filters.search, mode: 'insensitive' as const } },
        { licenseNumber: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    const [dentists, total] = await Promise.all([
      prisma.dentistProfile.findMany({
        where: where as any,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              cases: true,
              applications: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dentistProfile.count({ where: where as any }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: dentists,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async updateDentist(dentistId: string, data: UpdateDentistRequest): Promise<any> {
    const dentist = await prisma.dentistProfile.findUnique({
      where: { id: dentistId },
    });

    if (!dentist) {
      throw createAppError('Dentist not found', 404, 'DENTIST_NOT_FOUND');
    }

    const updateData: any = {};

    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.clinic !== undefined) updateData.clinic = data.clinic;
    if (data.clinicPhone !== undefined) updateData.clinicPhone = data.clinicPhone;
    if (data.clinicEmail !== undefined) updateData.clinicEmail = data.clinicEmail;

    // Update user fields if provided
    const userUpdateData: any = {};
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
    if (data.phone !== undefined) userUpdateData.phone = data.phone;

    // Update in transaction
    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: dentist.userId },
          data: userUpdateData,
        });
      }

      return tx.dentistProfile.update({
        where: { id: dentistId },
        data: updateData,
        include: {
          user: true,
        },
      });
    });

    return updated;
  }

  async deleteDentist(dentistId: string): Promise<void> {
    const dentist = await prisma.dentistProfile.findUnique({
      where: { id: dentistId },
    });

    if (!dentist) {
      throw createAppError('Dentist not found', 404, 'DENTIST_NOT_FOUND');
    }

    // Deactivate user instead of deleting
    await prisma.user.update({
      where: { id: dentist.userId },
      data: { isActive: false },
    });

    // Update dentist status to INACTIVE
    await prisma.dentistProfile.update({
      where: { id: dentistId },
      data: { status: 'INACTIVE' },
    });
  }

  async getDentistApplications(
    filters: { status?: string; dentistId?: string },
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dentistId) {
      where.dentistId = filters.dentistId;
    }

    const [applications, total] = await Promise.all([
      prisma.dentistApplication.findMany({
        where: where as any,
        include: {
          dentist: {
            include: {
              user: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { submittedDate: 'desc' },
      }),
      prisma.dentistApplication.count({ where: where as any }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: applications,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async reviewApplication(
    applicationId: string,
    reviewerId: string,
    data: ReviewApplicationRequest
  ): Promise<any> {
    const application = await prisma.dentistApplication.findUnique({
      where: { id: applicationId },
      include: {
        dentist: true,
      },
    });

    if (!application) {
      throw createAppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    // Update application
    const updated = await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.dentistApplication.update({
        where: { id: applicationId },
        data: {
          status: data.status as any,
          reviewedDate: new Date(),
          reviewedBy: reviewerId,
          notes: data.notes,
        },
        include: {
          dentist: {
            include: {
              user: true,
            },
          },
        },
      });

      // Update dentist status based on application status
      if (data.status === 'APPROVED') {
        await tx.dentistProfile.update({
          where: { id: application.dentistId },
          data: {
            status: 'VERIFIED',
            verificationDate: new Date(),
            verifiedBy: reviewerId,
          },
        });
      } else if (data.status === 'REJECTED') {
        await tx.dentistProfile.update({
          where: { id: application.dentistId },
          data: {
            status: 'INACTIVE',
          },
        });
      } else if (data.status === 'UNDER_REVIEW') {
        await tx.dentistProfile.update({
          where: { id: application.dentistId },
          data: {
            status: 'PENDING_VERIFICATION',
          },
        });
      }

      return updatedApp;
    });

    return updated;
  }
}

export const dentistsService = new DentistsService();
