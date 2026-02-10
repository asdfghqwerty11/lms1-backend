import { Response } from 'express';
import { z } from 'zod';
import { usersService } from '../services/users.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
});

const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

const updateRoleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export class UsersController {
  // User routes
  createUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createUserSchema.parse(req.body);

    const user = await usersService.createUser(validatedData);

    const response: SuccessResponse<typeof user> = {
      success: true,
      message: 'User created successfully',
      data: user,
    };

    res.status(201).json(response);
  });

  getUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const result = await usersService.getUsers(pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await usersService.getUserById(id);

    const response: SuccessResponse<typeof user> = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  searchUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!searchTerm) {
      throw createAppError('Search term is required', 400, 'MISSING_SEARCH_TERM');
    }

    const pagination = getPaginationParams(String(page), String(limit));
    const result = await usersService.searchUsers(searchTerm, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    const user = await usersService.updateUser(id, validatedData);

    const response: SuccessResponse<typeof user> = {
      success: true,
      message: 'User updated successfully',
      data: user,
    };

    res.status(200).json(response);
  });

  deactivateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await usersService.deactivateUser(id);

    const response: SuccessResponse<typeof user> = {
      success: true,
      message: 'User deactivated successfully',
      data: user,
    };

    res.status(200).json(response);
  });

  // Role routes
  createRole = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createRoleSchema.parse(req.body);

    const role = await usersService.createRole(validatedData);

    const response: SuccessResponse<typeof role> = {
      success: true,
      message: 'Role created successfully',
      data: role,
    };

    res.status(201).json(response);
  });

  getRoles = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const roles = await usersService.getRoles();

    const response: SuccessResponse<typeof roles> = {
      success: true,
      data: roles,
    };

    res.status(200).json(response);
  });

  getRoleById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const role = await usersService.getRoleById(id);

    const response: SuccessResponse<typeof role> = {
      success: true,
      data: role,
    };

    res.status(200).json(response);
  });

  updateRole = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateRoleSchema.parse(req.body);

    const role = await usersService.updateRole(id, validatedData);

    const response: SuccessResponse<typeof role> = {
      success: true,
      message: 'Role updated successfully',
      data: role,
    };

    res.status(200).json(response);
  });

  deleteRole = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await usersService.deleteRole(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Role deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  // Permission routes
  getPermissions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const permissions = await usersService.getPermissions();

    const response: SuccessResponse<typeof permissions> = {
      success: true,
      data: permissions,
    };

    res.status(200).json(response);
  });
}

export const usersController = new UsersController();
