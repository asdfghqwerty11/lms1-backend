"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const resend_1 = require("resend");
const env_1 = __importDefault(require("../config/env"));
const emailTemplates_1 = require("../utils/emailTemplates");
// Initialize Resend client
const resend = new resend_1.Resend(env_1.default.RESEND_API_KEY || '');
const FROM_EMAIL = env_1.default.FROM_EMAIL || 'noreply@dentalkart.com';
const APP_NAME = 'DentNode by DentalKart';
class EmailService {
    isResendConfigured() {
        return !!env_1.default.RESEND_API_KEY;
    }
    async sendEmail(options) {
        try {
            if (!this.isResendConfigured()) {
                console.warn('[EMAIL] Resend API key not configured. Email simulation mode.');
                console.log('[EMAIL] Simulated email sent:', {
                    to: options.to,
                    subject: options.subject,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            await resend.emails.send({
                from: FROM_EMAIL,
                to: options.to,
                subject: options.subject,
                html: options.html,
                cc: options.cc,
                bcc: options.bcc,
            });
            console.log('[EMAIL] Email sent successfully:', {
                to: options.to,
                subject: options.subject,
            });
        }
        catch (error) {
            console.error('[EMAIL] Failed to send email:', error);
            throw error;
        }
    }
    // Password reset email
    async sendPasswordResetEmail(to, resetToken, userName) {
        const resetUrl = `${env_1.default.FRONTEND_URL || 'https://dentalkart.com'}/reset-password?token=${resetToken}`;
        const template = emailTemplates_1.emailTemplates.passwordReset(resetUrl, userName);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // Welcome email for new users
    async sendWelcomeEmail(to, userName, tempPassword) {
        const template = emailTemplates_1.emailTemplates.welcome(userName, tempPassword);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // Case status update notification
    async sendCaseStatusUpdate(to, dentistName, caseNumber, newStatus, patientName) {
        const template = emailTemplates_1.emailTemplates.caseStatusUpdate(dentistName, caseNumber, newStatus, patientName);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // New case submission confirmation
    async sendCaseSubmissionConfirmation(to, dentistName, caseNumber, patientName) {
        const template = emailTemplates_1.emailTemplates.caseSubmissionConfirmation(dentistName, caseNumber, patientName);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // Invoice notification
    async sendInvoiceEmail(to, dentistName, invoiceNumber, amount, dueDate) {
        const template = emailTemplates_1.emailTemplates.invoiceNotification(dentistName, invoiceNumber, amount, dueDate);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // Low stock alert (to lab managers)
    async sendLowStockAlert(to, itemName, currentQuantity, minQuantity) {
        const template = emailTemplates_1.emailTemplates.lowStockAlert(itemName, currentQuantity, minQuantity);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // Shipment tracking update
    async sendShipmentUpdate(to, recipientName, trackingNumber, status, estimatedDelivery) {
        const template = emailTemplates_1.emailTemplates.shipmentUpdate(recipientName, trackingNumber, status, estimatedDelivery);
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    // Legacy email methods for backward compatibility
    async sendCaseAssignmentEmail(email, caseName, caseNumber) {
        const html = `
      <h2>Case Assignment</h2>
      <p>You have been assigned to case: <strong>${caseName}</strong></p>
      <p>Case Number: ${caseNumber}</p>
      <p>Please log in to the system to view details.</p>
    `;
        await this.sendEmail({
            to: email,
            subject: `New Case Assignment: ${caseNumber}`,
            html,
        });
    }
    async sendCaseCompletionEmail(email, caseName, caseNumber) {
        const html = `
      <h2>Case Completed</h2>
      <p>Case <strong>${caseName}</strong> has been completed.</p>
      <p>Case Number: ${caseNumber}</p>
      <p>You can now review and deliver the completed case.</p>
    `;
        await this.sendEmail({
            to: email,
            subject: `Case Completed: ${caseNumber}`,
            html,
        });
    }
    async sendPaymentConfirmationEmail(email, invoiceNumber, amount) {
        const html = `
      <h2>Payment Received</h2>
      <p>Thank you for your payment.</p>
      <p>Invoice Number: <strong>${invoiceNumber}</strong></p>
      <p>Amount Received: <strong>${amount}</strong></p>
      <p>Your payment has been processed successfully.</p>
    `;
        await this.sendEmail({
            to: email,
            subject: `Payment Confirmation: ${invoiceNumber}`,
            html,
        });
    }
    async sendAppointmentReminderEmail(email, appointmentType, scheduledDate) {
        const html = `
      <h2>Appointment Reminder</h2>
      <p>You have an upcoming ${appointmentType}.</p>
      <p>Scheduled Date: <strong>${scheduledDate}</strong></p>
      <p>Please confirm your attendance.</p>
    `;
        await this.sendEmail({
            to: email,
            subject: `Appointment Reminder: ${appointmentType}`,
            html,
        });
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map