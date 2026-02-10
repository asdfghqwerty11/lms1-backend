import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import {
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class CommunicationsService {
  // Conversation management
  async createConversation(data: {
    subject: string;
    participantIds: string[];
    createdById: string;
  }): Promise<any> {
    // Verify all participants exist
    const users = await prisma.user.findMany({
      where: { id: { in: data.participantIds } },
    });

    if (users.length !== data.participantIds.length) {
      throw createAppError('One or more participants not found', 404, 'PARTICIPANT_NOT_FOUND');
    }

    // Verify creator exists
    const creator = await prisma.user.findUnique({
      where: { id: data.createdById },
    });

    if (!creator) {
      throw createAppError('Creator user not found', 404, 'USER_NOT_FOUND');
    }

    const conversation = await prisma.conversation.create({
      data: {
        subject: data.subject,
        createdById: data.createdById,
        participants: {
          createMany: {
            data: data.participantIds.map((userId) => ({
              userId,
              joinedAt: new Date(),
            })),
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            user: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return conversation;
  }

  async getConversationById(conversationId: string): Promise<any> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!conversation) {
      throw createAppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    return conversation;
  }

  async getConversations(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              user: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.conversation.count({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: conversations,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async updateConversation(
    conversationId: string,
    data: {
      subject?: string;
      status?: string;
    }
  ): Promise<any> {
    const updateData: any = {};

    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.status !== undefined) updateData.status = data.status as any;

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw createAppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  // Participant management
  async addParticipant(conversationId: string, userId: string): Promise<any> {
    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw createAppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createAppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if already a participant
    const existing = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (existing) {
      throw createAppError('User is already a participant', 400, 'ALREADY_PARTICIPANT');
    }

    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId,
        joinedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return participant;
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw createAppError('Participant not found', 404, 'PARTICIPANT_NOT_FOUND');
    }

    await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });
  }

  // Message management
  async sendMessage(
    conversationId: string,
    userId: string,
    content: string
  ): Promise<any> {
    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw createAppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    // Verify sender is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw createAppError('User is not a participant in this conversation', 403, 'NOT_PARTICIPANT');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        userId,
        content,
      },
      include: {
        user: true,
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(
    conversationId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw createAppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          user: true,
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({
        where: { conversationId },
      }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: messages.reverse(),
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async updateMessage(
    messageId: string,
    content: string
  ): Promise<any> {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return message;
  }

  // Notification management
  async createNotification(data: {
    userId: string;
    type: 'CASE_ASSIGNED' | 'CASE_COMPLETED' | 'PAYMENT_RECEIVED' | 'INVOICE_ISSUED' | 'MESSAGE_RECEIVED' | 'INVENTORY_LOW' | 'APPOINTMENT_REMINDER' | 'SCHEDULE_CHANGE';
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<any> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw createAppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
      },
    });

    return notification;
  }

  async getNotifications(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    const pages = Math.ceil(total / pagination.limit);

    return {
      data: notifications,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages,
      },
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return notification;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw createAppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}

export const communicationsService = new CommunicationsService();
