"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsController = exports.UploadsController = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const storage_1 = require("../config/storage");
const database_1 = require("../config/database");
// Validation schemas
const downloadFileSchema = zod_1.z.object({
    fileId: zod_1.z.string().min(1, 'File ID is required'),
    expiresIn: zod_1.z.number().int().positive().optional().default(3600), // Default 1 hour
});
const deleteFileSchema = zod_1.z.object({
    fileId: zod_1.z.string().min(1, 'File ID is required'),
});
class UploadsController {
    constructor() {
        /**
         * Generate a signed download URL for a file
         * Allows temporary access to private Supabase storage files
         */
        this.getDownloadUrl = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { fileId, expiresIn } = downloadFileSchema.parse(req.query);
            // Get file from database
            const file = await database_1.prisma.caseFile.findUnique({
                where: { id: fileId },
                include: {
                    case: true,
                },
            });
            if (!file) {
                throw (0, errorHandler_1.createAppError)('File not found', 404, 'FILE_NOT_FOUND');
            }
            try {
                // Generate signed URL
                const signedUrl = await (0, storage_1.getSignedDownloadUrl)(file.fileUrl, expiresIn);
                const response = {
                    success: true,
                    data: {
                        url: signedUrl,
                        expiresIn: expiresIn,
                    },
                };
                res.status(200).json(response);
            }
            catch (error) {
                throw (0, errorHandler_1.createAppError)(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, 'URL_GENERATION_FAILED');
            }
        });
        /**
         * Get file metadata with download URL
         */
        this.getFileMetadata = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { fileId } = req.params;
            // Get file from database
            const file = await database_1.prisma.caseFile.findUnique({
                where: { id: fileId },
                include: {
                    case: true,
                },
            });
            if (!file) {
                throw (0, errorHandler_1.createAppError)('File not found', 404, 'FILE_NOT_FOUND');
            }
            try {
                // Generate signed URL
                const signedUrl = await (0, storage_1.getSignedDownloadUrl)(file.fileUrl, 3600);
                const response = {
                    success: true,
                    data: {
                        ...file,
                        signedUrl,
                    },
                };
                res.status(200).json(response);
            }
            catch (error) {
                throw (0, errorHandler_1.createAppError)(`Failed to fetch file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, 'METADATA_FETCH_FAILED');
            }
        });
        /**
         * Delete a file by ID
         */
        this.deleteFile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { fileId } = downloadFileSchema.parse(req.params);
            // Get file from database
            const file = await database_1.prisma.caseFile.findUnique({
                where: { id: fileId },
            });
            if (!file) {
                throw (0, errorHandler_1.createAppError)('File not found', 404, 'FILE_NOT_FOUND');
            }
            try {
                // Delete from Supabase Storage
                await (0, storage_1.deleteFileFromStorage)(file.fileUrl);
                // Delete from database
                await database_1.prisma.caseFile.delete({
                    where: { id: fileId },
                });
                const response = {
                    success: true,
                    message: 'File deleted successfully',
                    data: null,
                };
                res.status(200).json(response);
            }
            catch (error) {
                throw (0, errorHandler_1.createAppError)(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, 'FILE_DELETE_FAILED');
            }
        });
        /**
         * Bulk delete files
         */
        this.deleteMultipleFiles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { fileIds } = req.body;
            if (!Array.isArray(fileIds) || fileIds.length === 0) {
                throw (0, errorHandler_1.createAppError)('No file IDs provided', 400, 'MISSING_FILE_IDS');
            }
            // Get files from database
            const files = await database_1.prisma.caseFile.findMany({
                where: {
                    id: {
                        in: fileIds,
                    },
                },
            });
            if (files.length === 0) {
                throw (0, errorHandler_1.createAppError)('No files found', 404, 'FILES_NOT_FOUND');
            }
            const deleted = [];
            const failed = [];
            // Delete each file
            for (const file of files) {
                try {
                    // Delete from Supabase Storage
                    await (0, storage_1.deleteFileFromStorage)(file.fileUrl);
                    // Delete from database
                    await database_1.prisma.caseFile.delete({
                        where: { id: file.id },
                    });
                    deleted.push(file.id);
                }
                catch (error) {
                    failed.push({
                        fileId: file.id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            const response = {
                success: failed.length === 0,
                message: failed.length === 0
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
        this.getCaseFileStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { caseId } = req.params;
            // Get all files for the case
            const files = await database_1.prisma.caseFile.findMany({
                where: { caseId },
            });
            if (files.length === 0) {
                const response = {
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
            const fileTypes = {};
            files.forEach((file) => {
                fileTypes[file.fileType] = (fileTypes[file.fileType] || 0) + 1;
            });
            const response = {
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
}
exports.UploadsController = UploadsController;
exports.uploadsController = new UploadsController();
//# sourceMappingURL=uploads.controller.js.map