import { Response } from 'express';
export declare class UploadsController {
    /**
     * Generate a signed download URL for a file
     * Allows temporary access to private Supabase storage files
     */
    getDownloadUrl: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Get file metadata with download URL
     */
    getFileMetadata: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Delete a file by ID
     */
    deleteFile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Bulk delete files
     */
    deleteMultipleFiles: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * Get case file statistics
     */
    getCaseFileStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const uploadsController: UploadsController;
//# sourceMappingURL=uploads.controller.d.ts.map