import fs from 'fs';
import path from 'path';

export function ensureUploadDirExists() {
    const uploadDir = path.join(__dirname, '../../uploads');
    console.log(`Checking for upload directory: ${uploadDir}`);
    if (!fs.existsSync(uploadDir)) {
        console.log('Directory does not exist. Creating...');
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Directory created.');
    } else {
        console.log('Directory already exists.');
    }
}