import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime-types';
import { excludePasswordSelect } from '../utils/user';
import { createUserSchema } from '../schemas/user.schema';

const prisma = new PrismaClient();

/**
 * Fetches all users from the database, excluding passwords.
 * @returns A list of users without passwords.
 * @throws Error if the query fails.
 */
export async function getAllUsers() {
    try {
        return await prisma.user.findMany({
            select: excludePasswordSelect(),
        });
    } catch (error) {
        throw new Error('Failed to retrieve users');
    }
}

/**
 * Updates a user's details in the database.
 * @param userId The ID of the user to update.
 * @param data The data to update.
 * @returns The updated user object.
 * @throws Error if the update fails or the user does not exist.
 */
export async function updateUser(userId: number, data: any) {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data,
            select: excludePasswordSelect(),
        });
    } catch (error) {
        throw new Error('Failed to update user');
    }
}

/**
 * Deletes a user from the database.
 * @param userId The ID of the user to delete.
 * @throws Error if the user does not exist or cannot be deleted.
 */
export async function deleteUser(userId: number) {
    try {
        const deletedUser = await prisma.user.delete({ where: { id: userId } });
        if (!deletedUser) throw new Error('User not found'); // Throw an error if the post doesn't exist
        
    } catch (error: any) {
        if (error.code === 'P2025') {
            // Prisma-specific error code for "Record to delete does not exist"
            throw new Error('User not found');
        }
        throw new Error('Failed to delete user'); // Generic error for other issues
    }
}

/**
 * Fetches the profile picture path for a user.
 * @param userId The ID of the user.
 * @returns The file path of the user's profile picture.
 * @throws Error if the user or their profile picture is not found.
 */
async function getUserProfilePicturePath(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true },
    });

    if (!user || !user.profilePicture) {
        throw new Error('User or profile picture not found');
    }

    return path.join(__dirname, '../../', user.profilePicture);
}

/**
 * Validates that a file exists at the given path.
 * @param filePath The path of the file.
 * @throws Error if the file does not exist.
 */
async function validateFileExists(filePath: string): Promise<void> {
    try {
        await fs.access(filePath);
    } catch {
        throw new Error('Profile picture file not found');
    }
}

/**
 * Reads a file from the specified path.
 * @param filePath The path of the file.
 * @returns An object containing the file's buffer and MIME type.
 */
async function readFileBuffer(filePath: string): Promise<{ fileBuffer: Buffer; mimeType: string }> {
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const fileBuffer = await fs.readFile(filePath);

    return { fileBuffer, mimeType };
}

/**
 * Retrieves the profile picture of a user.
 * Combines fetching, validation, and reading the file.
 * @param userId The ID of the user.
 * @returns An object containing the file's buffer and MIME type.
 */
export async function getProfilePicture(userId: number) {
    const filePath = await getUserProfilePicturePath(userId);
    await validateFileExists(filePath);
    return readFileBuffer(filePath);
}

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
 * Retrieves user data based on the provided email.
 *
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<object | null>} A promise that resolves to the user data excluding the password, or null if no user is found.
 * @throws {Error} If there is an error retrieving the user data.
 */
export async function getUserData(email: string): Promise<object | null> {
    try {
        return await prisma.user.findUnique({
            where: { email: email },
            select: excludePasswordSelect(),
        });
    } catch (error) {
        throw new Error('Failed to retrieve user');
    }
}
