import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { generateInvoiceNumber, getPaginationParams } from '../utils/helpers';

const createInvoiceSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  dentistId: z.string().min(1, 'Dentist ID is required'),
  amount: z.number().positive('Amount must be positive'),
  tax: z.number().nonnegative().optional(),
  dueDate: z.string().datetime('Invalid date format'),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'CASH', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export class BillingController {
  createInvoice = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const validatedData = createInvoiceSchema.parse(req.body);

    const invoiceNumber = generateInvoiceNumber();
    const itemsTotal = validatedData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = validatedData.tax || 0;
    const total = itemsTotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        caseId: validatedData.caseId,
        dentistId: validatedData.dentistId,
        amount: itemsTotal,
        tax,
        total,
        dueDate: new Date(validatedData.dueDate),
        description: validatedData.description,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const response: SuccessResponse<typeof invoice> = {
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    };

    res.status(201).json(response);
  });

  getInvoices = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const where: any = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.dentistId) {
      where.dentistId = req.query.dentistId;
    }

    if (req.query.caseId) {
      where.caseId = req.query.caseId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { items: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    const response: SuccessResponse<PaginatedResponse<typeof invoices[0]>> = {
      success: true,
      data: {
        data: invoices,
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

  getInvoiceById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw createAppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
    }

    const response: SuccessResponse<typeof invoice> = {
      success: true,
      data: invoice,
    };

    res.status(200).json(response);
  });

  updateInvoice = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateInvoiceSchema.parse(req.body);

    const updateData: any = {};

    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.dueDate !== undefined) updateData.dueDate = new Date(validatedData.dueDate);
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    const response: SuccessResponse<typeof invoice> = {
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    };

    res.status(200).json(response);
  });

  deleteInvoice = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id },
    });

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Invoice deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  createPayment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { invoiceId } = req.params;
    const validatedData = createPaymentSchema.parse(req.body);

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw createAppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: validatedData.amount,
        method: validatedData.method,
        reference: validatedData.reference,
        notes: validatedData.notes,
      },
    });

    // Check if invoice is fully paid
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0) + validatedData.amount;

    if (totalPaid >= invoice.total.toNumber()) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidDate: new Date() },
      });
    }

    const response: SuccessResponse<typeof payment> = {
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    };

    res.status(201).json(response);
  });

  getPayments = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { invoiceId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });

    const response: SuccessResponse<typeof payments> = {
      success: true,
      data: payments,
    };

    res.status(200).json(response);
  });

  getBillingStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const dentistId = req.query.dentistId as string | undefined;

    const where = dentistId ? { dentistId } : {};

    const [invoices, paidAmount, pendingAmount] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { ...where, status: { in: ['ISSUED', 'SENT', 'OVERDUE'] } },
        _sum: { total: true },
      }),
    ]);

    const stats = {
      totalInvoices: invoices,
      paidAmount: paidAmount._sum.total?.toNumber() || 0,
      pendingAmount: pendingAmount._sum.total?.toNumber() || 0,
    };

    const response: SuccessResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  });
}

export const billingController = new BillingController();
