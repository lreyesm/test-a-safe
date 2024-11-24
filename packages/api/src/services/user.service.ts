import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime-types';
import { excludePasswordSelect } from '../utils/user';

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
        await prisma.user.delete({ where: { id: userId } });
    } catch (error) {
        throw new Error('Failed to delete user');
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