"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentType = exports.MAX_FILE_SIZE = exports.ALLOWED_FILE_TYPES = exports.BUCKET_NAME = exports.supabase = void 0;
exports.getAttachmentTypeFromMime = getAttachmentTypeFromMime;
exports.initStorage = initStorage;
exports.uploadFileToStorage = uploadFileToStorage;
exports.getSignedDownloadUrl = getSignedDownloadUrl;
exports.deleteFileFromStorage = deleteFileFromStorage;
exports.listCaseFiles = listCaseFiles;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = __importDefault(require("./env"));
const SUPABASE_URL = env_1.default.SUPABASE_URL || 'https://sfmwhcxwhfjbxlrrcldd.supabase.co';
const SUPABASE_SERVICE_KEY = env_1.default.SUPABASE_SERVICE_KEY || '';
// Create Supabase client for storage operations
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_KEY);
exports.BUCKET_NAME = 'case-attachments';
// Allowed file types for case attachments
exports.ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
    'image/webp',
    'application/dicom', // DICOM format for dental scans
    'application/x-dcm', // Alternative DICOM MIME type
];
// Maximum file size: 50MB
exports.MAX_FILE_SIZE = 52428800;
// File type categories for dental case attachments
var AttachmentType;
(function (AttachmentType) {
    AttachmentType["XRAY"] = "xray";
    AttachmentType["SCAN"] = "scan";
    AttachmentType["IMPRESSION"] = "impression";
    AttachmentType["PHOTO"] = "photo";
    AttachmentType["DOCUMENT"] = "document";
    AttachmentType["OTHER"] = "other";
})(AttachmentType || (exports.AttachmentType = AttachmentType = {}));
function getAttachmentTypeFromMime(mimeType) {
    if (mimeType.startsWith('image/')) {
        return AttachmentType.PHOTO;
    }
    if (mimeType === 'application/dicom' || mimeType === 'application/x-dcm') {
        return AttachmentType.SCAN;
    }
    if (mimeType === 'application/pdf' || mimeType === 'application/x-pdf') {
        return AttachmentType.DOCUMENT;
    }
    return AttachmentType.OTHER;
}
/**
 * Initialize Supabase Storage bucket
 * Creates the bucket if it doesn't exist
 */
async function initStorage() {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await exports.supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
            throw listError;
        }
        const bucketExists = buckets?.some((b) => b.name === exports.BUCKET_NAME);
        if (!bucketExists) {
            // Create bucket if it doesn't exist
            const { error: createError } = await exports.supabase.storage.createBucket(exports.BUCKET_NAME, {
                public: false, // Private bucket - access via signed URLs
            });
            if (createError) {
                console.error('Error creating bucket:', createError);
                throw createError;
            }
            console.log(`Storage bucket '${exports.BUCKET_NAME}' created successfully`);
        }
        else {
            console.log(`Storage bucket '${exports.BUCKET_NAME}' already exists`);
        }
    }
    catch (error) {
        console.error('Failed to initialize storage:', error);
        throw error;
    }
}
/**
 * Upload file to Supabase Storage
 * @param file - Express multer file object
 * @param caseId - Case ID for organizing files
 * @param userId - User ID for audit trail
 * @returns Upload result with file path and metadata
 */
async function uploadFileToStorage(file, caseId, userId) {
    try {
        // Generate unique file path
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `cases/${caseId}/${timestamp}-${randomStr}-${sanitizedFileName}`;
        // Upload file to Supabase Storage
        const { data, error } = await exports.supabase.storage
            .from(exports.BUCKET_NAME)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false, // Don't overwrite existing files
        });
        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
        if (!data?.path) {
            throw new Error('Upload succeeded but no file path returned');
        }
        // Get public URL (though bucket is private, for reference)
        // In practice, we'll use signed URLs for access
        const { data: publicUrl } = exports.supabase.storage.from(exports.BUCKET_NAME).getPublicUrl(filePath);
        return {
            path: filePath,
            url: publicUrl.publicUrl,
            size: file.size,
            type: file.mimetype,
            attachmentType: getAttachmentTypeFromMime(file.mimetype),
        };
    }
    catch (error) {
        console.error('Error uploading file to Supabase:', error);
        throw error;
    }
}
/**
 * Generate signed download URL
 * @param filePath - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default 3600 = 1 hour)
 * @returns Signed URL for downloading the file
 */
async function getSignedDownloadUrl(filePath, expiresIn = 3600) {
    try {
        const { data, error } = await exports.supabase.storage
            .from(exports.BUCKET_NAME)
            .createSignedUrl(filePath, expiresIn);
        if (error) {
            throw new Error(`Failed to create signed URL: ${error.message}`);
        }
        return data?.signedUrl || '';
    }
    catch (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }
}
/**
 * Delete file from Supabase Storage
 * @param filePath - Path to file in storage
 */
async function deleteFileFromStorage(filePath) {
    try {
        const { error } = await exports.supabase.storage.from(exports.BUCKET_NAME).remove([filePath]);
        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    catch (error) {
        console.error('Error deleting file from Supabase:', error);
        throw error;
    }
}
/**
 * List all files for a case
 * @param caseId - Case ID
 */
async function listCaseFiles(caseId) {
    try {
        const { data, error } = await exports.supabase.storage
            .from(exports.BUCKET_NAME)
            .list(`cases/${caseId}`, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });
        if (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }
        return data || [];
    }
    catch (error) {
        console.error('Error listing files from Supabase:', error);
        throw error;
    }
}
//# sourceMappingURL=storage.js.map