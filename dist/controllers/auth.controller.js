"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("../middleware/errorHandler");
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phone: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const updatePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
class AuthController {
    constructor() {
        this.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = registerSchema.parse(req.body);
            const result = await auth_service_1.authService.register(validatedData);
            const response = {
                success: true,
                message: 'Registration successful',
                data: result,
            };
            res.status(201).json(response);
        });
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = loginSchema.parse(req.body);
            const result = await auth_service_1.authService.login(validatedData);
            const response = {
                success: true,
                message: 'Login successful',
                data: result,
            };
            res.status(200).json(response);
        });
        this.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            await auth_service_1.authService.logout(req.user.id);
            const response = {
                success: true,
                message: 'Logout successful',
                data: null,
            };
            res.status(200).json(response);
        });
        this.getCurrentUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const user = await auth_service_1.authService.getCurrentUser(req.user.id);
            if (!user) {
                throw (0, errorHandler_1.createAppError)('User not found', 404, 'USER_NOT_FOUND');
            }
            const response = {
                success: true,
                data: user,
            };
            res.status(200).json(response);
        });
        this.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = refreshTokenSchema.parse(req.body);
            const result = await auth_service_1.authService.refreshToken(validatedData.refreshToken);
            const response = {
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            };
            res.status(200).json(response);
        });
        this.updatePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('User not authenticated', 401, 'UNAUTHORIZED');
            }
            const validatedData = updatePasswordSchema.parse(req.body);
            await auth_service_1.authService.updatePassword(req.user.id, validatedData.oldPassword, validatedData.newPassword);
            const response = {
                success: true,
                message: 'Password updated successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        this.forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = forgotPasswordSchema.parse(req.body);
            const message = await auth_service_1.authService.forgotPassword(validatedData.email);
            const response = {
                success: true,
                message,
                data: null,
            };
            res.status(200).json(response);
        });
        this.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = resetPasswordSchema.parse(req.body);
            await auth_service_1.authService.resetPasswordWithToken(validatedData.token, validatedData.newPassword);
            const response = {
                success: true,
                message: 'Password reset successfully',
                data: null,
            };
            res.status(200).json(response);
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map