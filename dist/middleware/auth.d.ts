import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (...requiredRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const extractToken: (req: AuthRequest) => string | null;
export declare const generateToken: (userId: string, email: string, roles: string[], expiresIn?: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
};
//# sourceMappingURL=auth.d.ts.map