"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateRefreshToken = exports.generateToken = exports.extractToken = exports.requireRole = exports.requireAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const authMiddleware = (req, res, next) => {
    try {
        const token = (0, exports.extractToken)(req);
        if (!token) {
            const error = new Error('No authentication token provided');
            error.statusCode = 401;
            error.code = 'NO_TOKEN';
            return next(error);
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            firstName: '',
            lastName: '',
            roles: decoded.roles || [],
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            const appError = new Error('Token has expired');
            appError.statusCode = 401;
            appError.code = 'TOKEN_EXPIRED';
            return next(appError);
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            const appError = new Error('Invalid token');
            appError.statusCode = 401;
            appError.code = 'INVALID_TOKEN';
            return next(appError);
        }
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        error.code = 'UNAUTHORIZED';
        return next(error);
    }
    next();
};
exports.requireAuth = requireAuth;
const requireRole = (...requiredRoles) => (req, res, next) => {
    if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        error.code = 'UNAUTHORIZED';
        return next(error);
    }
    const userRoles = req.user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
        const error = new Error(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        return next(error);
    }
    next();
};
exports.requireRole = requireRole;
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
};
exports.extractToken = extractToken;
const generateToken = (userId, email, roles, expiresIn) => {
    return jsonwebtoken_1.default.sign({
        userId,
        email,
        roles,
    }, env_1.default.JWT_SECRET, {
        expiresIn: expiresIn || env_1.default.JWT_EXPIRATION,
        issuer: 'dental-lab-api',
        audience: 'dental-lab-app',
    });
};
exports.generateToken = generateToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({
        userId,
        type: 'refresh',
    }, env_1.default.JWT_REFRESH_SECRET, {
        expiresIn: env_1.default.JWT_REFRESH_EXPIRATION,
        issuer: 'dental-lab-api',
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
    }
    return { userId: decoded.userId };
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=auth.js.map