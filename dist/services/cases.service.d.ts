import { CreateCaseRequest, UpdateCaseRequest, CaseFilterParams, PaginationParams, PaginatedResponse } from '../types';
export declare class CasesService {
    createCase(data: CreateCaseRequest, createdById: string): Promise<any>;
    getCaseById(caseId: string): Promise<any>;
    getCases(filters: CaseFilterParams, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateCase(caseId: string, data: UpdateCaseRequest): Promise<any>;
    deleteCase(caseId: string): Promise<void>;
    addCaseFile(caseId: string, file: Express.Multer.File, userId: string): Promise<any>;
    getCaseFiles(caseId: string): Promise<any[]>;
    deleteCaseFile(fileId: string): Promise<void>;
    addCaseNote(caseId: string, userId: string, content: string, isInternal?: boolean): Promise<any>;
    getCaseNotes(caseId: string, includeInternal?: boolean): Promise<any[]>;
    getCaseWorkflow(caseId: string): Promise<any[]>;
    searchCases(searchTerm: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
}
export declare const casesService: CasesService;
//# sourceMappingURL=cases.service.d.ts.map