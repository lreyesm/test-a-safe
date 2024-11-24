
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { excludePasswordSelect } from '../utils/user';
import { createUserSchema } from '../schemas/user.schema';

const prisma = new PrismaClient();

/**
 * Validates user input for registration.
 * @param data - The user data to validate.
 * @returns Validated user data.
 * @throws z.ZodError if validation fails.
 */
export function validateUserData(data: { name: string; email: string; password: string; role?: string }) {
    return createUserSchema.parse(data);
}

/**
 * Creates a new user in the database.
 * @param data - The user data, including hashed password.
 * @returns The created user object without the password.
 * @throws Error for database-related issues.
 */
export async function createUserInDB(data: { name: string; email: string; hashedPassword: string; role: string }) {
    try {
        return await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.hashedPassword,
                role: data.role,
            },
            select: excludePasswordSelect(),
        });
    } catch (error) {
        throw new Error('Database Error: Failed to create user');
    }
}

/**
 * Verifies if a user has admin privileges.
 * @param role - The role of the user.
 * @throws Error if the user is not an admin.
 */
export function verifyAdminPrivileges(role: string) {
    if (role !== 'admin') {
        throw new Error('Forbidden: Admins only');
    }
}

/**
 * Performs an example admin-specific action.
 * @returns A success message.
 */
export async function performAdminActionService() {
    return { message: 'Admin action successfully performed' };
}

/**
 * Fetches admin dashboard data.
 * @returns A success message with admin dashboard info.
 */
export async function fetchAdminDashboardService() {
    return { message: 'Welcome to the admin dashboard' };
}
