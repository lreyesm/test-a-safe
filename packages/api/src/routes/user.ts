import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { notifyUser } from '../services/broadcast.service';
import {
    getAllUsers,
    updateUser,
    deleteUser,
    getProfilePicture,
    validateUserData,
    createUserInDB,
    getUserData,
} from '../services/user.service';
import { handleHookError, handleHttpError, handleServiceError } from '../services/error.service';
import { hashPassword } from '../services/password.service';
import { deleteUserSchema, getAllUsersSchema, getProfilePictureSchema, getUserSchema, registerUserSchema, updateUserSchema, updateUserSwaggerSchema } from '../schemas/user.schema';

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
        const unprotectedRoutes = ['/users/register'];
        if (!request.routeOptions.url || !unprotectedRoutes.includes(request.routerPath)) {
            try {
                await request.jwtVerify();
            } catch (err) {
                handleHookError(err, reply, 'Unauthorized');
            }
        }
    });

    /**
     * Route to fetch all users.
     * 
     * @route GET /users
     * @response { object[] } - The list of users.
     */
    app.get('/', { schema: getAllUsersSchema }, async (_request, reply) => {
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
    app.put('/:id', { schema: updateUserSwaggerSchema }, async (request, reply) => {
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
    app.delete('/:id', { schema: deleteUserSchema }, async (request, reply) => {
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
    app.get('/:id/profile-picture', { schema: getProfilePictureSchema }, async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const { fileBuffer, mimeType } = await getProfilePicture(parseInt(id));
            reply.type(mimeType).send(fileBuffer);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to retrieve profile picture');
        }
    });

    /**
     * Register a new user.
     * @route POST /admin/register
     * @param body - The user data including name, email, password, and role.
     * @returns A success message and the created user object.
     */
    app.post('/register', { schema: registerUserSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Validate user data
            const { name, email, password, role } = validateUserData(request.body as any);

            // Hash the password
            const hashedPassword = await hashPassword(password);

            // Create the user in the database
            const user = await createUserInDB({ name, email, hashedPassword, role: role || 'user' });

            reply.code(201).send({ message: 'User registered successfully', user });
        } catch (error) {
            handleServiceError(error, reply, 'Error creating user');
        }
    });

    
    /**
     * Route to fetch a user's data.
     * 
     * @route POST /users/data
     * @param { string } email - The email of the user.
     * @response { user } - The user found
     */
    app.post('/data', { schema: getUserSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { email } = request.body as any;

            // Get the user in the database
            const user = await getUserData(email);

            if(user) reply.code(200).send({ message: 'User found', user });
            else reply.code(204).send();

        } catch (error) {
            handleServiceError(error, reply, 'Failed to retrieve user');
        }
    });
}
