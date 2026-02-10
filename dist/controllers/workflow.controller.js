"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowController = exports.WorkflowController = void 0;
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const createWorkflowStageSchema = zod_1.z.object({
    stageName: zod_1.z.string().min(1, 'Stage name is required'),
    description: zod_1.z.string().optional(),
    sequence: zod_1.z.number().int().positive(),
    assignedTo: zod_1.z.string().optional(),
});
const updateWorkflowStageSchema = zod_1.z.object({
    stageName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED']).optional(),
    assignedTo: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const completeStageSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
class WorkflowController {
    constructor() {
        this.getCaseWorkflow = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { caseId } = req.params;
            const stages = await database_1.prisma.workflowStage.findMany({
                where: { caseId },
                orderBy: { sequence: 'asc' },
            });
            const response = {
                success: true,
                data: stages,
            };
            res.status(200).json(response);
        });
        this.createWorkflowStage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { caseId } = req.params;
            const validatedData = createWorkflowStageSchema.parse(req.body);
            // Verify case exists
            const caseData = await database_1.prisma.case.findUnique({
                where: { id: caseId },
            });
            if (!caseData) {
                throw (0, errorHandler_1.createAppError)('Case not found', 404, 'CASE_NOT_FOUND');
            }
            const stage = await database_1.prisma.workflowStage.create({
                data: {
                    caseId,
                    stageName: validatedData.stageName,
                    description: validatedData.description,
                    sequence: validatedData.sequence,
                    assignedTo: validatedData.assignedTo,
                },
            });
            const response = {
                success: true,
                message: 'Workflow stage created successfully',
                data: stage,
            };
            res.status(201).json(response);
        });
        this.getStageById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { stageId } = req.params;
            const stage = await database_1.prisma.workflowStage.findUnique({
                where: { id: stageId },
            });
            if (!stage) {
                throw (0, errorHandler_1.createAppError)('Workflow stage not found', 404, 'STAGE_NOT_FOUND');
            }
            const response = {
                success: true,
                data: stage,
            };
            res.status(200).json(response);
        });
        this.updateStage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { stageId } = req.params;
            const validatedData = updateWorkflowStageSchema.parse(req.body);
            const updateData = {};
            if (validatedData.stageName !== undefined)
                updateData.stageName = validatedData.stageName;
            if (validatedData.description !== undefined)
                updateData.description = validatedData.description;
            if (validatedData.status !== undefined) {
                updateData.status = validatedData.status;
                if (validatedData.status === 'IN_PROGRESS' && !updateData.startedAt) {
                    updateData.startedAt = new Date();
                }
                if (validatedData.status === 'COMPLETED') {
                    updateData.completedAt = new Date();
                }
            }
            if (validatedData.assignedTo !== undefined)
                updateData.assignedTo = validatedData.assignedTo;
            if (validatedData.notes !== undefined)
                updateData.notes = validatedData.notes;
            const stage = await database_1.prisma.workflowStage.update({
                where: { id: stageId },
                data: updateData,
            });
            const response = {
                success: true,
                message: 'Workflow stage updated successfully',
                data: stage,
            };
            res.status(200).json(response);
        });
        this.completeStage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { stageId } = req.params;
            const validatedData = completeStageSchema.parse(req.body);
            const stage = await database_1.prisma.workflowStage.update({
                where: { id: stageId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    notes: validatedData.notes,
                },
            });
            const response = {
                success: true,
                message: 'Workflow stage completed successfully',
                data: stage,
            };
            res.status(200).json(response);
        });
        this.deleteStage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { stageId } = req.params;
            await database_1.prisma.workflowStage.delete({
                where: { id: stageId },
            });
            const response = {
                success: true,
                message: 'Workflow stage deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.getWorkflowStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { caseId } = req.params;
            const stages = await database_1.prisma.workflowStage.findMany({
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
            const response = {
                success: true,
                data: stats,
            };
            res.status(200).json(response);
        });
    }
}
exports.WorkflowController = WorkflowController;
exports.workflowController = new WorkflowController();
//# sourceMappingURL=workflow.controller.js.map