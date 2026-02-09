import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ErrorResponse } from '../types';

export interface ValidateOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate =
  (options: ValidateOptions) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      if (options.params) {
        req.params = options.params.parse(req.params);
      }

      if (options.query) {
        req.query = options.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        };

        res.status(400).json(errorResponse);
        return;
      }

      next(error);
    }
  };

// Validation schemas can be exported here for reuse
export const createValidationMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        };

        res.status(400).json(errorResponse);
        return;
      }

      next(error);
    }
  };
};
