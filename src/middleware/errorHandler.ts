import { Request, Response, NextFunction } from 'express';
import env from '../config/env';
import { ErrorResponse, AppError } from '../types';

export const errorHandler = (error: Error | AppError, _req: Request, res: Response, _next: NextFunction): void => {
  const isDevelopment = env.NODE_ENV === 'development';

  // Log error
  console.error('[ERROR]', {
    message: error.message,
    stack: isDevelopment ? error.stack : undefined,
    code: (error as AppError).code,
  });

  // Handle AppError
  if (isAppError(error)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message,
      code: error.code,
      details: isDevelopment ? error.details : undefined,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle specific error types
  if (error instanceof SyntaxError) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Invalid request format',
      code: 'SYNTAX_ERROR',
      details: isDevelopment ? error.message : undefined,
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Generic error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: isDevelopment ? error.message : 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    details: isDevelopment ? error.stack : undefined,
  };

  res.status(500).json(errorResponse);
};

function isAppError(error: Error | AppError): error is AppError {
  return 'statusCode' in error && 'code' in error;
}

// Utility to create AppError
export const createAppError = (message: string, statusCode: number = 500, code: string = 'ERROR', details?: unknown): AppError => {
  const error: AppError = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

// Async error wrapper
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
