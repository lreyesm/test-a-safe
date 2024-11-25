import fs from 'fs';
import path from 'path';

export const maxFileSize = 6 * 1024 * 1024;
export const maxImageSize = 5 * 1024 * 1024;

/**
 * Ensures the existence of the uploads directory.
 * 
 * This function checks if the `uploads` directory exists within the project structure.
 * If the directory does not exist, it is created recursively. This ensures that
 * the application always has a valid path for storing uploaded files.
 * 
 * - Logs messages indicating the status of the directory check.
 * - Creates the directory if it doesn't exist.
 */
export function ensureUploadDirExists() {
    const uploadDir = path.join(__dirname, '../../uploads'); // Absolute path to the uploads directory

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true }); // Create directory and any necessary parent directories
    } 
}
