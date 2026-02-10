"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesService = exports.CasesService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const storage_1 = require("../config/storage");
class CasesService {
    async createCase(data, createdById) {
        // Verify dentist exists
        const dentist = await database_1.prisma.dentistProfile.findUnique({
            where: { id: data.dentistId },
        });
        if (!dentist) {
            throw (0, errorHandler_1.createAppError)('Dentist not found', 404, 'DENTIST_NOT_FOUND');
        }
        const caseNumber = (0, helpers_1.generateCaseNumber)();
        const newCase = await database_1.prisma.case.create({
            data: {
                caseNumber,
                dentistId: data.dentistId,
                patientName: data.patientName,
                patientEmail: data.patientEmail,
                patientPhone: data.patientPhone,
                patientDOB: data.patientDOB ? new Date(data.patientDOB) : undefined,
                description: data.description,
                specifications: data.specifications,
                priority: data.priority || 'MEDIUM',
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                createdById,
                departmentId: data.departmentId,
            },
            include: {
                dentist: true,
                createdBy: true,
                assignedTo: true,
                department: true,
            },
        });
        return newCase;
    }
    async getCaseById(caseId) {
        const caseData = await database_1.prisma.case.findUnique({
            where: { id: caseId },
            include: {
                dentist: true,
                createdBy: true,
                assignedTo: true,
                department: true,
                files: true,
                notes_rel: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' },
                },
                workflowStages: {
                    orderBy: { sequence: 'asc' },
                },
                appointments: {
                    orderBy: { scheduledDate: 'desc' },
                },
            },
        });
        if (!caseData) {
            throw (0, errorHandler_1.createAppError)('Case not found', 404, 'CASE_NOT_FOUND');
        }
        return caseData;
    }
    async getCases(filters, pagination) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.dentistId) {
            where.dentistId = filters.dentistId;
        }
        if (filters.assignedToId) {
            where.assignedToId = filters.assignedToId;
        }
        if (filters.departmentId) {
            where.departmentId = filters.departmentId;
        }
        if (filters.search) {
            where.OR = [
                { patientName: { contains: filters.search, mode: 'insensitive' } },
                { caseNumber: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt.lte = new Date(filters.endDate);
            }
        }
        const [cases, total] = await Promise.all([
            database_1.prisma.case.findMany({
                where: where,
                include: {
                    dentist: true,
                    createdBy: true,
                    assignedTo: true,
                    department: true,
                },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.case.count({ where: where }),
        ]);
        const pages = Math.ceil(total / pagination.limit);
        return {
            data: cases,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                pages,
            },
        };
    }
    async updateCase(caseId, data) {
        const updateData = {};
        if (data.patientName !== undefined)
            updateData.patientName = data.patientName;
        if (data.patientEmail !== undefined)
            updateData.patientEmail = data.patientEmail;
        if (data.patientPhone !== undefined)
            updateData.patientPhone = data.patientPhone;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.specifications !== undefined)
            updateData.specifications = data.specifications;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === 'COMPLETED') {
                updateData.completedDate = new Date();
            }
        }
        if (data.dueDate !== undefined)
            updateData.dueDate = new Date(data.dueDate);
        if (data.assignedToId !== undefined)
            updateData.assignedToId = data.assignedToId;
        if (data.departmentId !== undefined)
            updateData.departmentId = data.departmentId;
        const updatedCase = await database_1.prisma.case.update({
            where: { id: caseId },
            data: updateData,
            include: {
                dentist: true,
                createdBy: true,
                assignedTo: true,
                department: true,
            },
        });
        return updatedCase;
    }
    async deleteCase(caseId) {
        await database_1.prisma.case.delete({
            where: { id: caseId },
        });
    }
    async addCaseFile(caseId, file, userId) {
        // Verify case exists
        const caseExists = await database_1.prisma.case.findUnique({
            where: { id: caseId },
        });
        if (!caseExists) {
            throw (0, errorHandler_1.createAppError)('Case not found', 404, 'CASE_NOT_FOUND');
        }
        try {
            // Upload file to Supabase Storage
            const uploadResult = await (0, storage_1.uploadFileToStorage)(file, caseId, userId);
            // Store file metadata in database
            const newFile = await database_1.prisma.caseFile.create({
                data: {
                    caseId,
                    filename: file.originalname,
                    fileSize: BigInt(file.size),
                    fileType: file.mimetype,
                    fileUrl: uploadResult.path, // Store the Supabase path
                },
            });
            // Return file metadata with signed URL
            const signedUrl = await (0, storage_1.getSignedDownloadUrl)(uploadResult.path, 3600); // 1 hour expiry
            return {
                ...newFile,
                signedUrl,
                attachmentType: uploadResult.attachmentType,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createAppError)(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, 'FILE_UPLOAD_FAILED');
        }
    }
    async getCaseFiles(caseId) {
        const files = await database_1.prisma.caseFile.findMany({
            where: { caseId },
            orderBy: { uploadedAt: 'desc' },
        });
        // Add signed URLs to each file
        const filesWithUrls = await Promise.all(files.map(async (file) => {
            try {
                const signedUrl = await (0, storage_1.getSignedDownloadUrl)(file.fileUrl, 3600); // 1 hour expiry
                return {
                    ...file,
                    signedUrl,
                    attachmentType: (0, storage_1.getAttachmentTypeFromMime)(file.fileType),
                };
            }
            catch (error) {
                // If signed URL generation fails, return file without signed URL
                console.error(`Failed to generate signed URL for file ${file.id}:`, error);
                return {
                    ...file,
                    signedUrl: null,
                    attachmentType: (0, storage_1.getAttachmentTypeFromMime)(file.fileType),
                };
            }
        }));
        return filesWithUrls;
    }
    async deleteCaseFile(fileId) {
        // Get file metadata to find the storage path
        const file = await database_1.prisma.caseFile.findUnique({
            where: { id: fileId },
        });
        if (!file) {
            throw (0, errorHandler_1.createAppError)('File not found', 404, 'FILE_NOT_FOUND');
        }
        try {
            // Delete from Supabase Storage
            await (0, storage_1.deleteFileFromStorage)(file.fileUrl);
        }
        catch (error) {
            console.error('Failed to delete file from storage:', error);
            // Continue to delete database record even if storage deletion fails
        }
        // Delete from database
        await database_1.prisma.caseFile.delete({
            where: { id: fileId },
        });
    }
    async addCaseNote(caseId, userId, content, isInternal = false) {
        const newNote = await database_1.prisma.caseNote.create({
            data: {
                caseId,
                userId,
                content,
                isInternal,
            },
            include: {
                user: true,
            },
        });
        return newNote;
    }
    async getCaseNotes(caseId, includeInternal = false) {
        const where = { caseId };
        if (!includeInternal) {
            where.isInternal = false;
        }
        return database_1.prisma.caseNote.findMany({
            where,
            include: {
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCaseWorkflow(caseId) {
        return database_1.prisma.workflowStage.findMany({
            where: { caseId },
            orderBy: { sequence: 'asc' },
        });
    }
    async searchCases(searchTerm, pagination) {
        const where = {
            OR: [
                { patientName: { contains: searchTerm, mode: 'insensitive' } },
                { caseNumber: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
        };
        const [cases, total] = await Promise.all([
            database_1.prisma.case.findMany({
                where: where,
                include: {
                    dentist: true,
                    createdBy: true,
                    assignedTo: true,
                },
                skip: pagination.skip,
                take: pagination.limit,
            }),
            database_1.prisma.case.count({ where: where }),
        ]);
        return {
            data: cases,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                pages: Math.ceil(total / pagination.limit),
            },
        };
    }
}
exports.CasesService = CasesService;
exports.casesService = new CasesService();
//# sourceMappingURL=cases.service.js.map