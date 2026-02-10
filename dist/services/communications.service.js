"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationsService = exports.CommunicationsService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class CommunicationsService {
    // Conversation management
    async createConversation(data) {
        // Verify all participants exist
        const users = await database_1.prisma.user.findMany({
            where: { id: { in: data.participantIds } },
        });
        if (users.length !== data.participantIds.length) {
            throw (0, errorHandler_1.createAppError)('One or more participants not found', 404, 'PARTICIPANT_NOT_FOUND');
        }
        // Verify creator exists
        const creator = await database_1.prisma.user.findUnique({
            where: { id: data.createdById },
        });
        if (!creator) {
            throw (0, errorHandler_1.createAppError)('Creator user not found', 404, 'USER_NOT_FOUND');
        }
        const conversation = await database_1.prisma.conversation.create({
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
    async getConversationById(conversationId) {
        const conversation = await database_1.prisma.conversation.findUnique({
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
            throw (0, errorHandler_1.createAppError)('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        return conversation;
    }
    async getConversations(userId, pagination) {
        const [conversations, total] = await Promise.all([
            database_1.prisma.conversation.findMany({
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
            database_1.prisma.conversation.count({
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
    async updateConversation(conversationId, data) {
        const updateData = {};
        if (data.subject !== undefined)
            updateData.subject = data.subject;
        if (data.status !== undefined)
            updateData.status = data.status;
        const updated = await database_1.prisma.conversation.update({
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
    async deleteConversation(conversationId) {
        const conversation = await database_1.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw (0, errorHandler_1.createAppError)('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        await database_1.prisma.conversation.delete({
            where: { id: conversationId },
        });
    }
    // Participant management
    async addParticipant(conversationId, userId) {
        // Verify conversation exists
        const conversation = await database_1.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw (0, errorHandler_1.createAppError)('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        // Verify user exists
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('User not found', 404, 'USER_NOT_FOUND');
        }
        // Check if already a participant
        const existing = await database_1.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });
        if (existing) {
            throw (0, errorHandler_1.createAppError)('User is already a participant', 400, 'ALREADY_PARTICIPANT');
        }
        const participant = await database_1.prisma.conversationParticipant.create({
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
    async removeParticipant(conversationId, userId) {
        const participant = await database_1.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });
        if (!participant) {
            throw (0, errorHandler_1.createAppError)('Participant not found', 404, 'PARTICIPANT_NOT_FOUND');
        }
        await database_1.prisma.conversationParticipant.delete({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });
    }
    // Message management
    async sendMessage(conversationId, userId, content) {
        // Verify conversation exists
        const conversation = await database_1.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw (0, errorHandler_1.createAppError)('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        // Verify sender is a participant
        const participant = await database_1.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });
        if (!participant) {
            throw (0, errorHandler_1.createAppError)('User is not a participant in this conversation', 403, 'NOT_PARTICIPANT');
        }
        const message = await database_1.prisma.message.create({
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
        await database_1.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async getMessages(conversationId, pagination) {
        // Verify conversation exists
        const conversation = await database_1.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw (0, errorHandler_1.createAppError)('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        const [messages, total] = await Promise.all([
            database_1.prisma.message.findMany({
                where: { conversationId },
                include: {
                    user: true,
                },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.message.count({
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
    async updateMessage(messageId, content) {
        const message = await database_1.prisma.message.update({
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
    async createNotification(data) {
        // Verify user exists
        const user = await database_1.prisma.user.findUnique({
            where: { id: data.userId },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('User not found', 404, 'USER_NOT_FOUND');
        }
        const notification = await database_1.prisma.notification.create({
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
    async getNotifications(userId, pagination) {
        const [notifications, total] = await Promise.all([
            database_1.prisma.notification.findMany({
                where: { userId },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.notification.count({
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
    async markNotificationAsRead(notificationId) {
        const notification = await database_1.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
        return notification;
    }
    async deleteNotification(notificationId) {
        const notification = await database_1.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw (0, errorHandler_1.createAppError)('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
        }
        await database_1.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
}
exports.CommunicationsService = CommunicationsService;
exports.communicationsService = new CommunicationsService();
//# sourceMappingURL=communications.service.js.map