import { Response } from 'express';
import { z } from 'zod';
import { departmentsService } from '../services/departments.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  managerId: z.string().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  managerId: z.string().optional(),
});

const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'DECOMMISSIONED']).optional(),
  purchaseDate: z.string().datetime().optional(),
  maintenanceDate: z.string().datetime().optional(),
});

const updateEquipmentSchema = z.object({
  name: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'DECOMMISSIONED']).optional(),
  maintenanceDate: z.string().datetime().optional(),
});

export class DepartmentsController {
  createDepartment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createDepartmentSchema.parse(req.body);

    const department = await departmentsService.createDepartment(validatedData);

    const response: SuccessResponse<typeof department> = {
      success: true,
      message: 'Department created successfully',
      data: department,
    };

    res.status(201).json(response);
  });

  getDepartments = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const result = await departmentsService.getDepartments(pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getDepartmentById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const department = await departmentsService.getDepartmentById(id);

    const response: SuccessResponse<typeof department> = {
      success: true,
      data: department,
    };

    res.status(200).json(response);
  });

  updateDepartment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateDepartmentSchema.parse(req.body);

    const department = await departmentsService.updateDepartment(id, validatedData);

    const response: SuccessResponse<typeof department> = {
      success: true,
      message: 'Department updated successfully',
      data: department,
    };

    res.status(200).json(response);
  });

  deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await departmentsService.deleteDepartment(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Department deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  // Equipment management
  addEquipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = createEquipmentSchema.parse(req.body);

    const equipment = await departmentsService.addEquipment(id, validatedData);

    const response: SuccessResponse<typeof equipment> = {
      success: true,
      message: 'Equipment added successfully',
      data: equipment,
    };

    res.status(201).json(response);
  });

  getDepartmentEquipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const equipment = await departmentsService.getDepartmentEquipment(id);

    const response: SuccessResponse<typeof equipment> = {
      success: true,
      data: equipment,
    };

    res.status(200).json(response);
  });

  getEquipmentById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { equipmentId } = req.params;

    const equipment = await departmentsService.getEquipmentById(equipmentId);

    const response: SuccessResponse<typeof equipment> = {
      success: true,
      data: equipment,
    };

    res.status(200).json(response);
  });

  updateEquipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { equipmentId } = req.params;
    const validatedData = updateEquipmentSchema.parse(req.body);

    const equipment = await departmentsService.updateEquipment(equipmentId, validatedData);

    const response: SuccessResponse<typeof equipment> = {
      success: true,
      message: 'Equipment updated successfully',
      data: equipment,
    };

    res.status(200).json(response);
  });

  deleteEquipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { equipmentId } = req.params;

    await departmentsService.deleteEquipment(equipmentId);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Equipment deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });
}

export const departmentsController = new DepartmentsController();
