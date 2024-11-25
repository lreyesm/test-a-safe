import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { 
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
}
