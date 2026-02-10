"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffController = exports.StaffController = void 0;
const zod_1 = require("zod");
const staff_service_1 = require("../services/staff.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createStaffSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phone: zod_1.z.string().optional(),
    employeeId: zod_1.z.string().min(1, 'Employee ID is required'),
    position: zod_1.z.string().min(1, 'Position is required'),
    department: zod_1.z.string().min(1, 'Department is required'),
    specialization: zod_1.z.string().optional(),
    hireDate: zod_1.z.string().datetime('Invalid hire date format'),
    salary: zod_1.z.number().positive('Salary must be a positive number'),
    qualifications: zod_1.z.string().optional(),
    certifications: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
    emergencyPhone: zod_1.z.string().optional(),
});
const updateStaffSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    position: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    salary: zod_1.z.number().positive('Salary must be a positive number').optional(),
    qualifications: zod_1.z.string().optional(),
    certifications: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
    emergencyPhone: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
});
const staffScheduleSchema = zod_1.z.object({
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    endTime: zod_1.z.string().datetime('Invalid end time format'),
    dayOfWeek: zod_1.z.number().min(0).max(6).optional(),
    type: zod_1.z.enum(['REGULAR', 'OVERTIME', 'LEAVE', 'HOLIDAY']).optional(),
    notes: zod_1.z.string().optional(),
});
const performanceReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comments: zod_1.z.string().optional(),
});
class StaffController {
    constructor() {
        this.createStaff = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createStaffSchema.parse(req.body);
            const staffData = await staff_service_1.staffService.createStaff(validatedData);
            const response = {
                success: true,
                message: 'Staff created successfully',
                data: staffData,
            };
            res.status(201).json(response);
        });
        this.getStaff = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const filters = {
                department: req.query.department,
                status: req.query.status,
                position: req.query.position,
                search: req.query.search,
            };
            const result = await staff_service_1.staffService.getStaff(filters, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getStaffById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const staffData = await staff_service_1.staffService.getStaffById(id);
            const response = {
                success: true,
                data: staffData,
            };
            res.status(200).json(response);
        });
        this.updateStaff = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateStaffSchema.parse(req.body);
            const updatedStaff = await staff_service_1.staffService.updateStaff(id, validatedData);
            const response = {
                success: true,
                message: 'Staff updated successfully',
                data: updatedStaff,
            };
            res.status(200).json(response);
        });
        this.deleteStaff = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await staff_service_1.staffService.deleteStaff(id);
            const response = {
                success: true,
                message: 'Staff deactivated successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.getStaffSchedules = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const schedules = await staff_service_1.staffService.getStaffSchedules(id);
            const response = {
                success: true,
                data: schedules,
            };
            res.status(200).json(response);
        });
        this.addStaffSchedule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = staffScheduleSchema.parse(req.body);
            const schedule = await staff_service_1.staffService.addStaffSchedule(id, validatedData);
            const response = {
                success: true,
                message: 'Schedule added successfully',
                data: schedule,
            };
            res.status(201).json(response);
        });
        this.getPerformanceReviews = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const reviews = await staff_service_1.staffService.getPerformanceReviews(id);
            const response = {
                success: true,
                data: reviews,
            };
            res.status(200).json(response);
        });
        this.addPerformanceReview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { id } = req.params;
            const validatedData = performanceReviewSchema.parse(req.body);
            const review = await staff_service_1.staffService.addPerformanceReview(id, req.user.id, validatedData);
            const response = {
                success: true,
                message: 'Performance review added successfully',
                data: review,
            };
            res.status(201).json(response);
        });
    }
}
exports.StaffController = StaffController;
exports.staffController = new StaffController();
//# sourceMappingURL=staff.controller.js.map