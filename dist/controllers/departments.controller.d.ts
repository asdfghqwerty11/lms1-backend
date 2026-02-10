import { Response } from 'express';
export declare class DepartmentsController {
    createDepartment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDepartments: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDepartmentById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateDepartment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteDepartment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addEquipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDepartmentEquipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getEquipmentById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateEquipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteEquipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const departmentsController: DepartmentsController;
//# sourceMappingURL=departments.controller.d.ts.map