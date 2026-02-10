import { Response } from 'express';
import { z } from 'zod';
import { communicationsService } from '../services/communications.service';
import { asyncHandler, createAppError } from '../middleware/errorHandler';
import { AuthRequest, SuccessResponse, PaginatedResponse } from '../types';
import { getPaginationParams } from '../types';

// Validation schemas
const createConversationSchema = z.object({
  subject: z.string().min(1, 'Conversation subject is required'),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required'),
});

const updateConversationSchema = z.object({
  subject: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'ARCHIVED']).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

const createNotificationSchema = z.object({
  type: z.enum(['CASE_ASSIGNED', 'CASE_COMPLETED', 'PAYMENT_RECEIVED', 'INVOICE_ISSUED', 'MESSAGE_RECEIVED', 'INVENTORY_LOW', 'APPOINTMENT_REMINDER', 'SCHEDULE_CHANGE']),
  title: z.string().min(1, 'Notification title is required'),
  message: z.string().min(1, 'Notification message is required'),
  relatedId: z.string().optional(),
});

export class CommunicationsController {
  // Conversation routes
  createConversation = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const validatedData = createConversationSchema.parse(req.body);

    const conversation = await communicationsService.createConversation({
      ...validatedData,
      createdById: req.user.id,
    });

    const response: SuccessResponse<typeof conversation> = {
      success: true,
      message: 'Conversation created successfully',
      data: conversation,
    };

    res.status(201).json(response);
  });

  getConversations = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const result = await communicationsService.getConversations(req.user.id, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getConversationById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const conversation = await communicationsService.getConversationById(id);

    const response: SuccessResponse<typeof conversation> = {
      success: true,
      data: conversation,
    };

    res.status(200).json(response);
  });

  updateConversation = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const validatedData = updateConversationSchema.parse(req.body);

    const conversation = await communicationsService.updateConversation(id, validatedData);

    const response: SuccessResponse<typeof conversation> = {
      success: true,
      message: 'Conversation updated successfully',
      data: conversation,
    };

    res.status(200).json(response);
  });

  deleteConversation = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await communicationsService.deleteConversation(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Conversation deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  // Participant routes
  addParticipant = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw createAppError('User ID is required', 400, 'USER_ID_REQUIRED');
    }

    const participant = await communicationsService.addParticipant(id, userId);

    const response: SuccessResponse<typeof participant> = {
      success: true,
      message: 'Participant added successfully',
      data: participant,
    };

    res.status(201).json(response);
  });

  removeParticipant = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id, participantId } = req.params;

    await communicationsService.removeParticipant(id, participantId);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Participant removed successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });

  // Message routes
  sendMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const validatedData = sendMessageSchema.parse(req.body);

    const message = await communicationsService.sendMessage(id, req.user.id, validatedData.content);

    const response: SuccessResponse<typeof message> = {
      success: true,
      message: 'Message sent successfully',
      data: message,
    };

    res.status(201).json(response);
  });

  getMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const pagination = getPaginationParams(String(page), String(limit));

    const result = await communicationsService.getMessages(id, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  updateMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    const validatedData = updateMessageSchema.parse(req.body);

    const message = await communicationsService.updateMessage(messageId, validatedData.content);

    const response: SuccessResponse<typeof message> = {
      success: true,
      message: 'Message updated successfully',
      data: message,
    };

    res.status(200).json(response);
  });

  // Notification routes
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw createAppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const pagination = getPaginationParams(String(page), String(limit));

    const result = await communicationsService.getNotifications(req.user.id, pagination);

    const response: SuccessResponse<PaginatedResponse<typeof result.data[0]>> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  markNotificationAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const notification = await communicationsService.markNotificationAsRead(id);

    const response: SuccessResponse<typeof notification> = {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };

    res.status(200).json(response);
  });

  deleteNotification = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await communicationsService.deleteNotification(id);

    const response: SuccessResponse<null> = {
      success: true,
      message: 'Notification deleted successfully',
      data: null as any,
    };

    res.status(200).json(response);
  });
}

export const communicationsController = new CommunicationsController();
