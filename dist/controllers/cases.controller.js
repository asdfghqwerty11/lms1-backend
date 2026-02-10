"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesController = exports.CasesController = void 0;
const zod_1 = require("zod");
const cases_service_1 = require("../services/cases.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createCaseSchema = zod_1.z.object({
    dentistId: zod_1.z.string().min(1, 'Dentist ID is required'),
    patientName: zod_1.z.string().min(1, 'Patient name is required'),
    patientEmail: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    patientPhone: zod_1.z.string().optional(),
    patientDOB: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().min(1, 'Description is required'),
    specifications: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    departmentId: zod_1.z.string().optional(),
});
const updateCaseSchema = zod_1.z.object({
    patientName: zod_1.z.string().optional(),
    patientEmail: zod_1.z.string().email().optional(),
    patientPhone: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    specifications: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: zod_1.z.enum(['RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED']).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    assignedToId: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
});
const caseNotesSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Note content is required'),
    isInternal: zod_1.z.boolean().optional(),
});
const workflowStageSchema = zod_1.z.object({
    stageName: zod_1.z.string().min(1, 'Stage name is required'),
    description: zod_1.z.string().optional(),
    sequence: zod_1.z.number().min(1),
    assignedTo: zod_1.z.string().optional(),
});
const updateWorkflowSchema = zod_1.z.object({
    stageName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED']).optional(),
    assignedTo: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
class CasesController {
    constructor() {
        this.createCase = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const validatedData = createCaseSchema.parse(req.body);
            const caseData = await cases_service_1.casesService.createCase(validatedData, req.user.id);
            const response = {
                success: true,
                message: 'Case created successfully',
                data: caseData,
            };
            res.status(201).json(response);
        });
        this.getCases = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const filters = {
                status: req.query.status,
                priority: req.query.priority,
                dentistId: req.query.dentistId,
                assignedToId: req.query.assignedToId,
                departmentId: req.query.departmentId,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const result = await cases_service_1.casesService.getCases(filters, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getCaseById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const caseData = await cases_service_1.casesService.getCaseById(id);
            const response = {
                success: true,
                data: caseData,
            };
            res.status(200).json(response);
        });
        this.updateCase = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateCaseSchema.parse(req.body);
            const updatedCase = await cases_service_1.casesService.updateCase(id, validatedData);
            const response = {
                success: true,
                message: 'Case updated successfully',
                data: updatedCase,
            };
            res.status(200).json(response);
        });
        this.deleteCase = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await cases_service_1.casesService.deleteCase(id);
            const response = {
                success: true,
                message: 'Case deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.addCaseFile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            if (!req.file) {
                throw (0, errorHandler_1.createAppError)('No file provided', 400, 'NO_FILE');
            }
            const file = await cases_service_1.casesService.addCaseFile(id, req.file, req.user.id);
            const response = {
                success: true,
                message: 'File uploaded successfully',
                data: file,
            };
            res.status(201).json(response);
        });
        this.getCaseFiles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const files = await cases_service_1.casesService.getCaseFiles(id);
            const response = {
                success: true,
                data: files,
            };
            res.status(200).json(response);
        });
        this.deleteCaseFile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { fileId } = req.params;
            await cases_service_1.casesService.deleteCaseFile(fileId);
            const response = {
                success: true,
                message: 'File deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.addCaseNote = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { id } = req.params;
            const validatedData = caseNotesSchema.parse(req.body);
            const note = await cases_service_1.casesService.addCaseNote(id, req.user.id, validatedData.content, validatedData.isInternal);
            const response = {
                success: true,
                message: 'Note added successfully',
                data: note,
            };
            res.status(201).json(response);
        });
        this.getCaseNotes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const includeInternal = req.query.includeInternal === 'true';
            const notes = await cases_service_1.casesService.getCaseNotes(id, includeInternal);
            const response = {
                success: true,
                data: notes,
            };
            res.status(200).json(response);
        });
        this.getCaseWorkflow = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const workflow = await cases_service_1.casesService.getCaseWorkflow(id);
            const response = {
                success: true,
                data: workflow,
            };
            res.status(200).json(response);
        });
        this.addWorkflowStage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = workflowStageSchema.parse(req.body);
            const stage = await cases_service_1.casesService.addCaseNote(id, '', `New stage: ${validatedData.stageName}`);
            const response = {
                success: true,
                message: 'Workflow stage created successfully',
                data: stage,
            };
            res.status(201).json(response);
        });
        this.searchCases = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const searchTerm = req.query.q;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            if (!searchTerm) {
                throw (0, errorHandler_1.createAppError)('Search term is required', 400, 'MISSING_SEARCH_TERM');
            }
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await cases_service_1.casesService.searchCases(searchTerm, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
    }
}
exports.CasesController = CasesController;
exports.casesController = new CasesController();
//# sourceMappingURL=cases.controller.js.map