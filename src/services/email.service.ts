import { Resend } from 'resend';
import env from '../config/env';
import { emailTemplates } from '../utils/emailTemplates';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
}

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY || '');
const FROM_EMAIL = env.FROM_EMAIL || 'noreply@dentalkart.com';
const APP_NAME = 'DentNode by DentalKart';

export class EmailService {
  private isResendConfigured(): boolean {
    return !!env.RESEND_API_KEY;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
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
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error);
      throw error;
    }
  }

  // Password reset email
  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL || 'https://dentalkart.com'}/reset-password?token=${resetToken}`;
    const template = emailTemplates.passwordReset(resetUrl, userName);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // Welcome email for new users
  async sendWelcomeEmail(to: string, userName: string, tempPassword?: string): Promise<void> {
    const template = emailTemplates.welcome(userName, tempPassword);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // Case status update notification
  async sendCaseStatusUpdate(to: string, dentistName: string, caseNumber: string, newStatus: string, patientName: string): Promise<void> {
    const template = emailTemplates.caseStatusUpdate(dentistName, caseNumber, newStatus, patientName);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // New case submission confirmation
  async sendCaseSubmissionConfirmation(to: string, dentistName: string, caseNumber: string, patientName: string): Promise<void> {
    const template = emailTemplates.caseSubmissionConfirmation(dentistName, caseNumber, patientName);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // Invoice notification
  async sendInvoiceEmail(to: string, dentistName: string, invoiceNumber: string, amount: number, dueDate: string): Promise<void> {
    const template = emailTemplates.invoiceNotification(dentistName, invoiceNumber, amount, dueDate);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // Low stock alert (to lab managers)
  async sendLowStockAlert(to: string, itemName: string, currentQuantity: number, minQuantity: number): Promise<void> {
    const template = emailTemplates.lowStockAlert(itemName, currentQuantity, minQuantity);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // Shipment tracking update
  async sendShipmentUpdate(to: string, recipientName: string, trackingNumber: string, status: string, estimatedDelivery?: string): Promise<void> {
    const template = emailTemplates.shipmentUpdate(recipientName, trackingNumber, status, estimatedDelivery);

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  // Legacy email methods for backward compatibility
  async sendCaseAssignmentEmail(email: string, caseName: string, caseNumber: string): Promise<void> {
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

  async sendCaseCompletionEmail(email: string, caseName: string, caseNumber: string): Promise<void> {
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

  async sendPaymentConfirmationEmail(email: string, invoiceNumber: string, amount: string): Promise<void> {
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

  async sendAppointmentReminderEmail(email: string, appointmentType: string, scheduledDate: string): Promise<void> {
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

export const emailService = new EmailService();
