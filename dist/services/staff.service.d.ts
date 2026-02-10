import { PaginationParams, PaginatedResponse } from '../types';
export interface CreateStaffRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    employeeId: string;
    position: string;
    department: string;
    specialization?: string;
    hireDate: string;
    salary: number;
    qualifications?: string;
    certifications?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
}
export interface UpdateStaffRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
    department?: string;
    specialization?: string;
    salary?: number;
    qualifications?: string;
    certifications?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}
export interface AddStaffScheduleRequest {
    startTime: string;
    endTime: string;
    dayOfWeek?: number;
    type?: 'REGULAR' | 'OVERTIME' | 'LEAVE' | 'HOLIDAY';
    notes?: string;
}
export interface AddPerformanceReviewRequest {
    rating: number;
    comments?: string;
}
export interface StaffFilterParams {
    department?: string;
    status?: string;
    position?: string;
    search?: string;
}
export declare class StaffService {
    createStaff(data: CreateStaffRequest): Promise<any>;
    getStaffById(staffId: string): Promise<any>;
    getStaff(filters: StaffFilterParams, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateStaff(staffId: string, data: UpdateStaffRequest): Promise<any>;
    deleteStaff(staffId: string): Promise<void>;
    getStaffSchedules(staffId: string): Promise<any[]>;
    addStaffSchedule(staffId: string, data: AddStaffScheduleRequest): Promise<any>;
    getPerformanceReviews(staffId: string): Promise<any[]>;
    addPerformanceReview(staffId: string, reviewerId: string, data: AddPerformanceReviewRequest): Promise<any>;
}
export declare const staffService: StaffService;
//# sourceMappingURL=staff.service.d.ts.map