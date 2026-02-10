"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = exports.UsersController = void 0;
const zod_1 = require("zod");
const users_service_1 = require("../services/users.service");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Validation schemas
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phone: zod_1.z.string().optional(),
    roleIds: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    roleIds: zod_1.z.array(zod_1.z.string()).optional(),
});
const createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Role name is required'),
    description: zod_1.z.string().optional(),
    permissionIds: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    permissionIds: zod_1.z.array(zod_1.z.string()).optional(),
});
class UsersController {
    constructor() {
        // User routes
        this.createUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createUserSchema.parse(req.body);
            const user = await users_service_1.usersService.createUser(validatedData);
            const response = {
                success: true,
                message: 'User created successfully',
                data: user,
            };
            res.status(201).json(response);
        });
        this.getUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await users_service_1.usersService.getUsers(pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const user = await users_service_1.usersService.getUserById(id);
            const response = {
                success: true,
                data: user,
            };
            res.status(200).json(response);
        });
        this.searchUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const searchTerm = req.query.q;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            if (!searchTerm) {
                throw (0, errorHandler_1.createAppError)('Search term is required', 400, 'MISSING_SEARCH_TERM');
            }
            const pagination = (0, types_1.getPaginationParams)(String(page), String(limit));
            const result = await users_service_1.usersService.searchUsers(searchTerm, pagination);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        });
        this.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateUserSchema.parse(req.body);
            const user = await users_service_1.usersService.updateUser(id, validatedData);
            const response = {
                success: true,
                message: 'User updated successfully',
                data: user,
            };
            res.status(200).json(response);
        });
        this.deactivateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const user = await users_service_1.usersService.deactivateUser(id);
            const response = {
                success: true,
                message: 'User deactivated successfully',
                data: user,
            };
            res.status(200).json(response);
        });
        // Role routes
        this.createRole = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = createRoleSchema.parse(req.body);
            const role = await users_service_1.usersService.createRole(validatedData);
            const response = {
                success: true,
                message: 'Role created successfully',
                data: role,
            };
            res.status(201).json(response);
        });
        this.getRoles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const roles = await users_service_1.usersService.getRoles();
            const response = {
                success: true,
                data: roles,
            };
            res.status(200).json(response);
        });
        this.getRoleById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const role = await users_service_1.usersService.getRoleById(id);
            const response = {
                success: true,
                data: role,
            };
            res.status(200).json(response);
        });
        this.updateRole = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const validatedData = updateRoleSchema.parse(req.body);
            const role = await users_service_1.usersService.updateRole(id, validatedData);
            const response = {
                success: true,
                message: 'Role updated successfully',
                data: role,
            };
            res.status(200).json(response);
        });
        this.deleteRole = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await users_service_1.usersService.deleteRole(id);
            const response = {
                success: true,
                message: 'Role deleted successfully',
                data: null,
            };
            res.status(200).json(response);
        });
        // Permission routes
        this.getPermissions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const permissions = await users_service_1.usersService.getPermissions();
            const response = {
                success: true,
                data: permissions,
            };
            res.status(200).json(response);
        });
    }
}
exports.UsersController = UsersController;
exports.usersController = new UsersController();
//# sourceMappingURL=users.controller.js.map