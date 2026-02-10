"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingController = exports.BillingController = void 0;
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const helpers_1 = require("../utils/helpers");
const createInvoiceSchema = zod_1.z.object({
    caseId: zod_1.z.string().min(1, 'Case ID is required'),
    dentistId: zod_1.z.string().min(1, 'Dentist ID is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    tax: zod_1.z.number().nonnegative().optional(),
    dueDate: zod_1.z.string().datetime('Invalid date format'),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string().min(1),
        quantity: zod_1.z.number().int().positive(),
        unitPrice: zod_1.z.number().positive(),
    })),
    description: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const updateInvoiceSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'ISSUED', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const createPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be positive'),
    method: zod_1.z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'CASH', 'OTHER']),
    reference: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
class BillingController {
    constructor() {
        this.createInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createInvoiceSchema.parse(req.body);
            const invoiceNumber = (0, helpers_1.generateInvoiceNumber)();
            const itemsTotal = validatedData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            const tax = validatedData.tax || 0;
            const total = itemsTotal + tax;
            const invoice = await database_1.prisma.invoice.create({
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
            const response = {
                success: true,
                message: 'Invoice created successfully',
                data: invoice,
            };
            res.status(201).json(response);
        });
        this.getInvoices = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, helpers_1.getPaginationParams)(String(page), String(limit));
            const where = {};
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
                database_1.prisma.invoice.findMany({
                    where,
                    include: { items: true },
                    skip: pagination.skip,
                    take: pagination.limit,
                    orderBy: { createdAt: 'desc' },
                }),
                database_1.prisma.invoice.count({ where }),
            ]);
            const response = {
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
        this.getInvoiceById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const invoice = await database_1.prisma.invoice.findUnique({
                where: { id },
                include: {
                    items: true,
                    payments: true,
                },
            });
            if (!invoice) {
                throw (0, errorHandler_1.createAppError)('Invoice not found', 404, 'INVOICE_NOT_FOUND');
            }
            const response = {
                success: true,
                data: invoice,
            };
            res.status(200).json(response);
        });
        this.updateInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateInvoiceSchema.parse(req.body);
            const updateData = {};
            if (validatedData.status !== undefined)
                updateData.status = validatedData.status;
            if (validatedData.dueDate !== undefined)
                updateData.dueDate = new Date(validatedData.dueDate);
            if (validatedData.description !== undefined)
                updateData.description = validatedData.description;
            if (validatedData.notes !== undefined)
                updateData.notes = validatedData.notes;
            const invoice = await database_1.prisma.invoice.update({
                where: { id },
                data: updateData,
                include: { items: true },
            });
            const response = {
                success: true,
                message: 'Invoice updated successfully',
                data: invoice,
            };
            res.status(200).json(response);
        });
        this.deleteInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await database_1.prisma.invoice.delete({
                where: { id },
            });
            const response = {
                success: true,
                message: 'Invoice deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.createPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { invoiceId } = req.params;
            const validatedData = createPaymentSchema.parse(req.body);
            // Verify invoice exists
            const invoice = await database_1.prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { payments: true },
            });
            if (!invoice) {
                throw (0, errorHandler_1.createAppError)('Invoice not found', 404, 'INVOICE_NOT_FOUND');
            }
            const payment = await database_1.prisma.payment.create({
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
                await database_1.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: { status: 'PAID', paidDate: new Date() },
                });
            }
            const response = {
                success: true,
                message: 'Payment recorded successfully',
                data: payment,
            };
            res.status(201).json(response);
        });
        this.getPayments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { invoiceId } = req.params;
            const payments = await database_1.prisma.payment.findMany({
                where: { invoiceId },
                orderBy: { createdAt: 'desc' },
            });
            const response = {
                success: true,
                data: payments,
            };
            res.status(200).json(response);
        });
        this.getBillingStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const dentistId = req.query.dentistId;
            const where = dentistId ? { dentistId } : {};
            const [invoices, paidAmount, pendingAmount] = await Promise.all([
                database_1.prisma.invoice.count({ where }),
                database_1.prisma.invoice.aggregate({
                    where: { ...where, status: 'PAID' },
                    _sum: { total: true },
                }),
                database_1.prisma.invoice.aggregate({
                    where: { ...where, status: { in: ['ISSUED', 'SENT', 'OVERDUE'] } },
                    _sum: { total: true },
                }),
            ]);
            const stats = {
                totalInvoices: invoices,
                paidAmount: paidAmount._sum.total?.toNumber() || 0,
                pendingAmount: pendingAmount._sum.total?.toNumber() || 0,
            };
            const response = {
                success: true,
                data: stats,
            };
            res.status(200).json(response);
        });
    }
}
exports.BillingController = BillingController;
exports.billingController = new BillingController();
//# sourceMappingURL=billing.controller.js.map