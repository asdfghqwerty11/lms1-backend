export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    cc?: string[];
    bcc?: string[];
}
export declare class EmailService {
    private isResendConfigured;
    sendEmail(options: EmailOptions): Promise<void>;
    sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void>;
    sendWelcomeEmail(to: string, userName: string, tempPassword?: string): Promise<void>;
    sendCaseStatusUpdate(to: string, dentistName: string, caseNumber: string, newStatus: string, patientName: string): Promise<void>;
    sendCaseSubmissionConfirmation(to: string, dentistName: string, caseNumber: string, patientName: string): Promise<void>;
    sendInvoiceEmail(to: string, dentistName: string, invoiceNumber: string, amount: number, dueDate: string): Promise<void>;
    sendLowStockAlert(to: string, itemName: string, currentQuantity: number, minQuantity: number): Promise<void>;
    sendShipmentUpdate(to: string, recipientName: string, trackingNumber: string, status: string, estimatedDelivery?: string): Promise<void>;
    sendCaseAssignmentEmail(email: string, caseName: string, caseNumber: string): Promise<void>;
    sendCaseCompletionEmail(email: string, caseName: string, caseNumber: string): Promise<void>;
    sendPaymentConfirmationEmail(email: string, invoiceNumber: string, amount: string): Promise<void>;
    sendAppointmentReminderEmail(email: string, appointmentType: string, scheduledDate: string): Promise<void>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=email.service.d.ts.map