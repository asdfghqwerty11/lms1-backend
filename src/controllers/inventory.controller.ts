import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

const createInventoryItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required').toUpperCase(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().nonnegative(),
  minStock: z.number().int().positive(),
  maxStock: z.number().int().positive(),
  unitPrice: z.number().positive(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
});

const updateInventoryItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  minStock: z.number().int().positive().optional(),
  maxStock: z.number().int().positive().optional(),
  unitPrice: z.number().positive().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
});

const inventoryTransactionSchema = z.object({
  type: z.enum(['PURCHASE', 'USAGE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'EXPIRY']),
  quantity: z.number().int().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export class InventoryController {
  createItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createInventoryItemSchema.parse(req.body);

    // Check if SKU already exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingItem) {
      throw createAppError('SKU already exists', 400, 'DUPLICATE_SKU');
    }

    const item = await prisma.inventoryItem.create({
      data: validatedData,
    });

    const response: SuccessResponse<typeof item> = {
      success: true,
      message: 'Inventory item created successfully',
      data: item,
    };

    res.status(201).json(response);
  });

  getItems = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const where: any = {};

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.search) {
      where.OR = [
        { sku: { contains: (req.query.search as string).toUpperCase(), mode: 'insensitive' } },
        { name: { contains: req.query.search as string, mode: 'insensitive' } },
      ];
    }

    if (req.query.lowStock === 'true') {
      where.quantity = { lte: prisma.inventoryItem.fields.minStock };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    const response: SuccessResponse<PaginatedResponse<typeof items[0]>> = {
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

  getItemById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw createAppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    const response: SuccessResponse<typeof item> = {
      success: true,
      data: item,
    };

    res.status(200).json(response);
  });

  updateItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateInventoryItemSchema.parse(req.body);

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: validatedData,
    });

    const response: SuccessResponse<typeof item> = {
      success: true,
      message: 'Item updated successfully',
      data: item,
    };

    res.status(200).json(response);
  });

  deleteItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await prisma.inventoryItem.delete({
      where: { id },
    });

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Item deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  recordTransaction = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = inventoryTransactionSchema.parse(req.body);

    // Get current item
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw createAppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    // Calculate new quantity
    let newQuantity = item.quantity;
    if (validatedData.type === 'PURCHASE' || validatedData.type === 'RETURN') {
      newQuantity += validatedData.quantity;
    } else {
      newQuantity -= validatedData.quantity;
    }

    if (newQuantity < 0) {
      throw createAppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    // Record transaction and update inventory
    const [transaction] = await Promise.all([
      prisma.inventoryTransaction.create({
        data: {
          itemId: id,
          type: validatedData.type,
          quantity: validatedData.quantity,
          reference: validatedData.reference,
          notes: validatedData.notes,
        },
      }),
      prisma.inventoryItem.update({
        where: { id },
        data: { quantity: newQuantity },
      }),
    ]);

    const response: SuccessResponse<typeof transaction> = {
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
    };

    res.status(201).json(response);
  });

  getTransactions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where: { itemId: id },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryTransaction.count({ where: { itemId: id } }),
    ]);

    const response: SuccessResponse<PaginatedResponse<typeof transactions[0]>> = {
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

  getLowStockItems = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const items = await prisma.inventoryItem.findMany({
      where: {
        quantity: { lte: prisma.inventoryItem.fields.minStock },
      },
      orderBy: { quantity: 'asc' },
    });

    const response: SuccessResponse<typeof items> = {
      success: true,
      data: items,
    };

    res.status(200).json(response);
  });

  getInventoryStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const items = await prisma.inventoryItem.findMany();

    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + item.quantity * item.unitPrice.toNumber(), 0),
      lowStockCount: items.filter((item) => item.quantity <= item.minStock).length,
      overstockCount: items.filter((item) => item.quantity > item.maxStock).length,
      categories: [...new Set(items.map((item) => item.category))].length,
    };

    const response: SuccessResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });
}

export const inventoryController = new InventoryController();
