import { Response } from 'express';
export declare class StaffController {
    createStaff: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getStaff: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getStaffById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateStaff: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteStaff: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getStaffSchedules: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addStaffSchedule: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getPerformanceReviews: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addPerformanceReview: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const staffController: StaffController;
//# sourceMappingURL=staff.controller.d.ts.map