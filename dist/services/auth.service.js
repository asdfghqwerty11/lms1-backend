"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const email_service_1 = require("./email.service");
const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds
class AuthService {
    async register(data) {
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw (0, errorHandler_1.createAppError)('Email already registered', 400, 'EMAIL_ALREADY_EXISTS');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            },
        });
        // Assign default role
        const userRole = await database_1.prisma.role.findUnique({
            where: { name: 'USER' },
        });
        if (userRole) {
            // This assumes a relationship exists - adjust based on your schema
            await database_1.prisma.$executeRawUnsafe(`INSERT INTO "_RoleToUser" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`, userRole.id, user.id);
        }
        // Send welcome email
        try {
            await email_service_1.emailService.sendWelcomeEmail(user.email, user.firstName);
            console.log(`[AUTH] Welcome email sent to ${user.email}`);
        }
        catch (error) {
            console.error(`[AUTH] Failed to send welcome email to ${user.email}:`, error);
            // Don't throw - registration should succeed even if email fails
        }
        const tokens = await this.generateTokens(user.id, user.email, userRole ? [userRole.name] : []);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: userRole ? [userRole.name] : [],
            },
        };
    }
    async login(data) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email },
            include: { roles: true },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        // Compare passwords
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createAppError)('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        if (!user.isActive) {
            throw (0, errorHandler_1.createAppError)('User account is inactive', 403, 'ACCOUNT_INACTIVE');
        }
        // Update last login
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.roles.map((r) => r.name));
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map((r) => r.name),
            },
        };
    }
    async logout(userId) {
        await database_1.prisma.session.deleteMany({
            where: { userId },
        });
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { roles: true },
            });
            if (!user || !user.isActive) {
                throw (0, errorHandler_1.createAppError)('User not found or inactive', 401, 'INVALID_REFRESH_TOKEN');
            }
            const tokens = await this.generateTokens(user.id, user.email, user.roles.map((r) => r.name));
            return {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles.map((r) => r.name),
                },
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createAppError)('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
    }
    async getCurrentUser(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles.map((r) => r.name),
        };
    }
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('User not found', 404, 'USER_NOT_FOUND');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createAppError)('Current password is incorrect', 401, 'INVALID_PASSWORD');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
    async resetPassword(email, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('User not found', 404, 'USER_NOT_FOUND');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
    }
    async forgotPassword(email) {
        const user = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal if email exists for security
            console.log(`[AUTH] Password reset requested for non-existent email: ${email}`);
            return 'If an account exists with this email, a password reset link has been sent.';
        }
        // Generate secure reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const expiryTime = new Date(Date.now() + RESET_TOKEN_EXPIRY);
        // Store hashed token in database
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expiryTime,
            },
        });
        // Send email with reset link
        try {
            await email_service_1.emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
            console.log(`[AUTH] Password reset email sent to ${user.email}`);
        }
        catch (error) {
            console.error(`[AUTH] Failed to send password reset email to ${user.email}:`, error);
            // Don't throw - the token is still stored, user can try again
        }
        return 'If an account exists with this email, a password reset link has been sent.';
    }
    async resetPasswordWithToken(resetToken, newPassword) {
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const user = await database_1.prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    gt: new Date(), // Token must not be expired
                },
            },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('Invalid or expired password reset token', 400, 'INVALID_RESET_TOKEN');
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        // Update user with new password and clear reset token
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        console.log(`[AUTH] Password reset successfully for user ${user.email}`);
    }
    async generateTokens(userId, email, roles) {
        const accessToken = (0, auth_1.generateToken)(userId, email, roles, '1h');
        const refreshToken = (0, auth_1.generateRefreshToken)(userId);
        // Store refresh token in database
        await database_1.prisma.session.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 3600, // 1 hour in seconds
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map