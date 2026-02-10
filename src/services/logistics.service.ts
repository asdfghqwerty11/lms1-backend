import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import {
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class LogisticsService {
  async createShipment(data: any): Promise<any> {
    // Verify case exists
    const caseData = await prisma.case.findUnique({
      where: { id: data.caseId },
    });

    if (!caseData) {
      throw createAppError('Case not found', 404, 'CASE_NOT_FOUND');
    }

    const newShipment = await prisma.shipment.create({
      data: {
        trackingNumber: data.trackingNumber,
        caseId: data.caseId,
        origin: data.origin,
        destination: data.destination,
        carrier: data.carrier,
        status: data.status || 'PENDING',
        estimatedDate: data.estimatedDate ? new Date(data.estimatedDate) : new Date(),
        actualDate: data.actualDate ? new Date(data.actualDate) : undefined,
        notes: data.notes,
      },
      include: {
        deliveryRoutes: {
          include: {
            stops: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    return newShipment;
  }

  async getShipmentById(shipmentId: string): Promise<any> {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        deliveryRoutes: {
          include: {
            stops: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw createAppError('Shipment not found', 404, 'SHIPMENT_NOT_FOUND');
    }

    return shipment;
  }

  async getShipments(
    filters: any,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.carrier) {
      where.carrier = filters.carrier;
    }

    if (filters.caseId) {
      where.caseId = filters.caseId;
    }

    if (filters.search) {
      where.OR = [
        { trackingNumber: { contains: filters.search, mode: 'insensitive' as const } },
        { origin: { contains: filters.search, mode: 'insensitive' as const } },
        { destination: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where: where as any,
        include: {
          deliveryRoutes: {
            include: {
              stops: {
                orderBy: { timestamp: 'asc' },
              },
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shipment.count({ where: where as any }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: shipments,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async updateShipment(shipmentId: string, data: any): Promise<any> {
    const updateData: any = {};

    if (data.trackingNumber !== undefined) updateData.trackingNumber = data.trackingNumber;
    if (data.carrier !== undefined) updateData.carrier = data.carrier;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.origin !== undefined) updateData.origin = data.origin;
    if (data.destination !== undefined) updateData.destination = data.destination;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.estimatedDate !== undefined) updateData.estimatedDate = new Date(data.estimatedDate);
    if (data.actualDate !== undefined) updateData.actualDate = data.actualDate ? new Date(data.actualDate) : null;

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: updateData,
      include: {
        deliveryRoutes: {
          include: {
            stops: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    return updatedShipment;
  }

  async deleteShipment(shipmentId: string): Promise<void> {
    await prisma.shipment.delete({
      where: { id: shipmentId },
    });
  }

  async getDeliveryRoutes(pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const [routes, total] = await Promise.all([
      prisma.deliveryRoute.findMany({
        include: {
          shipment: true,
          stops: {
            orderBy: { timestamp: 'asc' },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deliveryRoute.count(),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: routes,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async createDeliveryRoute(data: any): Promise<any> {
    // Verify shipment exists
    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId },
    });

    if (!shipment) {
      throw createAppError('Shipment not found', 404, 'SHIPMENT_NOT_FOUND');
    }

    const newRoute = await prisma.deliveryRoute.create({
      data: {
        shipmentId: data.shipmentId,
        sequence: data.sequence || 1,
      },
      include: {
        shipment: true,
        stops: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return newRoute;
  }

  async updateRouteStop(stopId: string, data: any): Promise<any> {
    const updateData: any = {};

    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.timestamp !== undefined) updateData.timestamp = new Date(data.timestamp);

    const updatedStop = await prisma.routeStop.update({
      where: { id: stopId },
      data: updateData,
      include: {
        route: {
          include: {
            shipment: true,
            stops: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    return updatedStop;
  }
}

export const logisticsService = new LogisticsService();
