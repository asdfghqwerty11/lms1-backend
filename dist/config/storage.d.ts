export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const BUCKET_NAME = "case-attachments";
export declare const ALLOWED_FILE_TYPES: string[];
export declare const MAX_FILE_SIZE = 52428800;
export declare enum AttachmentType {
    XRAY = "xray",
    SCAN = "scan",
    IMPRESSION = "impression",
    PHOTO = "photo",
    DOCUMENT = "document",
    OTHER = "other"
}
export declare function getAttachmentTypeFromMime(mimeType: string): AttachmentType;
/**
 * Initialize Supabase Storage bucket
 * Creates the bucket if it doesn't exist
 */
export declare function initStorage(): Promise<void>;
/**
 * Upload file to Supabase Storage
 * @param file - Express multer file object
 * @param caseId - Case ID for organizing files
 * @param userId - User ID for audit trail
 * @returns Upload result with file path and metadata
 */
export declare function uploadFileToStorage(file: Express.Multer.File, caseId: string, userId: string): Promise<{
    path: string;
    url: string;
    size: number;
    type: string;
    attachmentType: AttachmentType;
}>;
/**
 * Generate signed download URL
 * @param filePath - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default 3600 = 1 hour)
 * @returns Signed URL for downloading the file
 */
export declare function getSignedDownloadUrl(filePath: string, expiresIn?: number): Promise<string>;
/**
 * Delete file from Supabase Storage
 * @param filePath - Path to file in storage
 */
export declare function deleteFileFromStorage(filePath: string): Promise<void>;
/**
 * List all files for a case
 * @param caseId - Case ID
 */
export declare function listCaseFiles(caseId: string): Promise<any[]>;
//# sourceMappingURL=storage.d.ts.map