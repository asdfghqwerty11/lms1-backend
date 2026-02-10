import { Response } from 'express';
export declare class CasesController {
    createCase: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getCases: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getCaseById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateCase: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteCase: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addCaseFile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getCaseFiles: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteCaseFile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addCaseNote: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getCaseNotes: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getCaseWorkflow: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addWorkflowStage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    searchCases: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const casesController: CasesController;
//# sourceMappingURL=cases.controller.d.ts.map