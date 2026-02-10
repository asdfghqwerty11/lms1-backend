import { Request } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}
export interface AuthRequest extends Request {
    user?: AuthUser;
}
export interface JwtPayload {
    userId: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
}
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
export interface ErrorResponse {
    success: false;
    message: string;
    code: string;
    details?: unknown;
}
export interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}
export interface AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
}
export interface CreateCaseRequest {
    dentistId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    patientDOB?: string;
    description: string;
    specifications?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    departmentId?: string;
}
export interface UpdateCaseRequest {
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    description?: string;
    specifications?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status?: 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
    dueDate?: string;
    assignedToId?: string;
    departmentId?: string;
}
export interface CaseFilterParams {
    status?: string;
    priority?: string;
    dentistId?: string;
    assignedToId?: string;
    departmentId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export interface CreateInvoiceRequest {
    caseId: string;
    dentistId: string;
    amount: number;
    tax?: number;
    dueDate: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    description?: string;
    notes?: string;
}
export interface UpdateInvoiceRequest {
    status?: 'DRAFT' | 'ISSUED' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    dueDate?: string;
    description?: string;
    notes?: string;
}
export interface CreateWorkflowStageRequest {
    stageName: string;
    description?: string;
    sequence: number;
    assignedTo?: string;
}
export interface UpdateWorkflowStageRequest {
    stageName?: string;
    description?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'SKIPPED';
    assignedTo?: string;
    notes?: string;
}
export interface CreateInventoryItemRequest {
    sku: string;
    name: string;
    description?: string;
    category: string;
    quantity: number;
    minStock: number;
    maxStock: number;
    unitPrice: number;
    supplier?: string;
    location?: string;
    expiryDate?: string;
}
export interface UpdateInventoryItemRequest {
    name?: string;
    description?: string;
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    unitPrice?: number;
    supplier?: string;
    location?: string;
    expiryDate?: string;
}
export interface InventoryTransactionRequest {
    type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE' | 'EXPIRY';
    quantity: number;
    reference?: string;
    notes?: string;
}
export declare const getPaginationParams: (page?: string, limit?: string) => PaginationParams;
//# sourceMappingURL=index.d.ts.map