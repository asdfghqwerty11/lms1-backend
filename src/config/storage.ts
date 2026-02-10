import { createClient } from '@supabase/supabase-js';
import env from './env';

const SUPABASE_URL = env.SUPABASE_URL || 'https://sfmwhcxwhfjbxlrrcldd.supabase.co';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || '';

// Create Supabase client for storage operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const BUCKET_NAME = 'case-attachments';

// Allowed file types for case attachments
export const ALLOWED_FILE_TYPES = [
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
export const MAX_FILE_SIZE = 52428800;

// File type categories for dental case attachments
export enum AttachmentType {
  XRAY = 'xray',
  SCAN = 'scan',
  IMPRESSION = 'impression',
  PHOTO = 'photo',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export function getAttachmentTypeFromMime(mimeType: string): AttachmentType {
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
export async function initStorage(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket - access via signed URLs
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }

      console.log(`Storage bucket '${BUCKET_NAME}' created successfully`);
    } else {
      console.log(`Storage bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
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
export async function uploadFileToStorage(
  file: Express.Multer.File,
  caseId: string,
  userId: string
): Promise<{
  path: string;
  url: string;
  size: number;
  type: string;
  attachmentType: AttachmentType;
}> {
  try {
    // Generate unique file path
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `cases/${caseId}/${timestamp}-${randomStr}-${sanitizedFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
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
    const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl.publicUrl,
      size: file.size,
      type: file.mimetype,
      attachmentType: getAttachmentTypeFromMime(file.mimetype),
    };
  } catch (error) {
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
export async function getSignedDownloadUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data?.signedUrl || '';
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
}

/**
 * Delete file from Supabase Storage
 * @param filePath - Path to file in storage
 */
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    throw error;
  }
}

/**
 * List all files for a case
 * @param caseId - Case ID
 */
export async function listCaseFiles(caseId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`cases/${caseId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error listing files from Supabase:', error);
    throw error;
  }
}
