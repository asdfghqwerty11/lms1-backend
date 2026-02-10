"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffService = exports.StaffService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class StaffService {
    async createStaff(data) {
        // Check if user with email already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw (0, errorHandler_1.createAppError)('User with this email already exists', 400, 'EMAIL_EXISTS');
        }
        // Check if employee ID is unique
        const existingStaff = await database_1.prisma.staffProfile.findUnique({
            where: { employeeId: data.employeeId },
        });
        if (existingStaff) {
            throw (0, errorHandler_1.createAppError)('Employee ID already exists', 400, 'EMPLOYEE_ID_EXISTS');
        }
        // Create user and staff profile together
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                password: '', // Password will be set during first login/registration
            },
        });
        const staffProfile = await database_1.prisma.staffProfile.create({
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
        const newStaff = await database_1.prisma.user.findUnique({
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
    async getStaffById(staffId) {
        // Check if staffId is a User ID or StaffProfile ID
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
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
            staffProfile = await database_1.prisma.staffProfile.findUnique({
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
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        return staffProfile;
    }
    async getStaff(filters, pagination) {
        const where = {};
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
                { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { email: { contains: filters.search, mode: 'insensitive' } } },
                { employeeId: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [staffProfiles, total] = await Promise.all([
            database_1.prisma.staffProfile.findMany({
                where: where,
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
            database_1.prisma.staffProfile.count({ where: where }),
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
    async updateStaff(staffId, data) {
        // Find staff by user ID or staff profile ID
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
            where: { userId: staffId },
        });
        if (!staffProfile) {
            staffProfile = await database_1.prisma.staffProfile.findUnique({
                where: { id: staffId },
            });
        }
        if (!staffProfile) {
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        const updateData = {};
        if (data.position !== undefined)
            updateData.position = data.position;
        if (data.department !== undefined)
            updateData.department = data.department;
        if (data.specialization !== undefined)
            updateData.specialization = data.specialization;
        if (data.salary !== undefined)
            updateData.salary = data.salary;
        if (data.qualifications !== undefined)
            updateData.qualifications = data.qualifications;
        if (data.certifications !== undefined)
            updateData.certifications = data.certifications;
        if (data.emergencyContact !== undefined)
            updateData.emergencyContact = data.emergencyContact;
        if (data.emergencyPhone !== undefined)
            updateData.emergencyPhone = data.emergencyPhone;
        if (data.status !== undefined)
            updateData.status = data.status;
        const userUpdate = {};
        if (data.firstName !== undefined)
            userUpdate.firstName = data.firstName;
        if (data.lastName !== undefined)
            userUpdate.lastName = data.lastName;
        if (data.phone !== undefined)
            userUpdate.phone = data.phone;
        const updatedStaff = await database_1.prisma.staffProfile.update({
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
            await database_1.prisma.user.update({
                where: { id: staffProfile.userId },
                data: userUpdate,
            });
        }
        return updatedStaff;
    }
    async deleteStaff(staffId) {
        // Find staff by user ID or staff profile ID
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
            where: { userId: staffId },
        });
        if (!staffProfile) {
            staffProfile = await database_1.prisma.staffProfile.findUnique({
                where: { id: staffId },
            });
        }
        if (!staffProfile) {
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        // Deactivate the user instead of deleting
        await database_1.prisma.user.update({
            where: { id: staffProfile.userId },
            data: { isActive: false },
        });
        // Mark staff as inactive
        await database_1.prisma.staffProfile.update({
            where: { id: staffProfile.id },
            data: { status: 'INACTIVE' },
        });
    }
    async getStaffSchedules(staffId) {
        // Find staff profile first
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
            where: { userId: staffId },
        });
        if (!staffProfile) {
            staffProfile = await database_1.prisma.staffProfile.findUnique({
                where: { id: staffId },
            });
        }
        if (!staffProfile) {
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        return database_1.prisma.staffSchedule.findMany({
            where: { staffId: staffProfile.userId },
            orderBy: { startTime: 'asc' },
        });
    }
    async addStaffSchedule(staffId, data) {
        // Find staff profile first
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
            where: { userId: staffId },
        });
        if (!staffProfile) {
            staffProfile = await database_1.prisma.staffProfile.findUnique({
                where: { id: staffId },
            });
        }
        if (!staffProfile) {
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        const newSchedule = await database_1.prisma.staffSchedule.create({
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
    async getPerformanceReviews(staffId) {
        // Find staff profile first
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
            where: { userId: staffId },
        });
        if (!staffProfile) {
            staffProfile = await database_1.prisma.staffProfile.findUnique({
                where: { id: staffId },
            });
        }
        if (!staffProfile) {
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        return database_1.prisma.performanceReview.findMany({
            where: { staffId: staffProfile.id },
            include: {
                reviewer: true,
            },
            orderBy: { reviewDate: 'desc' },
        });
    }
    async addPerformanceReview(staffId, reviewerId, data) {
        // Find staff profile first
        let staffProfile = await database_1.prisma.staffProfile.findUnique({
            where: { userId: staffId },
        });
        if (!staffProfile) {
            staffProfile = await database_1.prisma.staffProfile.findUnique({
                where: { id: staffId },
            });
        }
        if (!staffProfile) {
            throw (0, errorHandler_1.createAppError)('Staff not found', 404, 'STAFF_NOT_FOUND');
        }
        // Verify reviewer exists
        const reviewer = await database_1.prisma.user.findUnique({
            where: { id: reviewerId },
        });
        if (!reviewer) {
            throw (0, errorHandler_1.createAppError)('Reviewer not found', 404, 'REVIEWER_NOT_FOUND');
        }
        if (data.rating < 1 || data.rating > 5) {
            throw (0, errorHandler_1.createAppError)('Rating must be between 1 and 5', 400, 'INVALID_RATING');
        }
        const newReview = await database_1.prisma.performanceReview.create({
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
exports.StaffService = StaffService;
exports.staffService = new StaffService();
//# sourceMappingURL=staff.service.js.map