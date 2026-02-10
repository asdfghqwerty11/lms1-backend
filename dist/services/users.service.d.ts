import { PaginationParams, PaginatedResponse } from '../types';
export declare class UsersService {
    createUser(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        roleIds?: string[];
    }): Promise<any>;
    getUserById(userId: string): Promise<any>;
    getUsers(pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    updateUser(userId: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatar?: string;
        isActive?: boolean;
        roleIds?: string[];
    }): Promise<any>;
    deactivateUser(userId: string): Promise<any>;
    searchUsers(searchTerm: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    createRole(data: {
        name: string;
        description?: string;
        permissionIds?: string[];
    }): Promise<any>;
    getRoleById(roleId: string): Promise<any>;
    getRoles(): Promise<any[]>;
    updateRole(roleId: string, data: {
        name?: string;
        description?: string;
        permissionIds?: string[];
    }): Promise<any>;
    deleteRole(roleId: string): Promise<void>;
    getPermissions(): Promise<any[]>;
}
export declare const usersService: UsersService;
//# sourceMappingURL=users.service.d.ts.map