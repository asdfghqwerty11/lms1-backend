import bcryptjs from 'bcryptjs';
import { prisma } from '../config/database';
import { createAppError } from '../middleware/errorHandler';
import {
  PaginationParams,
  PaginatedResponse,
} from '../types';

const SALT_ROUNDS = 10;

export class UsersService {
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleIds?: string[];
  }): Promise<any> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createAppError('Email already registered', 400, 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
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
      const roles = await prisma.role.findMany({
        where: { id: { in: data.roleIds } },
      });

      if (roles.length !== data.roleIds.length) {
        throw createAppError('One or more roles not found', 404, 'ROLE_NOT_FOUND');
      }

      // Use raw query to add roles to user (Prisma m2m relation)
      for (const roleId of data.roleIds) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "_RoleToUser" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          roleId,
          user.id
        );
      }
    }

    // Fetch user with updated roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: true,
        staffProfile: true,
        dentistProfile: true,
      },
    });

    return userWithRoles;
  }

  async getUserById(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        staffProfile: true,
        dentistProfile: true,
      },
    });

    if (!user) {
      throw createAppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUsers(pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          roles: true,
          staffProfile: true,
          dentistProfile: true,
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
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

  async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      isActive?: boolean;
      roleIds?: string[];
    }
  ): Promise<any> {
    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const user = await prisma.user.update({
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
      const roles = await prisma.role.findMany({
        where: { id: { in: data.roleIds } },
      });

      if (roles.length !== data.roleIds.length) {
        throw createAppError('One or more roles not found', 404, 'ROLE_NOT_FOUND');
      }

      // Remove all existing roles
      await prisma.$executeRawUnsafe(
        `DELETE FROM "_RoleToUser" WHERE "B" = $1`,
        userId
      );

      // Add new roles
      for (const roleId of data.roleIds) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "_RoleToUser" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          roleId,
          userId
        );
      }
    }

    // Fetch updated user with roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        staffProfile: true,
        dentistProfile: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser as any;
    return userWithoutPassword;
  }

  async deactivateUser(userId: string): Promise<any> {
    const user = await prisma.user.update({
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

  async searchUsers(searchTerm: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' as const } },
            { firstName: { contains: searchTerm, mode: 'insensitive' as const } },
            { lastName: { contains: searchTerm, mode: 'insensitive' as const } },
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
      prisma.user.count({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' as const } },
            { firstName: { contains: searchTerm, mode: 'insensitive' as const } },
            { lastName: { contains: searchTerm, mode: 'insensitive' as const } },
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
  async createRole(data: {
    name: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<any> {
    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name },
    });

    if (existingRole) {
      throw createAppError('Role already exists', 400, 'ROLE_ALREADY_EXISTS');
    }

    const role = await prisma.role.create({
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
      const permissions = await prisma.permission.findMany({
        where: { id: { in: data.permissionIds } },
      });

      if (permissions.length !== data.permissionIds.length) {
        throw createAppError('One or more permissions not found', 404, 'PERMISSION_NOT_FOUND');
      }

      // Use raw query to add permissions to role
      for (const permissionId of data.permissionIds) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "_PermissionToRole" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          permissionId,
          role.id
        );
      }
    }

    // Fetch role with updated permissions
    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissions: true,
      },
    });

    return roleWithPermissions;
  }

  async getRoleById(roleId: string): Promise<any> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      throw createAppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    return role;
  }

  async getRoles(): Promise<any[]> {
    return prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      permissionIds?: string[];
    }
  ): Promise<any> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        permissions: true,
      },
    });

    // Update permissions if provided
    if (data.permissionIds) {
      // Verify all permissions exist
      const permissions = await prisma.permission.findMany({
        where: { id: { in: data.permissionIds } },
      });

      if (permissions.length !== data.permissionIds.length) {
        throw createAppError('One or more permissions not found', 404, 'PERMISSION_NOT_FOUND');
      }

      // Remove all existing permissions
      await prisma.$executeRawUnsafe(
        `DELETE FROM "_PermissionToRole" WHERE "B" = $1`,
        roleId
      );

      // Add new permissions
      for (const permissionId of data.permissionIds) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "_PermissionToRole" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          permissionId,
          roleId
        );
      }
    }

    // Fetch updated role with permissions
    const updatedRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
      },
    });

    return updatedRole;
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });

    if (!role) {
      throw createAppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    if (role.users.length > 0) {
      throw createAppError(
        'Cannot delete role with assigned users',
        400,
        'ROLE_HAS_USERS'
      );
    }

    await prisma.role.delete({
      where: { id: roleId },
    });
  }

  // Permission management
  async getPermissions(): Promise<any[]> {
    return prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const usersService = new UsersService();
