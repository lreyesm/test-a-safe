import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { maxFileSize, maxImageSize } from '../utils/upload';
import { FastifyReply } from 'fastify';
import { error } from 'console';

const prisma = new PrismaClient();


/**
 * Handles the full process of uploading and saving a profile picture.
 * 
 * Validates the file, saves it locally, and updates the user's profile picture in the database.
 * 
 * @param file The uploaded file object.
 * @param userId The ID of the user uploading the file.
 * @returns The URL of the uploaded profile picture.
 * @throws Error if the upload process fails.
 */
export async function handleProfilePictureUpload(file: any, userId: number, reply: FastifyReply) {
    // Validate the file
    if(!await validateFile(file, reply)) return '';
    
    // Generate paths for the uploaded file
    const { uploadPath, fileUrl, userDirectory } = generateFilePaths(userId, file.filename);
    
    // Save the file locally
    await saveFile(uploadPath, userDirectory, await file.toBuffer());
    
    // Update the user's profile picture in the database
    await updateUserProfilePicture(userId, fileUrl);

    return fileUrl;
}

/**
 * Validates the uploaded file's type and size.
 * @param fileData The uploaded file object.
 * @throws Error if the file type or size is invalid.
 */
export async function validateFile(fileData: any, reply: FastifyReply) {
    const validTypes = ['image/jpeg', 'image/png'];

    if (!validTypes.includes(fileData.mimetype)) {
        reply.code(400).send({ error: 'Invalid file type. Only JPG and PNG are allowed.' });
        return false;
    }

    const buffer = await fileData.toBuffer();
    const imageMetadata = await sharp(buffer).metadata();

    if (imageMetadata && imageMetadata.size! > maxImageSize) {
        reply.code(400).send({ error: 'File size exceeds the 5MB limit.' });
        return false;
    }
    return true;
}

/**
 * Generates a unique filename and upload path for the uploaded file.
 * @param userId The ID of the user uploading the file.
 * @param originalFilename The original filename of the uploaded file.
 * @returns An object containing the file's unique name, local path, and public URL.
 */
export function generateFilePaths(userId: number, originalFilename: string) {
    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${randomUUID()}${fileExtension}`;
    const userDirectory = path.join(__dirname, '../../uploads/profiles', `${userId}`);
    const uploadPath = path.join(userDirectory, uniqueFilename);
    const fileUrl = `/uploads/profiles/${userId}/${uniqueFilename}`;

    return { uploadPath, fileUrl, userDirectory };
}

/**
 * Saves the uploaded file to the specified path.
 * @param uploadPath The local path where the file will be saved.
 * @param userDirectory The directory where the file will be stored.
 * @param fileBuffer The file's buffer data.
 */
export async function saveFile(uploadPath: string, userDirectory: string, fileBuffer: Buffer) {
    await fs.mkdir(userDirectory, { recursive: true }); // Create the directory if it doesn't exist
    await fs.writeFile(uploadPath, fileBuffer); // Save the file to the specified path
}

/**
 * Updates the user's profile picture URL in the database.
 * @param userId The ID of the user.
 * @param fileUrl The public URL of the uploaded file.
 * @throws Error if the database update fails.
 */
export async function updateUserProfilePicture(userId: number, fileUrl: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: fileUrl },
        });
    } catch (error) {
        throw new Error('Failed to update profile picture in the database.');
    }
}
