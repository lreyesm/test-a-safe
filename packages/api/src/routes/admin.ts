import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { 
    validateUserData,
    createUserInDB,
    verifyAdminPrivileges,
    performAdminActionService,
    fetchAdminDashboardService,
} from '../services/admin.service';
import { handleHookError, handleServiceError } from '../services/error.service';
import { hashPassword } from '../services/password.service';

export default async function adminRoutes(app: FastifyInstance) {
    /**
     * Global middleware to protect admin routes.
     * Ensures the user is authenticated and has admin privileges.
     */
    app.addHook('preHandler', async (request, reply) => {
        try {
            // Verify the JWT token
            await request.jwtVerify();

            // Check if the user has admin privileges
            const user = request.user as { role: string };
            verifyAdminPrivileges(user.role);
        } catch (err) {
            handleHookError(err, reply, 'Forbidden: Admins only');
        }
    });

    /**
     * Perform an administrative action.
     * @route POST /admin/action
     * @returns A success message if the action is performed successfully.
     */
    app.post('/action', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await performAdminActionService();
            reply.send(result);
        } catch (error) {
            handleServiceError(error, reply, 'Failed to perform admin action');
        }
    });

    /**
     * Fetch the admin dashboard.
     * @route GET /admin/dashboard
     * @returns A success message with admin dashboard information.
     */
    app.get('/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await fetchAdminDashboardService();
            reply.send(result);
        } catch (error) {
            handleServiceError(error, reply, 'Failed to load admin dashboard');
        }
    });

    /**
     * Register a new user.
     * @route POST /admin/register
     * @param body - The user data including name, email, password, and role.
     * @returns A success message and the created user object.
     */
    app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
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
}
