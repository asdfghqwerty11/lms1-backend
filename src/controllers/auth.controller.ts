import { Response, Request } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, TokenResponse } from '../types';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = registerSchema.parse(req.body);

    const result = await authService.register(validatedData);

    const response: SuccessResponse<TokenResponse> = {
      success: true,
      message: 'Registration successful',
      data: result,
    };

    res.status(201).json(response);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(validatedData);

    const response: SuccessResponse<TokenResponse> = {
      success: true,
      message: 'Login successful',
      data: result,
    };

    res.status(200).json(response);
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    await authService.logout(req.user.id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Logout successful',
      data: null as any,
    };

    res.status(200).json(response);
  });

  getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const user = await authService.getCurrentUser(req.user.id);

    if (!user) {
      throw createAppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const response: SuccessResponse<typeof user> = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = refreshTokenSchema.parse(req.body);

    const result = await authService.refreshToken(validatedData.refreshToken);

    const response: SuccessResponse<TokenResponse> = {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };

    res.status(200).json(response);
  });

  updatePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const validatedData = updatePasswordSchema.parse(req.body);

    await authService.updatePassword(req.user.id, validatedData.oldPassword, validatedData.newPassword);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Password updated successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = forgotPasswordSchema.parse(req.body);

    const message = await authService.forgotPassword(validatedData.email);

    const response: SuccessResponse<null> = {
      success: true,
      message,
      data: null as any,
    };

    res.status(200).json(response);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = resetPasswordSchema.parse(req.body);

    await authService.resetPasswordWithToken(validatedData.token, validatedData.newPassword);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Password reset successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });
}

export const authController = new AuthController();
