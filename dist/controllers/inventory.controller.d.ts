import { Response } from 'express';
export declare class InventoryController {
    createItem: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getItems: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getItemById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateItem: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteItem: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    recordTransaction: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getTransactions: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getLowStockItems: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getInventoryStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const inventoryController: InventoryController;
//# sourceMappingURL=inventory.controller.d.ts.map