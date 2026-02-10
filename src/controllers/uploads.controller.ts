import { Response } from 'express';
import { z } from 'zod';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse } from '../types';
import { getSignedDownloadUrl, deleteFileFromStorage } from '../config/storage';
import { prisma } from '../config/database';

// Validation schemas
const downloadFileSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  expiresIn: z.number().int().positive().optional().default(3600), // Default 1 hour
});

const deleteFileSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
});

export class UploadsController {
  /**
   * Generate a signed download URL for a file
   * Allows temporary access to private Supabase storage files
   */
  getDownloadUrl = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { fileId, expiresIn } = downloadFileSchema.parse(req.query);

    // Get file from database
    const file = await prisma.caseFile.findUnique({
      where: { id: fileId },
      include: {
        case: true,
      },
    });

    if (!file) {
      throw createAppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    try {
      // Generate signed URL
      const signedUrl = await getSignedDownloadUrl(file.fileUrl, expiresIn as number);

      const response: SuccessResponse<{ url: string; expiresIn: number }> = {
        success: true,
        data: {
          url: signedUrl,
          expiresIn: expiresIn as number,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      throw createAppError(
        `Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'URL_GENERATION_FAILED'
      );
    }
  });

  /**
   * Get file metadata with download URL
   */
  getFileMetadata = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { fileId } = req.params;

    // Get file from database
    const file = await prisma.caseFile.findUnique({
      where: { id: fileId },
      include: {
        case: true,
      },
    });

    if (!file) {
      throw createAppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    try {
      // Generate signed URL
      const signedUrl = await getSignedDownloadUrl(file.fileUrl, 3600);

      const response: SuccessResponse<any> = {
        success: true,
        data: {
          ...file,
          signedUrl,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      throw createAppError(
        `Failed to fetch file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'METADATA_FETCH_FAILED'
      );
    }
  });

  /**
   * Delete a file by ID
   */
  deleteFile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { fileId } = downloadFileSchema.parse(req.params);

    // Get file from database
    const file = await prisma.caseFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw createAppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    try {
      // Delete from Supabase Storage
      await deleteFileFromStorage(file.fileUrl);

      // Delete from database
      await prisma.caseFile.delete({
        where: { id: fileId },
      });

      const response: SuccessResponse<null> = {
        success: true,
        message: 'File deleted successfully',
        data: null as any,
      };

      res.status(200).json(response);
    } catch (error) {
      throw createAppError(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'FILE_DELETE_FAILED'
      );
    }
  });

  /**
   * Bulk delete files
   */
  deleteMultipleFiles = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw createAppError('No file IDs provided', 400, 'MISSING_FILE_IDS');
    }

    // Get files from database
    const files = await prisma.caseFile.findMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    });

    if (files.length === 0) {
      throw createAppError('No files found', 404, 'FILES_NOT_FOUND');
    }

    const deleted: string[] = [];
    const failed: Array<{ fileId: string; error: string }> = [];

    // Delete each file
    for (const file of files) {
      try {
        // Delete from Supabase Storage
        await deleteFileFromStorage(file.fileUrl);

        // Delete from database
        await prisma.caseFile.delete({
          where: { id: file.id },
        });

        deleted.push(file.id);
      } catch (error) {
        failed.push({
          fileId: file.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const response: any = {
      success: failed.length === 0,
      message:
        failed.length === 0
          ? 'All files deleted successfully'
          : `${deleted.length} files deleted, ${failed.length} failed`,
      data: {
        deleted,
        failed,
      },
    };

    res.status(failed.length === 0 ? 200 : 207).json(response);
  });

  /**
   * Get case file statistics
   */
  getCaseFileStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params;

    // Get all files for the case
    const files = await prisma.caseFile.findMany({
      where: { caseId },
    });

    if (files.length === 0) {
      const response: SuccessResponse<any> = {
        success: true,
        data: {
          totalFiles: 0,
          totalSize: 0,
          averageFileSize: 0,
          fileTypes: {},
        },
      };

      res.status(200).json(response);
      return;
    }

    // Calculate statistics
    const totalSize = files.reduce((sum, file) => sum + Number(file.fileSize), 0);
    const averageFileSize = totalSize / files.length;

    // Group by file type
    const fileTypes: Record<string, number> = {};
    files.forEach((file) => {
      fileTypes[file.fileType] = (fileTypes[file.fileType] || 0) + 1;
    });

    const response: SuccessResponse<any> = {
      success: true,
      data: {
        totalFiles: files.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        averageFileSize,
        averageFileSizeMB: (averageFileSize / (1024 * 1024)).toFixed(2),
        fileTypes,
      },
    };

    res.status(200).json(response);
  });
}

export const uploadsController = new UploadsController();
