import bcryptjs from 'bcryptjs';
import { prisma } from '../config/database';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { createAppError } from '../middleware/errorHandler';
import { LoginRequest, RegisterRequest, TokenResponse, AuthUser } from '../types';

const SALT_ROUNDS = 10;

export class AuthService {
  async register(data: RegisterRequest): Promise<TokenResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createAppError('Email already registered', 400, 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    // Assign default role
    const userRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (userRole) {
      // This assumes a relationship exists - adjust based on your schema
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_RoleToUser" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        userRole.id,
        user.id
      );
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

  async login(data: LoginRequest): Promise<TokenResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { roles: true },
    });

    if (!user) {
      throw createAppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw createAppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw createAppError('User account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.roles.map((r) => r.name)
    );

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

  async logout(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { roles: true },
      });

      if (!user || !user.isActive) {
        throw createAppError('User not found or inactive', 401, 'INVALID_REFRESH_TOKEN');
      }

      const tokens = await this.generateTokens(
        user.id,
        user.email,
        user.roles.map((r) => r.name)
      );

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
    } catch (error) {
      throw createAppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async getCurrentUser(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
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

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createAppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw createAppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createAppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  private async generateTokens(userId: string, email: string, roles: string[]): Promise<Omit<TokenResponse, 'user'>> {
    const accessToken = generateToken(userId, email, roles, '1h');
    const refreshToken = generateRefreshToken(userId);

    // Store refresh token in database
    await prisma.session.create({
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

export const authService = new AuthService();
