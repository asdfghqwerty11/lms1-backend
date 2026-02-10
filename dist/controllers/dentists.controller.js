"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dentistsController = exports.DentistsController = void 0;
const zod_1 = require("zod");
const dentists_service_1 = require("../services/dentists.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createDentistSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email is required'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phone: zod_1.z.string().optional(),
    licenseNumber: zod_1.z.string().min(1, 'License number is required'),
    specialization: zod_1.z.string().optional(),
    clinic: zod_1.z.string().optional(),
    clinicPhone: zod_1.z.string().optional(),
    clinicEmail: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
});
const updateDentistSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    clinic: zod_1.z.string().optional(),
    clinicPhone: zod_1.z.string().optional(),
    clinicEmail: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
});
const reviewApplicationSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
    notes: zod_1.z.string().optional(),
});
class DentistsController {
    constructor() {
        this.createDentist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createDentistSchema.parse(req.body);
            const dentist = await dentists_service_1.dentistsService.createDentist(validatedData);
            const response = {
                success: true,
                message: 'Dentist profile created successfully',
                data: dentist,
            };
            res.status(201).json(response);
        });
        this.getDentists = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const filters = {
                specialization: req.query.specialization,
                status: req.query.status,
                search: req.query.search,
            };
            const result = await dentists_service_1.dentistsService.getDentists(filters, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getDentistById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const dentist = await dentists_service_1.dentistsService.getDentistById(id);
            const response = {
                success: true,
                data: dentist,
            };
            res.status(200).json(response);
        });
        this.updateDentist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateDentistSchema.parse(req.body);
            const updatedDentist = await dentists_service_1.dentistsService.updateDentist(id, validatedData);
            const response = {
                success: true,
                message: 'Dentist profile updated successfully',
                data: updatedDentist,
            };
            res.status(200).json(response);
        });
        this.deleteDentist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await dentists_service_1.dentistsService.deleteDentist(id);
            const response = {
                success: true,
                message: 'Dentist deactivated successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.getDentistApplications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const filters = {
                status: req.query.status,
                dentistId: req.query.dentistId,
            };
            const result = await dentists_service_1.dentistsService.getDentistApplications(filters, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.reviewApplication = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { applicationId } = req.params;
            const validatedData = reviewApplicationSchema.parse(req.body);
            const updated = await dentists_service_1.dentistsService.reviewApplication(applicationId, req.user.id, validatedData);
            const response = {
                success: true,
                message: 'Application reviewed successfully',
                data: updated,
            };
            res.status(200).json(response);
        });
    }
}
exports.DentistsController = DentistsController;
exports.dentistsController = new DentistsController();
//# sourceMappingURL=dentists.controller.js.map