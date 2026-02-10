import { Response } from 'express';
export declare class LogisticsController {
    createShipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getShipments: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getShipmentById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateShipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteShipment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getDeliveryRoutes: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createDeliveryRoute: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateRouteStop: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const logisticsController: LogisticsController;
//# sourceMappingURL=logistics.controller.d.ts.map