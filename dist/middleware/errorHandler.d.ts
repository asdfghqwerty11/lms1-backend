import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
export declare const errorHandler: (error: Error | AppError, _req: Request, res: Response, _next: NextFunction) => void;
export declare const createAppError: (message: string, statusCode?: number, code?: string, details?: unknown) => AppError;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map