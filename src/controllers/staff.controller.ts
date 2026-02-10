import { Response } from 'express';
import { z } from 'zod';
import { staffService, CreateStaffRequest, UpdateStaffRequest, AddStaffScheduleRequest, AddPerformanceReviewRequest } from '../services/staff.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  specialization: z.string().optional(),
  hireDate: z.string().datetime('Invalid hire date format'),
  salary: z.number().positive('Salary must be a positive number'),
  qualifications: z.string().optional(),
  certifications: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

const updateStaffSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  specialization: z.string().optional(),
  salary: z.number().positive('Salary must be a positive number').optional(),
  qualifications: z.string().optional(),
  certifications: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
});

const staffScheduleSchema = z.object({
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  dayOfWeek: z.number().min(0).max(6).optional(),
  type: z.enum(['REGULAR', 'OVERTIME', 'LEAVE', 'HOLIDAY']).optional(),
  notes: z.string().optional(),
});

const performanceReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comments: z.string().optional(),
});

export class StaffController {
  createStaff = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createStaffSchema.parse(req.body) as CreateStaffRequest;

    const staffData = await staffService.createStaff(validatedData);

    const response: SuccessResponse<typeof staffData> = {
      success: true,
      message: 'Staff created successfully',
      data: staffData,
    };

    res.status(201).json(response);
  });

  getStaff = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const filters = {
      department: req.query.department as string | undefined,
      status: req.query.status as string | undefined,
      position: req.query.position as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await staffService.getStaff(filters, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getStaffById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const staffData = await staffService.getStaffById(id);

    const response: SuccessResponse<typeof staffData> = {
      success: true,
      data: staffData,
    };

    res.status(200).json(response);
  });

  updateStaff = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateStaffSchema.parse(req.body);

    const updatedStaff = await staffService.updateStaff(id, validatedData);

    const response: SuccessResponse<typeof updatedStaff> = {
      success: true,
      message: 'Staff updated successfully',
      data: updatedStaff,
    };

    res.status(200).json(response);
  });

  deleteStaff = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await staffService.deleteStaff(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Staff deactivated successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  getStaffSchedules = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const schedules = await staffService.getStaffSchedules(id);

    const response: SuccessResponse<typeof schedules> = {
      success: true,
      data: schedules,
    };

    res.status(200).json(response);
  });

  addStaffSchedule = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = staffScheduleSchema.parse(req.body) as AddStaffScheduleRequest;

    const schedule = await staffService.addStaffSchedule(id, validatedData);

    const response: SuccessResponse<typeof schedule> = {
      success: true,
      message: 'Schedule added successfully',
      data: schedule,
    };

    res.status(201).json(response);
  });

  getPerformanceReviews = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const reviews = await staffService.getPerformanceReviews(id);

    const response: SuccessResponse<typeof reviews> = {
      success: true,
      data: reviews,
    };

    res.status(200).json(response);
  });

  addPerformanceReview = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const validatedData = performanceReviewSchema.parse(req.body) as AddPerformanceReviewRequest;

    const review = await staffService.addPerformanceReview(id, req.user.id, validatedData);

    const response: SuccessResponse<typeof review> = {
      success: true,
      message: 'Performance review added successfully',
      data: review,
    };

    res.status(201).json(response);
  });
}

export const staffController = new StaffController();
