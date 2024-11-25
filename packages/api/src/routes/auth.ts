import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { handleHookError } from '../services/error.service';
import {
    validateUserCredentials,
    generateJWT,
    updateUserProfile,
} from '../services/auth.service';
import { loginSchema, protectedRouteSchema, updateProfileSchema } from '../schemas/auth.schema';

export default async function authRoutes(app: FastifyInstance) {
    /**
     * Middleware to protect routes except login.
     */
    app.addHook('preHandler', async (request, reply) => {
        const unprotectedRoutes = ['/auth/login'];
        if (!request.routeOptions.url || !unprotectedRoutes.includes(request.routeOptions.url)) {
            try {
                await request.jwtVerify();
            } catch (err) {
                handleHookError(err, reply, 'Unauthorized');
            }
        }
    });

    /**
     * Login route for users.
     * @route POST /auth/login
     * @body email - The user's email.
     * @body password - The user's password.
     * @returns A JWT token if authentication is successful.
     */
    app.post('/login', { schema: loginSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { email, password } = request.body as { email: string; password: string };
            if(!email || !password) return reply.code(400).send({ error: 'Email and password are required' });
            
            // Validate user credentials
            const user = await validateUserCredentials(email, password);
            if (!user) return reply.code(401).send({ error: 'Invalid email or password' });

            // Generate and return JWT token
            const token = generateJWT(app, user);
            reply.send({ message: 'Login successful', token });
        } catch (err) {
            handleHookError(err, reply, 'Failed to login');
        }
    });

    /**
     * Update user profile.
     * @route PUT /auth/profile
     * @body name - The updated name.
     * @body email - The updated email.
     * @returns The updated user object without the password field.
     */
    app.put('/profile', { schema: updateProfileSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { name, email } = request.body as { name: string; email: string };
            const userId = (request.user as { id: number }).id;

            // Update profile in the database
            const updatedUser = await updateUserProfile(userId, name, email);
            reply.send(updatedUser);
        } catch (err) {
            handleHookError(err, reply, 'Failed to update profile');
        }
    });

    /**
     * Protected route example.
     * @route GET /auth/protected
     * @returns A message with the user's email.
     */
    app.get('/protected', { schema: protectedRouteSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = request.user as { id: number; email: string; role: string };
            reply.send({ id: user.id, message: `Hello, ${user.email}` });
        } catch (err) {
            handleHookError(err, reply, 'Failed to access protected route');
        }
    });
}
