"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dentistsService = exports.DentistsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class DentistsService {
    async createDentist(data) {
        // Check if user with email already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw (0, errorHandler_1.createAppError)('User with this email already exists', 400, 'USER_EXISTS');
        }
        // Check if license number is already used
        const existingLicense = await database_1.prisma.dentistProfile.findUnique({
            where: { licenseNumber: data.licenseNumber },
        });
        if (existingLicense) {
            throw (0, errorHandler_1.createAppError)('License number already registered', 400, 'LICENSE_EXISTS');
        }
        // Create user and dentist profile together
        const user = await database_1.prisma.user.create({
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
        const dentistProfile = await database_1.prisma.dentistProfile.create({
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
        await database_1.prisma.dentistApplication.create({
            data: {
                dentistId: dentistProfile.id,
                status: 'SUBMITTED',
            },
        });
        return dentistProfile;
    }
    async getDentistById(dentistId) {
        const dentist = await database_1.prisma.dentistProfile.findUnique({
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
            throw (0, errorHandler_1.createAppError)('Dentist not found', 404, 'DENTIST_NOT_FOUND');
        }
        return dentist;
    }
    async getDentists(filters, pagination) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.specialization) {
            where.specialization = {
                contains: filters.specialization,
                mode: 'insensitive',
            };
        }
        if (filters.search) {
            where.OR = [
                { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { email: { contains: filters.search, mode: 'insensitive' } } },
                { clinic: { contains: filters.search, mode: 'insensitive' } },
                { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [dentists, total] = await Promise.all([
            database_1.prisma.dentistProfile.findMany({
                where: where,
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
            database_1.prisma.dentistProfile.count({ where: where }),
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
    async updateDentist(dentistId, data) {
        const dentist = await database_1.prisma.dentistProfile.findUnique({
            where: { id: dentistId },
        });
        if (!dentist) {
            throw (0, errorHandler_1.createAppError)('Dentist not found', 404, 'DENTIST_NOT_FOUND');
        }
        const updateData = {};
        if (data.specialization !== undefined)
            updateData.specialization = data.specialization;
        if (data.clinic !== undefined)
            updateData.clinic = data.clinic;
        if (data.clinicPhone !== undefined)
            updateData.clinicPhone = data.clinicPhone;
        if (data.clinicEmail !== undefined)
            updateData.clinicEmail = data.clinicEmail;
        // Update user fields if provided
        const userUpdateData = {};
        if (data.firstName !== undefined)
            userUpdateData.firstName = data.firstName;
        if (data.lastName !== undefined)
            userUpdateData.lastName = data.lastName;
        if (data.phone !== undefined)
            userUpdateData.phone = data.phone;
        // Update in transaction
        const updated = await database_1.prisma.$transaction(async (tx) => {
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
    async deleteDentist(dentistId) {
        const dentist = await database_1.prisma.dentistProfile.findUnique({
            where: { id: dentistId },
        });
        if (!dentist) {
            throw (0, errorHandler_1.createAppError)('Dentist not found', 404, 'DENTIST_NOT_FOUND');
        }
        // Deactivate user instead of deleting
        await database_1.prisma.user.update({
            where: { id: dentist.userId },
            data: { isActive: false },
        });
        // Update dentist status to INACTIVE
        await database_1.prisma.dentistProfile.update({
            where: { id: dentistId },
            data: { status: 'INACTIVE' },
        });
    }
    async getDentistApplications(filters, pagination) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.dentistId) {
            where.dentistId = filters.dentistId;
        }
        const [applications, total] = await Promise.all([
            database_1.prisma.dentistApplication.findMany({
                where: where,
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
            database_1.prisma.dentistApplication.count({ where: where }),
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
    async reviewApplication(applicationId, reviewerId, data) {
        const application = await database_1.prisma.dentistApplication.findUnique({
            where: { id: applicationId },
            include: {
                dentist: true,
            },
        });
        if (!application) {
            throw (0, errorHandler_1.createAppError)('Application not found', 404, 'APPLICATION_NOT_FOUND');
        }
        // Update application
        const updated = await database_1.prisma.$transaction(async (tx) => {
            const updatedApp = await tx.dentistApplication.update({
                where: { id: applicationId },
                data: {
                    status: data.status,
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
            }
            else if (data.status === 'REJECTED') {
                await tx.dentistProfile.update({
                    where: { id: application.dentistId },
                    data: {
                        status: 'INACTIVE',
                    },
                });
            }
            else if (data.status === 'UNDER_REVIEW') {
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
exports.DentistsService = DentistsService;
exports.dentistsService = new DentistsService();
//# sourceMappingURL=dentists.service.js.map