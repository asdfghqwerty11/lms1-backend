export declare const emailTemplates: {
    passwordReset: (resetUrl: string, userName: string) => {
        subject: string;
        html: string;
    };
    welcome: (userName: string, tempPassword?: string) => {
        subject: string;
        html: string;
    };
    caseStatusUpdate: (dentistName: string, caseNumber: string, newStatus: string, patientName: string) => {
        subject: string;
        html: string;
    };
    caseSubmissionConfirmation: (dentistName: string, caseNumber: string, patientName: string) => {
        subject: string;
        html: string;
    };
    invoiceNotification: (dentistName: string, invoiceNumber: string, amount: number, dueDate: string) => {
        subject: string;
        html: string;
    };
    lowStockAlert: (itemName: string, currentQuantity: number, minQuantity: number) => {
        subject: string;
        html: string;
    };
    shipmentUpdate: (recipientName: string, trackingNumber: string, status: string, estimatedDelivery?: string) => {
        subject: string;
        html: string;
    };
};
//# sourceMappingURL=emailTemplates.d.ts.map