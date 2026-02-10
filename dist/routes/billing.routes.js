"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = require("../controllers/billing.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Invoice routes
router.post('/invoices', billing_controller_1.billingController.createInvoice);
router.get('/invoices', billing_controller_1.billingController.getInvoices);
router.get('/invoices/:id', billing_controller_1.billingController.getInvoiceById);
router.put('/invoices/:id', billing_controller_1.billingController.updateInvoice);
router.delete('/invoices/:id', billing_controller_1.billingController.deleteInvoice);
// Payment routes
router.post('/invoices/:invoiceId/payments', billing_controller_1.billingController.createPayment);
router.get('/invoices/:invoiceId/payments', billing_controller_1.billingController.getPayments);
// Billing statistics
router.get('/stats/billing', billing_controller_1.billingController.getBillingStats);
exports.default = router;
//# sourceMappingURL=billing.routes.js.map