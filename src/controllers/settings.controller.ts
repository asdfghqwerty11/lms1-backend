import { Response } from 'express';
import { z } from 'zod';
import { settingsService } from '../services/settings.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse } from '../types';

// Validation schemas
const createSettingSchema = z.object({
  key: z.string().min(1, 'Setting key is required'),
  value: z.string().min(1, 'Setting value is required'),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON']).optional(),
});

const updateSettingSchema = z.object({
  value: z.string().min(1, 'Setting value is required'),
});

const bulkUpdateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
});

export class SettingsController {
  getSetting = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { key } = req.params;

    const setting = await settingsService.getSettingByKey(key);

    const response: SuccessResponse<typeof setting> = {
      success: true,
      data: setting,
    };

    res.status(200).json(response);
  });

  getAllSettings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const settings = await settingsService.getAllSettings();

    const response: SuccessResponse<typeof settings> = {
      success: true,
      data: settings,
    };

    res.status(200).json(response);
  });

  createSetting = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createSettingSchema.parse(req.body);

    const setting = await settingsService.createSetting(validatedData);

    const response: SuccessResponse<typeof setting> = {
      success: true,
      message: 'Setting created successfully',
      data: setting,
    };

    res.status(201).json(response);
  });

  updateSetting = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { key } = req.params;
    const validatedData = updateSettingSchema.parse(req.body);

    const setting = await settingsService.updateSetting(key, validatedData);

    const response: SuccessResponse<typeof setting> = {
      success: true,
      message: 'Setting updated successfully',
      data: setting,
    };

    res.status(200).json(response);
  });

  bulkUpdateSettings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = bulkUpdateSettingsSchema.parse(req.body);

    const settings = await settingsService.bulkUpdateSettings(
      validatedData.settings
    );

    const response: SuccessResponse<typeof settings> = {
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    };

    res.status(200).json(response);
  });

  deleteSetting = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { key } = req.params;

    await settingsService.deleteSetting(key);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Setting deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });
}

export const settingsController = new SettingsController();
