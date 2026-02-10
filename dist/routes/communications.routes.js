"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communications_controller_1 = require("../controllers/communications.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Conversation CRUD
router.post('/conversations', communications_controller_1.communicationsController.createConversation);
router.get('/conversations', communications_controller_1.communicationsController.getConversations);
router.get('/conversations/:id', communications_controller_1.communicationsController.getConversationById);
router.put('/conversations/:id', communications_controller_1.communicationsController.updateConversation);
router.delete('/conversations/:id', communications_controller_1.communicationsController.deleteConversation);
// Participant management
router.post('/conversations/:id/participants', communications_controller_1.communicationsController.addParticipant);
router.delete('/conversations/:id/participants/:participantId', communications_controller_1.communicationsController.removeParticipant);
// Message management
router.post('/conversations/:id/messages', communications_controller_1.communicationsController.sendMessage);
router.get('/conversations/:id/messages', communications_controller_1.communicationsController.getMessages);
router.put('/messages/:messageId', communications_controller_1.communicationsController.updateMessage);
// Notification management
router.get('/notifications', communications_controller_1.communicationsController.getNotifications);
router.put('/notifications/:id', communications_controller_1.communicationsController.markNotificationAsRead);
router.delete('/notifications/:id', communications_controller_1.communicationsController.deleteNotification);
exports.default = router;
//# sourceMappingURL=communications.routes.js.map