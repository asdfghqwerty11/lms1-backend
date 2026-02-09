import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AuthRequest, JwtPayload, AppError } from '../types';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      const error: AppError = new Error('No authentication token provided') as AppError;
      error.statusCode = 401;
      error.code = 'NO_TOKEN';
      return next(error);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      firstName: '',
      lastName: '',
      roles: decoded.roles || [],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const appError: AppError = new Error('Token has expired') as AppError;
      appError.statusCode = 401;
      appError.code = 'TOKEN_EXPIRED';
      return next(appError);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      const appError: AppError = new Error('Invalid token') as AppError;
      appError.statusCode = 401;
      appError.code = 'INVALID_TOKEN';
      return next(appError);
    }

    next(error);
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    const error: AppError = new Error('Authentication required') as AppError;
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return next(error);
  }
  next();
};

export const requireRole =
  (...requiredRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error: AppError = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    const userRoles = req.user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      const error: AppError = new Error(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`
      ) as AppError;
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      return next(error);
    }

    next();
  };

export const extractToken = (req: AuthRequest): string | null => {
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

export const generateToken = (userId: string, email: string, roles: string[], expiresIn?: string): string => {
  return jwt.sign(
    {
      userId,
      email,
      roles,
    },
    env.JWT_SECRET,
    {
      expiresIn: expiresIn || env.JWT_EXPIRATION,
      issuer: 'dental-lab-api',
      audience: 'dental-lab-app',
    } as any
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRATION,
      issuer: 'dental-lab-api',
    } as any
  );
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    userId: string;
    type: string;
    iat: number;
    exp: number;
    iss: string;
  };

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return { userId: decoded.userId };
};
