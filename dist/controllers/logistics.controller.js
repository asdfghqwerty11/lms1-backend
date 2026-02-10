"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logisticsController = exports.LogisticsController = void 0;
const zod_1 = require("zod");
const logistics_service_1 = require("../services/logistics.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createShipmentSchema = zod_1.z.object({
    caseId: zod_1.z.string().min(1, 'Case ID is required'),
    trackingNumber: zod_1.z.string().min(1, 'Tracking number is required'),
    origin: zod_1.z.string().min(1, 'Origin is required'),
    destination: zod_1.z.string().min(1, 'Destination is required'),
    carrier: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']).optional(),
    estimatedDate: zod_1.z.string().datetime().optional(),
    actualDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
});
const updateShipmentSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().optional(),
    carrier: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']).optional(),
    origin: zod_1.z.string().optional(),
    destination: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    estimatedDate: zod_1.z.string().datetime().optional(),
    actualDate: zod_1.z.string().datetime().optional(),
});
const createDeliveryRouteSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
    sequence: zod_1.z.number().optional(),
});
const updateRouteStopSchema = zod_1.z.object({
    location: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime().optional(),
});
class LogisticsController {
    constructor() {
        this.createShipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const validatedData = createShipmentSchema.parse(req.body);
            const shipment = await logistics_service_1.logisticsService.createShipment(validatedData);
            const response = {
                success: true,
                message: 'Shipment created successfully',
                data: shipment,
            };
            res.status(201).json(response);
        });
        this.getShipments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const filters = {
                status: req.query.status,
                carrier: req.query.carrier,
                caseId: req.query.caseId,
                search: req.query.search,
            };
            const result = await logistics_service_1.logisticsService.getShipments(filters, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getShipmentById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const shipment = await logistics_service_1.logisticsService.getShipmentById(id);
            const response = {
                success: true,
                data: shipment,
            };
            res.status(200).json(response);
        });
        this.updateShipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateShipmentSchema.parse(req.body);
            const updatedShipment = await logistics_service_1.logisticsService.updateShipment(id, validatedData);
            const response = {
                success: true,
                message: 'Shipment updated successfully',
                data: updatedShipment,
            };
            res.status(200).json(response);
        });
        this.deleteShipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await logistics_service_1.logisticsService.deleteShipment(id);
            const response = {
                success: true,
                message: 'Shipment deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.getDeliveryRoutes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await logistics_service_1.logisticsService.getDeliveryRoutes(pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.createDeliveryRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const validatedData = createDeliveryRouteSchema.parse(req.body);
            const route = await logistics_service_1.logisticsService.createDeliveryRoute(validatedData);
            const response = {
                success: true,
                message: 'Delivery route created successfully',
                data: route,
            };
            res.status(201).json(response);
        });
        this.updateRouteStop = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateRouteStopSchema.parse(req.body);
            const updatedStop = await logistics_service_1.logisticsService.updateRouteStop(id, validatedData);
            const response = {
                success: true,
                message: 'Route stop updated successfully',
                data: updatedStop,
            };
            res.status(200).json(response);
        });
    }
}
exports.LogisticsController = LogisticsController;
exports.logisticsController = new LogisticsController();
//# sourceMappingURL=logistics.controller.js.map