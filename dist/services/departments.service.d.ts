import { PaginationParams, PaginatedResponse } from '../types';
export declare class DepartmentsService {
    createDepartment(data: {
        name: string;
        description?: string;
        managerId?: string;
    }): Promise<any>;
    getDepartmentById(departmentId: string): Promise<any>;
    getDepartments(pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateDepartment(departmentId: string, data: {
        name?: string;
        description?: string;
        managerId?: string;
    }): Promise<any>;
    deleteDepartment(departmentId: string): Promise<void>;
    addEquipment(departmentId: string, data: {
        name: string;
        model?: string;
        serialNumber?: string;
        status?: string;
        purchaseDate?: string;
        maintenanceDate?: string;
    }): Promise<any>;
    getEquipmentById(equipmentId: string): Promise<any>;
    getDepartmentEquipment(departmentId: string): Promise<any[]>;
    updateEquipment(equipmentId: string, data: {
        name?: string;
        model?: string;
        serialNumber?: string;
        status?: string;
        maintenanceDate?: string;
    }): Promise<any>;
    deleteEquipment(equipmentId: string): Promise<void>;
}
export declare const departmentsService: DepartmentsService;
//# sourceMappingURL=departments.service.d.ts.map