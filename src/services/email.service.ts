import env from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    // In production, use nodemailer or similar
    if (!env.SMTP_HOST) {
      console.log('[EMAIL] Simulated email sent:', {
        to: options.to,
        subject: options.subject,
      });
      return;
    }

    try {
      // Placeholder for actual email sending implementation
      // Using nodemailer, SendGrid, AWS SES, etc.
      console.log('[EMAIL] Email would be sent via SMTP');
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error);
      throw error;
    }
  }

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

  async sendInvoiceEmail(email: string, invoiceNumber: string, amount: string): Promise<void> {
    const html = `
      <h2>Invoice Generated</h2>
      <p>Your invoice has been generated.</p>
      <p>Invoice Number: <strong>${invoiceNumber}</strong></p>
      <p>Amount Due: <strong>${amount}</strong></p>
      <p>Please review and process payment as soon as possible.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Invoice: ${invoiceNumber}`,
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

  async sendInventoryAlertEmail(email: string, itemName: string, currentStock: number, minStock: number): Promise<void> {
    const html = `
      <h2>Inventory Alert</h2>
      <p>Stock level for <strong>${itemName}</strong> is below minimum.</p>
      <p>Current Stock: ${currentStock}</p>
      <p>Minimum Stock: ${minStock}</p>
      <p>Please order additional inventory.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Low Inventory Alert: ${itemName}`,
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
