"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createAppError = exports.errorHandler = void 0;
const env_1 = __importDefault(require("../config/env"));
const errorHandler = (error, _req, res, _next) => {
    const isDevelopment = env_1.default.NODE_ENV === 'development';
    // Log error
    console.error('[ERROR]', {
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
        code: error.code,
    });
    // Handle AppError
    if (isAppError(error)) {
        const errorResponse = {
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
        const errorResponse = {
            success: false,
            message: 'Invalid request format',
            code: 'SYNTAX_ERROR',
            details: isDevelopment ? error.message : undefined,
        };
        res.status(400).json(errorResponse);
        return;
    }
    // Generic error response
    const errorResponse = {
        success: false,
        message: isDevelopment ? error.message : 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: isDevelopment ? error.stack : undefined,
    };
    res.status(500).json(errorResponse);
};
exports.errorHandler = errorHandler;
function isAppError(error) {
    return 'statusCode' in error && 'code' in error;
}
// Utility to create AppError
const createAppError = (message, statusCode = 500, code = 'ERROR', details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
};
exports.createAppError = createAppError;
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map