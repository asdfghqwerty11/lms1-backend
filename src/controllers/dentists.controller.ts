import { Response } from 'express';
import { z } from 'zod';
import { dentistsService } from '../services/dentists.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createDentistSchema = z.object({
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  licenseNumber: z.string().min(1, 'License number is required'),
  specialization: z.string().optional(),
  clinic: z.string().optional(),
  clinicPhone: z.string().optional(),
  clinicEmail: z.string().email().optional().or(z.literal('')),
});

const updateDentistSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  clinic: z.string().optional(),
  clinicPhone: z.string().optional(),
  clinicEmail: z.string().email().optional().or(z.literal('')),
});

const reviewApplicationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  notes: z.string().optional(),
});

export class DentistsController {
  createDentist = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createDentistSchema.parse(req.body);

    const dentist = await dentistsService.createDentist(validatedData);

    const response: SuccessResponse<typeof dentist> = {
      success: true,
      message: 'Dentist profile created successfully',
      data: dentist,
    };

    res.status(201).json(response);
  });

  getDentists = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const filters = {
      specialization: req.query.specialization as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await dentistsService.getDentists(filters, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getDentistById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const dentist = await dentistsService.getDentistById(id);

    const response: SuccessResponse<typeof dentist> = {
      success: true,
      data: dentist,
    };

    res.status(200).json(response);
  });

  updateDentist = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateDentistSchema.parse(req.body);

    const updatedDentist = await dentistsService.updateDentist(id, validatedData);

    const response: SuccessResponse<typeof updatedDentist> = {
      success: true,
      message: 'Dentist profile updated successfully',
      data: updatedDentist,
    };

    res.status(200).json(response);
  });

  deleteDentist = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await dentistsService.deleteDentist(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Dentist deactivated successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  getDentistApplications = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const pagination = getPaginationParams(String(page), String(limit));

      const filters = {
        status: req.query.status as string | undefined,
        dentistId: req.query.dentistId as string | undefined,
      };

      const result = await dentistsService.getDentistApplications(filters, pagination);

      const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    }
  );

  reviewApplication = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { applicationId } = req.params;
    const validatedData = reviewApplicationSchema.parse(req.body);

    const updated = await dentistsService.reviewApplication(
      applicationId,
      req.user.id,
      validatedData
    );

    const response: SuccessResponse<typeof updated> = {
      success: true,
      message: 'Application reviewed successfully',
      data: updated,
    };

    res.status(200).json(response);
  });
}

export const dentistsController = new DentistsController();
