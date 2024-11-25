import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { validateFile, generateFilePaths, saveFile, updateUserProfilePicture, handleProfilePictureUpload } from '../services/upload.service';
import { handleHttpError } from '../services/error.service';

/**
 * Upload-related HTTP routes for Fastify.
 * 
 * This module handles profile picture uploads for authenticated users.
 * 
 * @param app - The Fastify instance.
 */
export default async function uploadRoutes(app: FastifyInstance) {
    /**
     * Middleware for authentication.
     * Ensures all routes are protected by verifying the JWT token.
     */
    app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify(); // Verify JWT token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    /**
     * Route to upload a user's profile picture.
     * 
     * This endpoint allows authenticated users to upload a profile picture.
     * The file is validated for type and size, saved locally, and its URL is updated in the database.
     * 
     * @route POST /uploads/profile-picture
     * @body { file } - The uploaded file.
     * @response { message: string, url: string } - Confirmation of the upload and the file's public URL.
     */
    app.post('/profile-picture', async (req: FastifyRequest, reply: FastifyReply) => {
        const file = await req.file();
        const user = req.user as { id: number }; 

        if (!file) return reply.code(400).send({ error: 'No file uploaded' });

        try {
            const fileUrl = await handleProfilePictureUpload(file, user.id, reply);
            if(!fileUrl) return;

            const message = 'Profile picture uploaded successfully';
            reply.code(200).send({ message: message, url: fileUrl });

        } catch (error) {
            handleHttpError(reply, error, 'Failed to upload profile picture');
        }
    });
}
