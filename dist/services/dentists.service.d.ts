import { PaginationParams, PaginatedResponse } from '../types';
interface CreateDentistRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    licenseNumber: string;
    specialization?: string;
    clinic?: string;
    clinicPhone?: string;
    clinicEmail?: string;
}
interface UpdateDentistRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    specialization?: string;
    clinic?: string;
    clinicPhone?: string;
    clinicEmail?: string;
}
interface DentistFilterParams {
    specialization?: string;
    status?: string;
    search?: string;
}
interface ReviewApplicationRequest {
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    notes?: string;
}
export declare class DentistsService {
    createDentist(data: CreateDentistRequest): Promise<any>;
    getDentistById(dentistId: string): Promise<any>;
    getDentists(filters: DentistFilterParams, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateDentist(dentistId: string, data: UpdateDentistRequest): Promise<any>;
    deleteDentist(dentistId: string): Promise<void>;
    getDentistApplications(filters: {
        status?: string;
        dentistId?: string;
    }, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    reviewApplication(applicationId: string, reviewerId: string, data: ReviewApplicationRequest): Promise<any>;
}
export declare const dentistsService: DentistsService;
export {};
//# sourceMappingURL=dentists.service.d.ts.map