import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export interface ValidateOptions {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}
export declare const validate: (options: ValidateOptions) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createValidationMiddleware: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map