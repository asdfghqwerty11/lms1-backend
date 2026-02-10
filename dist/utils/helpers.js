"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.isAllowedFileType = exports.formatFileSize = exports.getFileExtension = exports.buildSearchFilter = exports.getPaginationParams = exports.calculateSkip = exports.calculatePages = exports.pickKeys = exports.excludeKeys = exports.unique = exports.chunk = exports.isValidUUID = exports.isValidPhoneNumber = exports.isValidEmail = exports.calculateTotal = exports.calculateTax = exports.roundToTwoDecimals = exports.getDaysUntilDue = exports.isOverdue = exports.addDays = exports.formatDateTime = exports.formatDate = exports.generateTrackingNumber = exports.generateInvoiceNumber = exports.generateCaseNumber = exports.generateId = void 0;
const crypto_1 = __importDefault(require("crypto"));
// String utilities
const generateId = (prefix) => {
    const id = crypto_1.default.randomBytes(16).toString('hex');
    return prefix ? `${prefix}_${id}` : id;
};
exports.generateId = generateId;
const generateCaseNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    return `CASE-${timestamp}-${random}`;
};
exports.generateCaseNumber = generateCaseNumber;
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    return `INV-${year}${month}-${random}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
const generateTrackingNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto_1.default.randomBytes(6).toString('hex').toUpperCase();
    return `TRK-${timestamp}-${random}`;
};
exports.generateTrackingNumber = generateTrackingNumber;
// Date utilities
const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};
exports.formatDateTime = formatDateTime;
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const isOverdue = (dueDate) => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return due < new Date();
};
exports.isOverdue = isOverdue;
const getDaysUntilDue = (dueDate) => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
exports.getDaysUntilDue = getDaysUntilDue;
// Number utilities
const roundToTwoDecimals = (num) => {
    return Math.round(num * 100) / 100;
};
exports.roundToTwoDecimals = roundToTwoDecimals;
const calculateTax = (amount, taxRate = 0.1) => {
    return (0, exports.roundToTwoDecimals)(amount * taxRate);
};
exports.calculateTax = calculateTax;
const calculateTotal = (amount, tax = 0) => {
    return (0, exports.roundToTwoDecimals)(amount + tax);
};
exports.calculateTotal = calculateTotal;
// String validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhoneNumber = isValidPhoneNumber;
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
// Array utilities
const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
exports.chunk = chunk;
const unique = (array) => {
    return [...new Set(array)];
};
exports.unique = unique;
// Object utilities
const excludeKeys = (obj, keys) => {
    const result = { ...obj };
    keys.forEach((key) => {
        delete result[key];
    });
    return result;
};
exports.excludeKeys = excludeKeys;
const pickKeys = (obj, keys) => {
    const result = {};
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
exports.pickKeys = pickKeys;
// Pagination
const calculatePages = (total, limit) => {
    return Math.ceil(total / limit);
};
exports.calculatePages = calculatePages;
const calculateSkip = (page, limit) => {
    return (page - 1) * limit;
};
exports.calculateSkip = calculateSkip;
const getPaginationParams = (page, limit) => {
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
exports.getPaginationParams = getPaginationParams;
// Search/Filter utilities
const buildSearchFilter = (searchTerm, fields) => {
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
exports.buildSearchFilter = buildSearchFilter;
// File utilities
const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
};
exports.getFileExtension = getFileExtension;
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const isAllowedFileType = (filename, allowedExtensions) => {
    const ext = (0, exports.getFileExtension)(filename);
    return allowedExtensions.includes(ext);
};
exports.isAllowedFileType = isAllowedFileType;
// Environment utilities
const isDevelopment = () => {
    return process.env.NODE_ENV === 'development';
};
exports.isDevelopment = isDevelopment;
const isProduction = () => {
    return process.env.NODE_ENV === 'production';
};
exports.isProduction = isProduction;
const isTest = () => {
    return process.env.NODE_ENV === 'test';
};
exports.isTest = isTest;
//# sourceMappingURL=helpers.js.map