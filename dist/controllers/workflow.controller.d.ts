import { Response } from 'express';
export declare class WorkflowController {
    getCaseWorkflow: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createWorkflowStage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getStageById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateStage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    completeStage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteStage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getWorkflowStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const workflowController: WorkflowController;
//# sourceMappingURL=workflow.controller.d.ts.map