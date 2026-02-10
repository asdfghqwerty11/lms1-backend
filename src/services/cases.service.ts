import { prisma } from '../config/database';
import { createAppError, asyncHandler } from '../middleware/errorHandler';
import { generateCaseNumber } from '../utils/helpers';
import {
  CreateCaseRequest,
  UpdateCaseRequest,
  CaseFilterParams,
  PaginationParams,
  PaginatedResponse,
} from '../types';
import {
  uploadFileToStorage,
  getSignedDownloadUrl,
  deleteFileFromStorage,
  listCaseFiles,
  AttachmentType,
  getAttachmentTypeFromMime,
} from '../config/storage';

export class CasesService {
  async createCase(data: CreateCaseRequest, createdById: string): Promise<any> {
    // Verify dentist exists
    const dentist = await prisma.dentistProfile.findUnique({
      where: { id: data.dentistId },
    });

    if (!dentist) {
      throw createAppError('Dentist not found', 404, 'DENTIST_NOT_FOUND');
    }

    const caseNumber = generateCaseNumber();

    const newCase = await prisma.case.create({
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

  async getCaseById(caseId: string): Promise<any> {
    const caseData = await prisma.case.findUnique({
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
      throw createAppError('Case not found', 404, 'CASE_NOT_FOUND');
    }

    return caseData;
  }

  async getCases(
    filters: CaseFilterParams,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

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
        { patientName: { contains: filters.search, mode: 'insensitive' as const } },
        { caseNumber: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
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
      prisma.case.findMany({
        where: where as any,
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
      prisma.case.count({ where: where as any }),
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

  async updateCase(caseId: string, data: UpdateCaseRequest): Promise<any> {
    const updateData: any = {};

    if (data.patientName !== undefined) updateData.patientName = data.patientName;
    if (data.patientEmail !== undefined) updateData.patientEmail = data.patientEmail;
    if (data.patientPhone !== undefined) updateData.patientPhone = data.patientPhone;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.specifications !== undefined) updateData.specifications = data.specifications;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedDate = new Date();
      }
    }
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;

    const updatedCase = await prisma.case.update({
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

  async deleteCase(caseId: string): Promise<void> {
    await prisma.case.delete({
      where: { id: caseId },
    });
  }

  async addCaseFile(caseId: string, file: Express.Multer.File, userId: string): Promise<any> {
    // Verify case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseExists) {
      throw createAppError('Case not found', 404, 'CASE_NOT_FOUND');
    }

    try {
      // Upload file to Supabase Storage
      const uploadResult = await uploadFileToStorage(file, caseId, userId);

      // Store file metadata in database
      const newFile = await prisma.caseFile.create({
        data: {
          caseId,
          filename: file.originalname,
          fileSize: BigInt(file.size),
          fileType: file.mimetype,
          fileUrl: uploadResult.path, // Store the Supabase path
        },
      });

      // Return file metadata with signed URL
      const signedUrl = await getSignedDownloadUrl(uploadResult.path, 3600); // 1 hour expiry

      return {
        ...newFile,
        signedUrl,
        attachmentType: uploadResult.attachmentType,
      };
    } catch (error) {
      throw createAppError(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'FILE_UPLOAD_FAILED'
      );
    }
  }

  async getCaseFiles(caseId: string): Promise<any[]> {
    const files = await prisma.caseFile.findMany({
      where: { caseId },
      orderBy: { uploadedAt: 'desc' },
    });

    // Add signed URLs to each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        try {
          const signedUrl = await getSignedDownloadUrl(file.fileUrl, 3600); // 1 hour expiry
          return {
            ...file,
            signedUrl,
            attachmentType: getAttachmentTypeFromMime(file.fileType),
          };
        } catch (error) {
          // If signed URL generation fails, return file without signed URL
          console.error(`Failed to generate signed URL for file ${file.id}:`, error);
          return {
            ...file,
            signedUrl: null,
            attachmentType: getAttachmentTypeFromMime(file.fileType),
          };
        }
      })
    );

    return filesWithUrls;
  }

  async deleteCaseFile(fileId: string): Promise<void> {
    // Get file metadata to find the storage path
    const file = await prisma.caseFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw createAppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    try {
      // Delete from Supabase Storage
      await deleteFileFromStorage(file.fileUrl);
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
      // Continue to delete database record even if storage deletion fails
    }

    // Delete from database
    await prisma.caseFile.delete({
      where: { id: fileId },
    });
  }

  async addCaseNote(caseId: string, userId: string, content: string, isInternal: boolean = false): Promise<any> {
    const newNote = await prisma.caseNote.create({
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

  async getCaseNotes(caseId: string, includeInternal: boolean = false): Promise<any[]> {
    const where: any = { caseId };

    if (!includeInternal) {
      where.isInternal = false;
    }

    return prisma.caseNote.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCaseWorkflow(caseId: string): Promise<any[]> {
    return prisma.workflowStage.findMany({
      where: { caseId },
      orderBy: { sequence: 'asc' },
    });
  }

  async searchCases(searchTerm: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const where = {
      OR: [
        { patientName: { contains: searchTerm, mode: 'insensitive' as const } },
        { caseNumber: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
      ],
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where: where as any,
        include: {
          dentist: true,
          createdBy: true,
          assignedTo: true,
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.case.count({ where: where as any }),
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

export const casesService = new CasesService();
