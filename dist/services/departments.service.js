"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsService = exports.DepartmentsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class DepartmentsService {
    async createDepartment(data) {
        // Verify manager user exists if provided
        if (data.managerId) {
            const manager = await database_1.prisma.user.findUnique({
                where: { id: data.managerId },
            });
            if (!manager) {
                throw (0, errorHandler_1.createAppError)('Manager user not found', 404, 'MANAGER_USER_NOT_FOUND');
            }
        }
        const newDepartment = await database_1.prisma.department.create({
            data: {
                name: data.name,
                description: data.description,
                managerId: data.managerId,
            },
            include: {
                equipment: true,
                cases: true,
            },
        });
        return newDepartment;
    }
    async getDepartmentById(departmentId) {
        const department = await database_1.prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                equipment: true,
                cases: true,
            },
        });
        if (!department) {
            throw (0, errorHandler_1.createAppError)('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
        }
        return department;
    }
    async getDepartments(pagination) {
        const [departments, total] = await Promise.all([
            database_1.prisma.department.findMany({
                include: {
                    equipment: true,
                },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { name: 'asc' },
            }),
            database_1.prisma.department.count(),
        ]);
        const pages = Math.ceil(total / pagination.limit);
        return {
            data: departments,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                pages,
            },
        };
    }
    async updateDepartment(departmentId, data) {
        // Verify manager user exists if provided
        if (data.managerId) {
            const manager = await database_1.prisma.user.findUnique({
                where: { id: data.managerId },
            });
            if (!manager) {
                throw (0, errorHandler_1.createAppError)('Manager user not found', 404, 'MANAGER_USER_NOT_FOUND');
            }
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.managerId !== undefined)
            updateData.managerId = data.managerId;
        const updatedDepartment = await database_1.prisma.department.update({
            where: { id: departmentId },
            data: updateData,
            include: {
                equipment: true,
            },
        });
        return updatedDepartment;
    }
    async deleteDepartment(departmentId) {
        // Check if department has cases
        const department = await database_1.prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                cases: true,
            },
        });
        if (!department) {
            throw (0, errorHandler_1.createAppError)('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
        }
        if (department.cases.length > 0) {
            throw (0, errorHandler_1.createAppError)('Cannot delete department with active cases', 400, 'DEPARTMENT_HAS_CASES');
        }
        await database_1.prisma.department.delete({
            where: { id: departmentId },
        });
    }
    // Equipment management
    async addEquipment(departmentId, data) {
        // Verify department exists
        const department = await database_1.prisma.department.findUnique({
            where: { id: departmentId },
        });
        if (!department) {
            throw (0, errorHandler_1.createAppError)('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
        }
        const equipment = await database_1.prisma.departmentEquipment.create({
            data: {
                departmentId,
                name: data.name,
                model: data.model,
                serialNumber: data.serialNumber,
                status: data.status || 'OPERATIONAL',
                purchaseDate: new Date(),
                maintenanceDate: data.maintenanceDate ? new Date(data.maintenanceDate) : undefined,
            },
        });
        return equipment;
    }
    async getEquipmentById(equipmentId) {
        const equipment = await database_1.prisma.departmentEquipment.findUnique({
            where: { id: equipmentId },
        });
        if (!equipment) {
            throw (0, errorHandler_1.createAppError)('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
        }
        return equipment;
    }
    async getDepartmentEquipment(departmentId) {
        // Verify department exists
        const department = await database_1.prisma.department.findUnique({
            where: { id: departmentId },
        });
        if (!department) {
            throw (0, errorHandler_1.createAppError)('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
        }
        return database_1.prisma.departmentEquipment.findMany({
            where: { departmentId },
            orderBy: { name: 'asc' },
        });
    }
    async updateEquipment(equipmentId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.model !== undefined)
            updateData.model = data.model;
        if (data.serialNumber !== undefined)
            updateData.serialNumber = data.serialNumber;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.maintenanceDate !== undefined)
            updateData.maintenanceDate = new Date(data.maintenanceDate);
        const updatedEquipment = await database_1.prisma.departmentEquipment.update({
            where: { id: equipmentId },
            data: updateData,
        });
        return updatedEquipment;
    }
    async deleteEquipment(equipmentId) {
        const equipment = await database_1.prisma.departmentEquipment.findUnique({
            where: { id: equipmentId },
        });
        if (!equipment) {
            throw (0, errorHandler_1.createAppError)('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
        }
        await database_1.prisma.departmentEquipment.delete({
            where: { id: equipmentId },
        });
    }
}
exports.DepartmentsService = DepartmentsService;
exports.departmentsService = new DepartmentsService();
//# sourceMappingURL=departments.service.js.map