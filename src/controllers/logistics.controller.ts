import { Response } from 'express';
import { z } from 'zod';
import { logisticsService } from '../services/logistics.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createShipmentSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  carrier: z.string().optional(),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']).optional(),
  estimatedDate: z.string().datetime().optional(),
  actualDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updateShipmentSchema = z.object({
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']).optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  notes: z.string().optional(),
  estimatedDate: z.string().datetime().optional(),
  actualDate: z.string().datetime().optional(),
});

const createDeliveryRouteSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  sequence: z.number().optional(),
});

const updateRouteStopSchema = z.object({
  location: z.string().optional(),
  status: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export class LogisticsController {
  createShipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const validatedData = createShipmentSchema.parse(req.body);

    const shipment = await logisticsService.createShipment(validatedData);

    const response: SuccessResponse<typeof shipment> = {
      success: true,
      message: 'Shipment created successfully',
      data: shipment,
    };

    res.status(201).json(response);
  });

  getShipments = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const filters = {
      status: req.query.status as string | undefined,
      carrier: req.query.carrier as string | undefined,
      caseId: req.query.caseId as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await logisticsService.getShipments(filters, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getShipmentById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const shipment = await logisticsService.getShipmentById(id);

    const response: SuccessResponse<typeof shipment> = {
      success: true,
      data: shipment,
    };

    res.status(200).json(response);
  });

  updateShipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateShipmentSchema.parse(req.body);

    const updatedShipment = await logisticsService.updateShipment(id, validatedData);

    const response: SuccessResponse<typeof updatedShipment> = {
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment,
    };

    res.status(200).json(response);
  });

  deleteShipment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await logisticsService.deleteShipment(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Shipment deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  getDeliveryRoutes = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const result = await logisticsService.getDeliveryRoutes(pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  createDeliveryRoute = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const validatedData = createDeliveryRouteSchema.parse(req.body);

    const route = await logisticsService.createDeliveryRoute(validatedData);

    const response: SuccessResponse<typeof route> = {
      success: true,
      message: 'Delivery route created successfully',
      data: route,
    };

    res.status(201).json(response);
  });

  updateRouteStop = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateRouteStopSchema.parse(req.body);

    const updatedStop = await logisticsService.updateRouteStop(id, validatedData);

    const response: SuccessResponse<typeof updatedStop> = {
      success: true,
      message: 'Route stop updated successfully',
      data: updatedStop,
    };

    res.status(200).json(response);
  });
}

export const logisticsController = new LogisticsController();
