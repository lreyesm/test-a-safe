import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function uploadRoutes(app: FastifyInstance) {
    // Middleware for authentication
    app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify(); // Verify JWT token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    // Upload profile picture
    app.post('/profile-picture', async (req: any, reply) => {
        const data = await req.file();
        const user = req.user as { id: number }; // Assuming JWT payload contains the user ID
    
        if (!data) {
            reply.code(400).send({ message: 'No file uploaded' });
            return;
        }
    
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(data.mimetype)) {
            reply.code(400).send({ message: 'Invalid file type. Only JPG and PNG are allowed.' });
            return;
        }
    
        // Validate file size (max 5MB)
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (data.file.bytesRead > maxFileSize) {
            reply.code(400).send({ message: 'File size exceeds the 5MB limit.' });
            return;
        }
    
        // Generate a unique filename and path for the user's ID
        const fileExtension = path.extname(data.filename);
        const uniqueFilename = `${randomUUID()}${fileExtension}`;
        const userDirectory = path.join(__dirname, '../../uploads/profiles', `${user.id}`);
        const uploadPath = path.join(userDirectory, uniqueFilename);
        const fileUrl = `/uploads/profiles/${user.id}/${uniqueFilename}`;
    
        try {
            // Save the file locally
            await fs.mkdir(userDirectory, { recursive: true });
            await fs.writeFile(uploadPath, await data.toBuffer());
    
            // Update user's profilePicture field in the database
            await prisma.user.update({
                where: { id: user.id },
                data: { profilePicture: fileUrl },
            });
    
            reply.code(200).send({
                message: 'Profile picture uploaded successfully',
                url: fileUrl,
            });
        } catch (err) {
            console.error('Error uploading file:', err);
            reply.code(500).send({ error: 'Failed to upload profile picture' });
        }
    });
    
}
