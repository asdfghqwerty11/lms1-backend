import { PaginationParams, PaginatedResponse } from '../types';
export declare class LogisticsService {
    createShipment(data: any): Promise<any>;
    getShipmentById(shipmentId: string): Promise<any>;
    getShipments(filters: any, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateShipment(shipmentId: string, data: any): Promise<any>;
    deleteShipment(shipmentId: string): Promise<void>;
    getDeliveryRoutes(pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    createDeliveryRoute(data: any): Promise<any>;
    updateRouteStop(stopId: string, data: any): Promise<any>;
}
export declare const logisticsService: LogisticsService;
//# sourceMappingURL=logistics.service.d.ts.map