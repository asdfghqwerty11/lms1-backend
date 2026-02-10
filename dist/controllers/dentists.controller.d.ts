import { Response } from 'express';
export declare class DentistsController {
    createDentist: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDentists: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDentistById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateDentist: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteDentist: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDentistApplications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    reviewApplication: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const dentistsController: DentistsController;
//# sourceMappingURL=dentists.controller.d.ts.map