"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = exports.UsersService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const email_service_1 = require("./email.service");
const SALT_ROUNDS = 10;
class UsersService {
    async createUser(data) {
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw (0, errorHandler_1.createAppError)('Email already registered', 400, 'EMAIL_ALREADY_EXISTS');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            },
            include: {
                roles: true,
            },
        });
        // Assign roles if provided
        if (data.roleIds && data.roleIds.length > 0) {
            // Verify all roles exist
            const roles = await database_1.prisma.role.findMany({
                where: { id: { in: data.roleIds } },
            });
            if (roles.length !== data.roleIds.length) {
                throw (0, errorHandler_1.createAppError)('One or more roles not found', 404, 'ROLE_NOT_FOUND');
            }
            // Use raw query to add roles to user (Prisma m2m relation)
            for (const roleId of data.roleIds) {
                await database_1.prisma.$executeRawUnsafe(`INSERT INTO "_RoleToUser" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`, roleId, user.id);
            }
        }
        // Fetch user with updated roles
        const userWithRoles = await database_1.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roles: true,
                staffProfile: true,
                dentistProfile: true,
            },
        });
        // Send welcome email
        try {
            await email_service_1.emailService.sendWelcomeEmail(user.email, user.firstName, data.password);
            console.log(`[USERS] Welcome email sent to ${user.email}`);
        }
        catch (error) {
            console.error(`[USERS] Failed to send welcome email to ${user.email}:`, error);
            // Don't throw - user creation should succeed even if email fails
        }
        return userWithRoles;
    }
    async getUserById(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
                staffProfile: true,
                dentistProfile: true,
            },
        });
        if (!user) {
            throw (0, errorHandler_1.createAppError)('User not found', 404, 'USER_NOT_FOUND');
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async getUsers(pagination) {
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                include: {
                    roles: true,
                    staffProfile: true,
                    dentistProfile: true,
                },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.user.count(),
        ]);
        // Remove passwords from response
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        const pages = Math.ceil(total / pagination.limit);
        return {
            data: usersWithoutPasswords,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                pages,
            },
        };
    }
    async updateUser(userId, data) {
        const updateData = {};
        if (data.firstName !== undefined)
            updateData.firstName = data.firstName;
        if (data.lastName !== undefined)
            updateData.lastName = data.lastName;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.avatar !== undefined)
            updateData.avatar = data.avatar;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                roles: true,
                staffProfile: true,
                dentistProfile: true,
            },
        });
        // Update roles if provided
        if (data.roleIds) {
            // Verify all roles exist
            const roles = await database_1.prisma.role.findMany({
                where: { id: { in: data.roleIds } },
            });
            if (roles.length !== data.roleIds.length) {
                throw (0, errorHandler_1.createAppError)('One or more roles not found', 404, 'ROLE_NOT_FOUND');
            }
            // Remove all existing roles
            await database_1.prisma.$executeRawUnsafe(`DELETE FROM "_RoleToUser" WHERE "B" = $1`, userId);
            // Add new roles
            for (const roleId of data.roleIds) {
                await database_1.prisma.$executeRawUnsafe(`INSERT INTO "_RoleToUser" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`, roleId, userId);
            }
        }
        // Fetch updated user with roles
        const updatedUser = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
                staffProfile: true,
                dentistProfile: true,
            },
        });
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async deactivateUser(userId) {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
            include: {
                roles: true,
                staffProfile: true,
                dentistProfile: true,
            },
        });
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async searchUsers(searchTerm, pagination) {
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where: {
                    OR: [
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { firstName: { contains: searchTerm, mode: 'insensitive' } },
                        { lastName: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                include: {
                    roles: true,
                    staffProfile: true,
                    dentistProfile: true,
                },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.user.count({
                where: {
                    OR: [
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                        { firstName: { contains: searchTerm, mode: 'insensitive' } },
                        { lastName: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
            }),
        ]);
        // Remove passwords from response
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        const pages = Math.ceil(total / pagination.limit);
        return {
            data: usersWithoutPasswords,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                pages,
            },
        };
    }
    // Role management
    async createRole(data) {
        // Check if role already exists
        const existingRole = await database_1.prisma.role.findUnique({
            where: { name: data.name },
        });
        if (existingRole) {
            throw (0, errorHandler_1.createAppError)('Role already exists', 400, 'ROLE_ALREADY_EXISTS');
        }
        const role = await database_1.prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
            },
            include: {
                permissions: true,
            },
        });
        // Add permissions if provided
        if (data.permissionIds && data.permissionIds.length > 0) {
            // Verify all permissions exist
            const permissions = await database_1.prisma.permission.findMany({
                where: { id: { in: data.permissionIds } },
            });
            if (permissions.length !== data.permissionIds.length) {
                throw (0, errorHandler_1.createAppError)('One or more permissions not found', 404, 'PERMISSION_NOT_FOUND');
            }
            // Use raw query to add permissions to role
            for (const permissionId of data.permissionIds) {
                await database_1.prisma.$executeRawUnsafe(`INSERT INTO "_PermissionToRole" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`, permissionId, role.id);
            }
        }
        // Fetch role with updated permissions
        const roleWithPermissions = await database_1.prisma.role.findUnique({
            where: { id: role.id },
            include: {
                permissions: true,
            },
        });
        return roleWithPermissions;
    }
    async getRoleById(roleId) {
        const role = await database_1.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: true,
            },
        });
        if (!role) {
            throw (0, errorHandler_1.createAppError)('Role not found', 404, 'ROLE_NOT_FOUND');
        }
        return role;
    }
    async getRoles() {
        return database_1.prisma.role.findMany({
            include: {
                permissions: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async updateRole(roleId, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        const role = await database_1.prisma.role.update({
            where: { id: roleId },
            data: updateData,
            include: {
                permissions: true,
            },
        });
        // Update permissions if provided
        if (data.permissionIds) {
            // Verify all permissions exist
            const permissions = await database_1.prisma.permission.findMany({
                where: { id: { in: data.permissionIds } },
            });
            if (permissions.length !== data.permissionIds.length) {
                throw (0, errorHandler_1.createAppError)('One or more permissions not found', 404, 'PERMISSION_NOT_FOUND');
            }
            // Remove all existing permissions
            await database_1.prisma.$executeRawUnsafe(`DELETE FROM "_PermissionToRole" WHERE "B" = $1`, roleId);
            // Add new permissions
            for (const permissionId of data.permissionIds) {
                await database_1.prisma.$executeRawUnsafe(`INSERT INTO "_PermissionToRole" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`, permissionId, roleId);
            }
        }
        // Fetch updated role with permissions
        const updatedRole = await database_1.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: true,
            },
        });
        return updatedRole;
    }
    async deleteRole(roleId) {
        const role = await database_1.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                users: true,
            },
        });
        if (!role) {
            throw (0, errorHandler_1.createAppError)('Role not found', 404, 'ROLE_NOT_FOUND');
        }
        if (role.users.length > 0) {
            throw (0, errorHandler_1.createAppError)('Cannot delete role with assigned users', 400, 'ROLE_HAS_USERS');
        }
        await database_1.prisma.role.delete({
            where: { id: roleId },
        });
    }
    // Permission management
    async getPermissions() {
        return database_1.prisma.permission.findMany({
            orderBy: { name: 'asc' },
        });
    }
}
exports.UsersService = UsersService;
exports.usersService = new UsersService();
//# sourceMappingURL=users.service.js.map