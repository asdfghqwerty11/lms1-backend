import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import {
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class DepartmentsService {
  async createDepartment(data: {
    name: string;
    description?: string;
    managerId?: string;
  }): Promise<any> {
    // Verify manager user exists if provided
    if (data.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: data.managerId },
      });

      if (!manager) {
        throw createAppError('Manager user not found', 404, 'MANAGER_USER_NOT_FOUND');
      }
    }

    const newDepartment = await prisma.department.create({
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

  async getDepartmentById(departmentId: string): Promise<any> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        equipment: true,
        cases: true,
      },
    });

    if (!department) {
      throw createAppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    return department;
  }

  async getDepartments(pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        include: {
          equipment: true,
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.department.count(),
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

  async updateDepartment(
    departmentId: string,
    data: {
      name?: string;
      description?: string;
      managerId?: string;
    }
  ): Promise<any> {
    // Verify manager user exists if provided
    if (data.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: data.managerId },
      });

      if (!manager) {
        throw createAppError('Manager user not found', 404, 'MANAGER_USER_NOT_FOUND');
      }
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.managerId !== undefined) updateData.managerId = data.managerId;

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: updateData,
      include: {
        equipment: true,
      },
    });

    return updatedDepartment;
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    // Check if department has cases
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        cases: true,
      },
    });

    if (!department) {
      throw createAppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    if (department.cases.length > 0) {
      throw createAppError(
        'Cannot delete department with active cases',
        400,
        'DEPARTMENT_HAS_CASES'
      );
    }

    await prisma.department.delete({
      where: { id: departmentId },
    });
  }

  // Equipment management
  async addEquipment(
    departmentId: string,
    data: {
      name: string;
      model?: string;
      serialNumber?: string;
      status?: string;
      purchaseDate?: string;
      maintenanceDate?: string;
    }
  ): Promise<any> {
    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw createAppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    const equipment = await prisma.departmentEquipment.create({
      data: {
        departmentId,
        name: data.name,
        model: data.model,
        serialNumber: data.serialNumber,
        status: (data.status as any) || 'OPERATIONAL',
        purchaseDate: new Date(),
        maintenanceDate: data.maintenanceDate ? new Date(data.maintenanceDate) : undefined,
      },
    });

    return equipment;
  }

  async getEquipmentById(equipmentId: string): Promise<any> {
    const equipment = await prisma.departmentEquipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw createAppError('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
    }

    return equipment;
  }

  async getDepartmentEquipment(departmentId: string): Promise<any[]> {
    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw createAppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    return prisma.departmentEquipment.findMany({
      where: { departmentId },
      orderBy: { name: 'asc' },
    });
  }

  async updateEquipment(
    equipmentId: string,
    data: {
      name?: string;
      model?: string;
      serialNumber?: string;
      status?: string;
      maintenanceDate?: string;
    }
  ): Promise<any> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.serialNumber !== undefined) updateData.serialNumber = data.serialNumber;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.maintenanceDate !== undefined)
      updateData.maintenanceDate = new Date(data.maintenanceDate);

    const updatedEquipment = await prisma.departmentEquipment.update({
      where: { id: equipmentId },
      data: updateData,
    });

    return updatedEquipment;
  }

  async deleteEquipment(equipmentId: string): Promise<void> {
    const equipment = await prisma.departmentEquipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw createAppError('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
    }

    await prisma.departmentEquipment.delete({
      where: { id: equipmentId },
    });
  }
}

export const departmentsService = new DepartmentsService();
