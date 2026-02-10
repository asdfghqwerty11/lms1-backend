"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationMiddleware = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (options) => (req, res, next) => {
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
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errorResponse = {
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
exports.validate = validate;
// Validation schemas can be exported here for reuse
const createValidationMiddleware = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorResponse = {
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
exports.createValidationMiddleware = createValidationMiddleware;
//# sourceMappingURL=validate.js.map