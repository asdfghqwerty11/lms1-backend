"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const createInventoryItemSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1, 'SKU is required').toUpperCase(),
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, 'Category is required'),
    quantity: zod_1.z.number().int().nonnegative(),
    minStock: zod_1.z.number().int().positive(),
    maxStock: zod_1.z.number().int().positive(),
    unitPrice: zod_1.z.number().positive(),
    supplier: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().datetime().optional(),
});
const updateInventoryItemSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().nonnegative().optional(),
    minStock: zod_1.z.number().int().positive().optional(),
    maxStock: zod_1.z.number().int().positive().optional(),
    unitPrice: zod_1.z.number().positive().optional(),
    supplier: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().datetime().optional(),
});
const inventoryTransactionSchema = zod_1.z.object({
    type: zod_1.z.enum(['PURCHASE', 'USAGE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'EXPIRY']),
    quantity: zod_1.z.number().int().positive(),
    reference: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
class InventoryController {
    constructor() {
        this.createItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createInventoryItemSchema.parse(req.body);
            // Check if SKU already exists
            const existingItem = await database_1.prisma.inventoryItem.findUnique({
                where: { sku: validatedData.sku },
            });
            if (existingItem) {
                throw (0, errorHandler_1.createAppError)('SKU already exists', 400, 'DUPLICATE_SKU');
            }
            const item = await database_1.prisma.inventoryItem.create({
                data: validatedData,
            });
            const response = {
                success: true,
                message: 'Inventory item created successfully',
                data: item,
            };
            res.status(201).json(response);
        });
        this.getItems = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const where = {};
            if (req.query.category) {
                where.category = req.query.category;
            }
            if (req.query.search) {
                where.OR = [
                    { sku: { contains: req.query.search.toUpperCase(), mode: 'insensitive' } },
                    { name: { contains: req.query.search, mode: 'insensitive' } },
                ];
            }
            if (req.query.lowStock === 'true') {
                where.quantity = { lte: database_1.prisma.inventoryItem.fields.minStock };
            }
            const [items, total] = await Promise.all([
                database_1.prisma.inventoryItem.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.limit,
                    orderBy: { createdAt: 'desc' },
                }),
                database_1.prisma.inventoryItem.count({ where }),
            ]);
            const response = {
                success: true,
                data: {
                    data: items,
                    pagination: {
                        total,
                        page: pagination.page,
                        limit: pagination.limit,
                        pages: Math.ceil(total / pagination.limit),
                    },
                },
            };
            res.status(200).json(response);
        });
        this.getItemById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const item = await database_1.prisma.inventoryItem.findUnique({
                where: { id },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (!item) {
                throw (0, errorHandler_1.createAppError)('Item not found', 404, 'ITEM_NOT_FOUND');
            }
            const response = {
                success: true,
                data: item,
            };
            res.status(200).json(response);
        });
        this.updateItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateInventoryItemSchema.parse(req.body);
            const item = await database_1.prisma.inventoryItem.update({
                where: { id },
                data: validatedData,
            });
            const response = {
                success: true,
                message: 'Item updated successfully',
                data: item,
            };
            res.status(200).json(response);
        });
        this.deleteItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await database_1.prisma.inventoryItem.delete({
                where: { id },
            });
            const response = {
                success: true,
                message: 'Item deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.recordTransaction = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = inventoryTransactionSchema.parse(req.body);
            // Get current item
            const item = await database_1.prisma.inventoryItem.findUnique({
                where: { id },
            });
            if (!item) {
                throw (0, errorHandler_1.createAppError)('Item not found', 404, 'ITEM_NOT_FOUND');
            }
            // Calculate new quantity
            let newQuantity = item.quantity;
            if (validatedData.type === 'PURCHASE' || validatedData.type === 'RETURN') {
                newQuantity += validatedData.quantity;
            }
            else {
                newQuantity -= validatedData.quantity;
            }
            if (newQuantity < 0) {
                throw (0, errorHandler_1.createAppError)('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
            }
            // Record transaction and update inventory
            const [transaction] = await Promise.all([
                database_1.prisma.inventoryTransaction.create({
                    data: {
                        itemId: id,
                        type: validatedData.type,
                        quantity: validatedData.quantity,
                        reference: validatedData.reference,
                        notes: validatedData.notes,
                    },
                }),
                database_1.prisma.inventoryItem.update({
                    where: { id },
                    data: { quantity: newQuantity },
                }),
            ]);
            const response = {
                success: true,
                message: 'Transaction recorded successfully',
                data: transaction,
            };
            res.status(201).json(response);
        });
        this.getTransactions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const [transactions, total] = await Promise.all([
                database_1.prisma.inventoryTransaction.findMany({
                    where: { itemId: id },
                    skip: pagination.skip,
                    take: pagination.limit,
                    orderBy: { createdAt: 'desc' },
                }),
                database_1.prisma.inventoryTransaction.count({ where: { itemId: id } }),
            ]);
            const response = {
                success: true,
                data: {
                    data: transactions,
                    pagination: {
                        total,
                        page: pagination.page,
                        limit: pagination.limit,
                        pages: Math.ceil(total / pagination.limit),
                    },
                },
            };
            res.status(200).json(response);
        });
        this.getLowStockItems = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const items = await database_1.prisma.inventoryItem.findMany({
                where: {
                    quantity: { lte: database_1.prisma.inventoryItem.fields.minStock },
                },
                orderBy: { quantity: 'asc' },
            });
            const response = {
                success: true,
                data: items,
            };
            res.status(200).json(response);
        });
        this.getInventoryStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const items = await database_1.prisma.inventoryItem.findMany();
            const stats = {
                totalItems: items.length,
                totalValue: items.reduce((sum, item) => sum + item.quantity * item.unitPrice.toNumber(), 0),
                lowStockCount: items.filter((item) => item.quantity <= item.minStock).length,
                overstockCount: items.filter((item) => item.quantity > item.maxStock).length,
                categories: [...new Set(items.map((item) => item.category))].length,
            };
            const response = {
                success: true,
                data: stats,
            };
            res.status(200).json(response);
        });
    }
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
//# sourceMappingURL=inventory.controller.js.map