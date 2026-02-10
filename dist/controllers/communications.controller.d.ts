import { Response } from 'express';
export declare class CommunicationsController {
    createConversation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getConversations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getConversationById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateConversation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteConversation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addParticipant: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    removeParticipant: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    sendMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    markNotificationAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteNotification: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const communicationsController: CommunicationsController;
//# sourceMappingURL=communications.controller.d.ts.map