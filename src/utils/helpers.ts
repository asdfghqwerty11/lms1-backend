import crypto from 'crypto';

// String utilities
export const generateId = (prefix?: string): string => {
  const id = crypto.randomBytes(16).toString('hex');
  return prefix ? `${prefix}_${id}` : id;
};

export const generateCaseNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CASE-${timestamp}-${random}`;
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INV-${year}${month}-${random}`;
};

export const generateTrackingNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `TRK-${timestamp}-${random}`;
};

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isOverdue = (dueDate: Date | string): boolean => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return due < new Date();
};

export const getDaysUntilDue = (dueDate: Date | string): number => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Number utilities
export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

export const calculateTax = (amount: number, taxRate: number = 0.1): number => {
  return roundToTwoDecimals(amount * taxRate);
};

export const calculateTotal = (amount: number, tax: number = 0): number => {
  return roundToTwoDecimals(amount + tax);
};

// String validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

// Object utilities
export const excludeKeys = <T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> => {
  const result: Partial<T> = { ...obj };
  keys.forEach((key) => {
    delete result[key as keyof T];
  });
  return result;
};

export const pickKeys = <T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> => {
  const result: Partial<T> = {};
  keys.forEach((key) => {
    if (key in obj) {
      result[key as keyof T] = obj[key as keyof T];
    }
  });
  return result;
};

// Pagination
export const calculatePages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};

export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

export const getPaginationParams = (page: string | number, limit: string | number) => {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const validPage = Math.max(1, isNaN(pageNum) ? 1 : pageNum);
  const validLimit = Math.max(1, Math.min(100, isNaN(limitNum) ? 20 : limitNum));

  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit,
  };
};

// Search/Filter utilities
export const buildSearchFilter = (searchTerm: string, fields: string[]) => {
  const formattedTerm = `%${searchTerm}%`;
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    })),
  };
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const isAllowedFileType = (filename: string, allowedExtensions: string[]): boolean => {
  const ext = getFileExtension(filename);
  return allowedExtensions.includes(ext);
};

// Environment utilities
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};
