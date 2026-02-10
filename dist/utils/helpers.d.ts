export declare const generateId: (prefix?: string) => string;
export declare const generateCaseNumber: () => string;
export declare const generateInvoiceNumber: () => string;
export declare const generateTrackingNumber: () => string;
export declare const formatDate: (date: Date | string) => string;
export declare const formatDateTime: (date: Date | string) => string;
export declare const addDays: (date: Date, days: number) => Date;
export declare const isOverdue: (dueDate: Date | string) => boolean;
export declare const getDaysUntilDue: (dueDate: Date | string) => number;
export declare const roundToTwoDecimals: (num: number) => number;
export declare const calculateTax: (amount: number, taxRate?: number) => number;
export declare const calculateTotal: (amount: number, tax?: number) => number;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPhoneNumber: (phone: string) => boolean;
export declare const isValidUUID: (uuid: string) => boolean;
export declare const chunk: <T>(array: T[], size: number) => T[][];
export declare const unique: <T>(array: T[]) => T[];
export declare const excludeKeys: <T extends Record<string, unknown>>(obj: T, keys: string[]) => Partial<T>;
export declare const pickKeys: <T extends Record<string, unknown>>(obj: T, keys: string[]) => Partial<T>;
export declare const calculatePages: (total: number, limit: number) => number;
export declare const calculateSkip: (page: number, limit: number) => number;
export declare const getPaginationParams: (page: string | number, limit: string | number) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const buildSearchFilter: (searchTerm: string, fields: string[]) => {
    OR: {
        [x: string]: {
            contains: string;
            mode: "insensitive";
        };
    }[];
};
export declare const getFileExtension: (filename: string) => string;
export declare const formatFileSize: (bytes: number) => string;
export declare const isAllowedFileType: (filename: string, allowedExtensions: string[]) => boolean;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isTest: () => boolean;
//# sourceMappingURL=helpers.d.ts.map