import { FastifyInstance } from 'fastify';
import userRoutes from '../routes/user';
import uploadRoutes from '../routes/upload';
import postRoutes from '../routes/post';
import adminRoutes from '../routes/admin';
import authRoutes from '../routes/auth';
import messageRoutes from '../routes/message';
import { broadcastRoutes } from '../routes/broadcast';

/**
 * Registers all application routes.
 * @param app The Fastify instance.
 */
export function registerRoutes(app: FastifyInstance) {
    app.register(authRoutes, { prefix: '/auth' });
    app.register(userRoutes, { prefix: '/users' });
    app.register(uploadRoutes, { prefix: '/upload' });
    app.register(postRoutes, { prefix: '/posts' });
    app.register(adminRoutes, { prefix: '/admin' });
    app.register(messageRoutes, { prefix: '/messages' });
    app.register(broadcastRoutes);
}
