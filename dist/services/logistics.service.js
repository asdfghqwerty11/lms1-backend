"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logisticsService = exports.LogisticsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class LogisticsService {
    async createShipment(data) {
        // Verify case exists
        const caseData = await database_1.prisma.case.findUnique({
            where: { id: data.caseId },
        });
        if (!caseData) {
            throw (0, errorHandler_1.createAppError)('Case not found', 404, 'CASE_NOT_FOUND');
        }
        const newShipment = await database_1.prisma.shipment.create({
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
    async getShipmentById(shipmentId) {
        const shipment = await database_1.prisma.shipment.findUnique({
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
            throw (0, errorHandler_1.createAppError)('Shipment not found', 404, 'SHIPMENT_NOT_FOUND');
        }
        return shipment;
    }
    async getShipments(filters, pagination) {
        const where = {};
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
                { trackingNumber: { contains: filters.search, mode: 'insensitive' } },
                { origin: { contains: filters.search, mode: 'insensitive' } },
                { destination: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [shipments, total] = await Promise.all([
            database_1.prisma.shipment.findMany({
                where: where,
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
            database_1.prisma.shipment.count({ where: where }),
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
    async updateShipment(shipmentId, data) {
        const updateData = {};
        if (data.trackingNumber !== undefined)
            updateData.trackingNumber = data.trackingNumber;
        if (data.carrier !== undefined)
            updateData.carrier = data.carrier;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.origin !== undefined)
            updateData.origin = data.origin;
        if (data.destination !== undefined)
            updateData.destination = data.destination;
        if (data.notes !== undefined)
            updateData.notes = data.notes;
        if (data.estimatedDate !== undefined)
            updateData.estimatedDate = new Date(data.estimatedDate);
        if (data.actualDate !== undefined)
            updateData.actualDate = data.actualDate ? new Date(data.actualDate) : null;
        const updatedShipment = await database_1.prisma.shipment.update({
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
    async deleteShipment(shipmentId) {
        await database_1.prisma.shipment.delete({
            where: { id: shipmentId },
        });
    }
    async getDeliveryRoutes(pagination) {
        const [routes, total] = await Promise.all([
            database_1.prisma.deliveryRoute.findMany({
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
            database_1.prisma.deliveryRoute.count(),
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
    async createDeliveryRoute(data) {
        // Verify shipment exists
        const shipment = await database_1.prisma.shipment.findUnique({
            where: { id: data.shipmentId },
        });
        if (!shipment) {
            throw (0, errorHandler_1.createAppError)('Shipment not found', 404, 'SHIPMENT_NOT_FOUND');
        }
        const newRoute = await database_1.prisma.deliveryRoute.create({
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
    async updateRouteStop(stopId, data) {
        const updateData = {};
        if (data.location !== undefined)
            updateData.location = data.location;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.timestamp !== undefined)
            updateData.timestamp = new Date(data.timestamp);
        const updatedStop = await database_1.prisma.routeStop.update({
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
exports.LogisticsService = LogisticsService;
exports.logisticsService = new LogisticsService();
//# sourceMappingURL=logistics.service.js.map