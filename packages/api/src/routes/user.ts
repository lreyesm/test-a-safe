import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { notifyUser } from '../services/broadcast.service';
import {
    getAllUsers,
    updateUser,
    deleteUser,
    getProfilePicture,
} from '../services/user.service';
import { handleHttpError } from '../services/error.service';

/**
 * User-related HTTP routes for Fastify.
 * 
 * This module defines routes for user management, such as fetching, updating, and deleting users.
 * 
 * @param app - The Fastify instance.
 */
export default async function userRoutes(app: FastifyInstance) {
    /**
     * Middleware for authentication.
     * Verifies the JWT token for all user routes.
     */
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    /**
     * Route to fetch all users.
     * 
     * @route GET /users
     * @response { object[] } - The list of users.
     */
    app.get('/', async (_request, reply) => {
        try {
            const users = await getAllUsers();
            reply.code(200).send(users);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to retrieve users');
        }
    });

    /**
     * Route to update a user's details.
     * 
     * @route PUT /users/:id
     * @param { string } id - The ID of the user to update.
     * @response { object } - The updated user.
     */
    app.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const updatedUser = await updateUser(parseInt(id), request.body);
            notifyUser(updatedUser.id.toString(), `User ${updatedUser.name}'s profile has been updated!`);
            reply.code(200).send(updatedUser);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to update user');
        }
    });

    /**
     * Route to delete a user.
     * 
     * @route DELETE /users/:id
     * @param { string } id - The ID of the user to delete.
     * @response { void }
     */
    app.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            await deleteUser(parseInt(id));
            reply.code(204).send();
        } catch (error) {
            handleHttpError(reply, error, 'Failed to delete user');
        }
    });

    /**
     * Route to fetch a user's profile picture.
     * 
     * @route GET /users/:id/profile-picture
     * @param { string } id - The ID of the user.
     * @response { file } - The profile picture file.
     */
    app.get('/:id/profile-picture', async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const { fileBuffer, mimeType } = await getProfilePicture(parseInt(id));
            reply.type(mimeType).send(fileBuffer);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to retrieve profile picture');
        }
    });
}
