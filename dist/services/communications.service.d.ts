import { PaginationParams, PaginatedResponse } from '../types';
export declare class CommunicationsService {
    createConversation(data: {
        subject: string;
        participantIds: string[];
        createdById: string;
    }): Promise<any>;
    getConversationById(conversationId: string): Promise<any>;
    getConversations(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateConversation(conversationId: string, data: {
        subject?: string;
        status?: string;
    }): Promise<any>;
    deleteConversation(conversationId: string): Promise<void>;
    addParticipant(conversationId: string, userId: string): Promise<any>;
    removeParticipant(conversationId: string, userId: string): Promise<void>;
    sendMessage(conversationId: string, userId: string, content: string): Promise<any>;
    getMessages(conversationId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateMessage(messageId: string, content: string): Promise<any>;
    createNotification(data: {
        userId: string;
        type: 'CASE_ASSIGNED' | 'CASE_COMPLETED' | 'PAYMENT_RECEIVED' | 'INVOICE_ISSUED' | 'MESSAGE_RECEIVED' | 'INVENTORY_LOW' | 'APPOINTMENT_REMINDER' | 'SCHEDULE_CHANGE';
        title: string;
        message: string;
        relatedId?: string;
    }): Promise<any>;
    getNotifications(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    markNotificationAsRead(notificationId: string): Promise<any>;
    deleteNotification(notificationId: string): Promise<void>;
}
export declare const communicationsService: CommunicationsService;
//# sourceMappingURL=communications.service.d.ts.map