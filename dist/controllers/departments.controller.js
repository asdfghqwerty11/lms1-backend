"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsController = exports.DepartmentsController = void 0;
const zod_1 = require("zod");
const departments_service_1 = require("../services/departments.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Department name is required'),
    description: zod_1.z.string().optional(),
    managerId: zod_1.z.string().optional(),
});
const updateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    managerId: zod_1.z.string().optional(),
});
const createEquipmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Equipment name is required'),
    model: zod_1.z.string().optional(),
    serialNumber: zod_1.z.string().optional(),
    status: zod_1.z.enum(['OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'DECOMMISSIONED']).optional(),
    purchaseDate: zod_1.z.string().datetime().optional(),
    maintenanceDate: zod_1.z.string().datetime().optional(),
});
const updateEquipmentSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    serialNumber: zod_1.z.string().optional(),
    status: zod_1.z.enum(['OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'DECOMMISSIONED']).optional(),
    maintenanceDate: zod_1.z.string().datetime().optional(),
});
class DepartmentsController {
    constructor() {
        this.createDepartment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createDepartmentSchema.parse(req.body);
            const department = await departments_service_1.departmentsService.createDepartment(validatedData);
            const response = {
                success: true,
                message: 'Department created successfully',
                data: department,
            };
            res.status(201).json(response);
        });
        this.getDepartments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await departments_service_1.departmentsService.getDepartments(pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getDepartmentById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const department = await departments_service_1.departmentsService.getDepartmentById(id);
            const response = {
                success: true,
                data: department,
            };
            res.status(200).json(response);
        });
        this.updateDepartment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateDepartmentSchema.parse(req.body);
            const department = await departments_service_1.departmentsService.updateDepartment(id, validatedData);
            const response = {
                success: true,
                message: 'Department updated successfully',
                data: department,
            };
            res.status(200).json(response);
        });
        this.deleteDepartment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await departments_service_1.departmentsService.deleteDepartment(id);
            const response = {
                success: true,
                message: 'Department deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        // Equipment management
        this.addEquipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = createEquipmentSchema.parse(req.body);
            const equipment = await departments_service_1.departmentsService.addEquipment(id, validatedData);
            const response = {
                success: true,
                message: 'Equipment added successfully',
                data: equipment,
            };
            res.status(201).json(response);
        });
        this.getDepartmentEquipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const equipment = await departments_service_1.departmentsService.getDepartmentEquipment(id);
            const response = {
                success: true,
                data: equipment,
            };
            res.status(200).json(response);
        });
        this.getEquipmentById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { equipmentId } = req.params;
            const equipment = await departments_service_1.departmentsService.getEquipmentById(equipmentId);
            const response = {
                success: true,
                data: equipment,
            };
            res.status(200).json(response);
        });
        this.updateEquipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { equipmentId } = req.params;
            const validatedData = updateEquipmentSchema.parse(req.body);
            const equipment = await departments_service_1.departmentsService.updateEquipment(equipmentId, validatedData);
            const response = {
                success: true,
                message: 'Equipment updated successfully',
                data: equipment,
            };
            res.status(200).json(response);
        });
        this.deleteEquipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { equipmentId } = req.params;
            await departments_service_1.departmentsService.deleteEquipment(equipmentId);
            const response = {
                success: true,
                message: 'Equipment deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
    }
}
exports.DepartmentsController = DepartmentsController;
exports.departmentsController = new DepartmentsController();
//# sourceMappingURL=departments.controller.js.map