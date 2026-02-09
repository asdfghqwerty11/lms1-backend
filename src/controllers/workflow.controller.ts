import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse } from '../types';

const createWorkflowStageSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required'),
  description: z.string().optional(),
  sequence: z.number().int().positive(),
  assignedTo: z.string().optional(),
});

const updateWorkflowStageSchema = z.object({
  stageName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED']).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

const completeStageSchema = z.object({
  notes: z.string().optional(),
});

export class WorkflowController {
  getCaseWorkflow = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params;

    const stages = await prisma.workflowStage.findMany({
      where: { caseId },
      orderBy: { sequence: 'asc' },
    });

    const response: SuccessResponse<typeof stages> = {
      success: true,
      data: stages,
    };

    res.status(200).json(response);
  });

  createWorkflowStage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params;
    const validatedData = createWorkflowStageSchema.parse(req.body);

    // Verify case exists
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw createAppError('Case not found', 404, 'CASE_NOT_FOUND');
    }

    const stage = await prisma.workflowStage.create({
      data: {
        caseId,
        stageName: validatedData.stageName,
        description: validatedData.description,
        sequence: validatedData.sequence,
        assignedTo: validatedData.assignedTo,
      },
    });

    const response: SuccessResponse<typeof stage> = {
      success: true,
      message: 'Workflow stage created successfully',
      data: stage,
    };

    res.status(201).json(response);
  });

  getStageById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { stageId } = req.params;

    const stage = await prisma.workflowStage.findUnique({
      where: { id: stageId },
    });

    if (!stage) {
      throw createAppError('Workflow stage not found', 404, 'STAGE_NOT_FOUND');
    }

    const response: SuccessResponse<typeof stage> = {
      success: true,
      data: stage,
    };

    res.status(200).json(response);
  });

  updateStage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { stageId } = req.params;
    const validatedData = updateWorkflowStageSchema.parse(req.body);

    const updateData: any = {};

    if (validatedData.stageName !== undefined) updateData.stageName = validatedData.stageName;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      if (validatedData.status === 'IN_PROGRESS' && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }
      if (validatedData.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    if (validatedData.assignedTo !== undefined) updateData.assignedTo = validatedData.assignedTo;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const stage = await prisma.workflowStage.update({
      where: { id: stageId },
      data: updateData,
    });

    const response: SuccessResponse<typeof stage> = {
      success: true,
      message: 'Workflow stage updated successfully',
      data: stage,
    };

    res.status(200).json(response);
  });

  completeStage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { stageId } = req.params;
    const validatedData = completeStageSchema.parse(req.body);

    const stage = await prisma.workflowStage.update({
      where: { id: stageId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        notes: validatedData.notes,
      },
    });

    const response: SuccessResponse<typeof stage> = {
      success: true,
      message: 'Workflow stage completed successfully',
      data: stage,
    };

    res.status(200).json(response);
  });

  deleteStage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { stageId } = req.params;

    await prisma.workflowStage.delete({
      where: { id: stageId },
    });

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Workflow stage deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  getWorkflowStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params;

    const stages = await prisma.workflowStage.findMany({
      where: { caseId },
    });

    const stats = {
      total: stages.length,
      pending: stages.filter((s) => s.status === 'PENDING').length,
      inProgress: stages.filter((s) => s.status === 'IN_PROGRESS').length,
      completed: stages.filter((s) => s.status === 'COMPLETED').length,
      blocked: stages.filter((s) => s.status === 'BLOCKED').length,
      progress: stages.length > 0 ? Math.round((stages.filter((s) => s.status === 'COMPLETED').length / stages.length) * 100) : 0,
    };

    const response: SuccessResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });
}

export const workflowController = new WorkflowController();
