import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware, requireAuth);

// Invoice routes
router.post('/invoices', billingController.createInvoice);
router.get('/invoices', billingController.getInvoices);
router.get('/invoices/:id', billingController.getInvoiceById);
router.put('/invoices/:id', billingController.updateInvoice);
router.delete('/invoices/:id', billingController.deleteInvoice);

// Payment routes
router.post('/invoices/:invoiceId/payments', billingController.createPayment);
router.get('/invoices/:invoiceId/payments', billingController.getPayments);

// Billing statistics
router.get('/stats/billing', billingController.getBillingStats);

export default router;
