import { Response } from 'express';
export declare class BillingController {
    createInvoice: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getInvoices: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getInvoiceById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateInvoice: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteInvoice: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createPayment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getPayments: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getBillingStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const billingController: BillingController;
//# sourceMappingURL=billing.controller.d.ts.map