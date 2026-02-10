import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';

export class SettingsService {
  async getSettingByKey(key: string): Promise<any> {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw createAppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    return setting;
  }

  async getAllSettings(): Promise<any[]> {
    return prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSetting(
    key: string,
    data: {
      value: string;
    }
  ): Promise<any> {
    // Get existing setting to verify it exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      throw createAppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    const updated = await prisma.setting.update({
      where: { key },
      data: {
        value: data.value,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async createSetting(data: {
    key: string;
    value: string;
    type?: string;
  }): Promise<any> {
    // Check if key already exists
    const existing = await prisma.setting.findUnique({
      where: { key: data.key },
    });

    if (existing) {
      throw createAppError('Setting key already exists', 400, 'SETTING_KEY_EXISTS');
    }

    const setting = await prisma.setting.create({
      data: {
        key: data.key,
        value: data.value,
        type: (data.type as any) || 'STRING',
      },
    });

    return setting;
  }

  async bulkUpdateSettings(
    settings: Array<{
      key: string;
      value: string;
    }>
  ): Promise<any[]> {
    const updated = await Promise.all(
      settings.map((s) =>
        prisma.setting.update({
          where: { key: s.key },
          data: {
            value: s.value,
            updatedAt: new Date(),
          },
        }).catch(() => {
          throw createAppError(`Setting '${s.key}' not found`, 404, 'SETTING_NOT_FOUND');
        })
      )
    );

    return updated;
  }

  async deleteSetting(key: string): Promise<void> {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw createAppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    await prisma.setting.delete({
      where: { key },
    });
  }
}

export const settingsService = new SettingsService();
