import { Response } from 'express';
import { z } from 'zod';
import { casesService } from '../services/cases.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createCaseSchema = z.object({
  dentistId: z.string().min(1, 'Dentist ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  patientEmail: z.string().email().optional().or(z.literal('')),
  patientPhone: z.string().optional(),
  patientDOB: z.string().datetime().optional(),
  description: z.string().min(1, 'Description is required'),
  specifications: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  departmentId: z.string().optional(),
});

const updateCaseSchema = z.object({
  patientName: z.string().optional(),
  patientEmail: z.string().email().optional(),
  patientPhone: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  departmentId: z.string().optional(),
});

const caseNotesSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isInternal: z.boolean().optional(),
});

const workflowStageSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required'),
  description: z.string().optional(),
  sequence: z.number().min(1),
  assignedTo: z.string().optional(),
});

const updateWorkflowSchema = z.object({
  stageName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED']).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export class CasesController {
  createCase = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const validatedData = createCaseSchema.parse(req.body);

    const caseData = await casesService.createCase(validatedData, req.user.id);

    const response: SuccessResponse<typeof caseData> = {
      success: true,
      message: 'Case created successfully',
      data: caseData,
    };

    res.status(201).json(response);
  });

  getCases = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const filters = {
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      dentistId: req.query.dentistId as string | undefined,
      assignedToId: req.query.assignedToId as string | undefined,
      departmentId: req.query.departmentId as string | undefined,
      search: req.query.search as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const result = await casesService.getCases(filters, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getCaseById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const caseData = await casesService.getCaseById(id);

    const response: SuccessResponse<typeof caseData> = {
      success: true,
      data: caseData,
    };

    res.status(200).json(response);
  });

  updateCase = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateCaseSchema.parse(req.body);

    const updatedCase = await casesService.updateCase(id, validatedData);

    const response: SuccessResponse<typeof updatedCase> = {
      success: true,
      message: 'Case updated successfully',
      data: updatedCase,
    };

    res.status(200).json(response);
  });

  deleteCase = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await casesService.deleteCase(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Case deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  addCaseFile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!req.file) {
      throw createAppError('No file provided', 400, 'NO_FILE');
    }

    const file = await casesService.addCaseFile(id, req.file);

    const response: SuccessResponse<typeof file> = {
      success: true,
      message: 'File uploaded successfully',
      data: file,
    };

    res.status(201).json(response);
  });

  getCaseFiles = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const files = await casesService.getCaseFiles(id);

    const response: SuccessResponse<typeof files> = {
      success: true,
      data: files,
    };

    res.status(200).json(response);
  });

  deleteCaseFile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { fileId } = req.params;

    await casesService.deleteCaseFile(fileId);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'File deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  addCaseNote = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const validatedData = caseNotesSchema.parse(req.body);

    const note = await casesService.addCaseNote(id, req.user.id, validatedData.content, validatedData.isInternal);

    const response: SuccessResponse<typeof note> = {
      success: true,
      message: 'Note added successfully',
      data: note,
    };

    res.status(201).json(response);
  });

  getCaseNotes = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const includeInternal = req.query.includeInternal === 'true';

    const notes = await casesService.getCaseNotes(id, includeInternal);

    const response: SuccessResponse<typeof notes> = {
      success: true,
      data: notes,
    };

    res.status(200).json(response);
  });

  getCaseWorkflow = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const workflow = await casesService.getCaseWorkflow(id);

    const response: SuccessResponse<typeof workflow> = {
      success: true,
      data: workflow,
    };

    res.status(200).json(response);
  });

  addWorkflowStage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = workflowStageSchema.parse(req.body);

    const stage = await casesService.addCaseNote(id, '', `New stage: ${validatedData.stageName}`);

    const response: SuccessResponse<typeof stage> = {
      success: true,
      message: 'Workflow stage created successfully',
      data: stage,
    };

    res.status(201).json(response);
  });

  searchCases = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const searchTerm = req.query.q as string;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!searchTerm) {
      throw createAppError('Search term is required', 400, 'MISSING_SEARCH_TERM');
    }

    const pagination = getPaginationParams(String(page), String(limit));
    const result = await casesService.searchCases(searchTerm, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });
}

export const casesController = new CasesController();
