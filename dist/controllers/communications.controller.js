"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationsController = exports.CommunicationsController = void 0;
const zod_1 = require("zod");
const communications_service_1 = require("../services/communications.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createConversationSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1, 'Conversation subject is required'),
    participantIds: zod_1.z.array(zod_1.z.string()).min(1, 'At least one participant is required'),
});
const updateConversationSchema = zod_1.z.object({
    subject: zod_1.z.string().optional(),
    status: zod_1.z.enum(['OPEN', 'CLOSED', 'ARCHIVED']).optional(),
});
const sendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required'),
});
const updateMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required'),
});
const createNotificationSchema = zod_1.z.object({
    type: zod_1.z.enum(['CASE_ASSIGNED', 'CASE_COMPLETED', 'PAYMENT_RECEIVED', 'INVOICE_ISSUED', 'MESSAGE_RECEIVED', 'INVENTORY_LOW', 'APPOINTMENT_REMINDER', 'SCHEDULE_CHANGE']),
    title: zod_1.z.string().min(1, 'Notification title is required'),
    message: zod_1.z.string().min(1, 'Notification message is required'),
    relatedId: zod_1.z.string().optional(),
});
class CommunicationsController {
    constructor() {
        // Conversation routes
        this.createConversation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const validatedData = createConversationSchema.parse(req.body);
            const conversation = await communications_service_1.communicationsService.createConversation({
                ...validatedData,
                createdById: req.user.id,
            });
            const response = {
                success: true,
                message: 'Conversation created successfully',
                data: conversation,
            };
            res.status(201).json(response);
        });
        this.getConversations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await communications_service_1.communicationsService.getConversations(req.user.id, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getConversationById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const conversation = await communications_service_1.communicationsService.getConversationById(id);
            const response = {
                success: true,
                data: conversation,
            };
            res.status(200).json(response);
        });
        this.updateConversation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateConversationSchema.parse(req.body);
            const conversation = await communications_service_1.communicationsService.updateConversation(id, validatedData);
            const response = {
                success: true,
                message: 'Conversation updated successfully',
                data: conversation,
            };
            res.status(200).json(response);
        });
        this.deleteConversation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await communications_service_1.communicationsService.deleteConversation(id);
            const response = {
                success: true,
                message: 'Conversation deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        // Participant routes
        this.addParticipant = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { userId } = req.body;
            if (!userId) {
                throw (0, errorHandler_1.createAppError)('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            const participant = await communications_service_1.communicationsService.addParticipant(id, userId);
            const response = {
                success: true,
                message: 'Participant added successfully',
                data: participant,
            };
            res.status(201).json(response);
        });
        this.removeParticipant = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id, participantId } = req.params;
            await communications_service_1.communicationsService.removeParticipant(id, participantId);
            const response = {
                success: true,
                message: 'Participant removed successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        // Message routes
        this.sendMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const { id } = req.params;
            const validatedData = sendMessageSchema.parse(req.body);
            const message = await communications_service_1.communicationsService.sendMessage(id, req.user.id, validatedData.content);
            const response = {
                success: true,
                message: 'Message sent successfully',
                data: message,
            };
            res.status(201).json(response);
        });
        this.getMessages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 50;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await communications_service_1.communicationsService.getMessages(id, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.updateMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { messageId } = req.params;
            const validatedData = updateMessageSchema.parse(req.body);
            const message = await communications_service_1.communicationsService.updateMessage(messageId, validatedData.content);
            const response = {
                success: true,
                message: 'Message updated successfully',
                data: message,
            };
            res.status(200).json(response);
        });
        // Notification routes
        this.getNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await communications_service_1.communicationsService.getNotifications(req.user.id, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.markNotificationAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const notification = await communications_service_1.communicationsService.markNotificationAsRead(id);
            const response = {
                success: true,
                message: 'Notification marked as read',
                data: notification,
            };
            res.status(200).json(response);
        });
        this.deleteNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await communications_service_1.communicationsService.deleteNotification(id);
            const response = {
                success: true,
                message: 'Notification deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
    }
}
exports.CommunicationsController = CommunicationsController;
exports.communicationsController = new CommunicationsController();
//# sourceMappingURL=communications.controller.js.map