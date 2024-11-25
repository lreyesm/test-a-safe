import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import multipart from '@fastify/multipart';
import path from 'path';

// Route imports
import userRoutes from './routes/user';
import uploadRoutes from './routes/upload';
import postRoutes from './routes/post';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import messageRoutes from './routes/message';
import { broadcastRoutes } from './routes/broadcast';

// Utility and service imports
import { ensureUploadDirExists, maxFileSize } from './utils/upload';

// Create the Fastify app instance with logging enabled
const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

// Ensure the upload directory exists
ensureUploadDirExists();

// Register multipart plugin for handling file uploads
app.register(multipart, { limits: { fileSize: maxFileSize } });


// Register WebSocket plugin for WebSocket communication
app.register(fastifyWebsocket);

// Get the JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in .env');
}

// Register JWT plugin for authentication
app.register(fastifyJWT, {
    secret: jwtSecret,
});

// Serve static files from the uploads directory
app.register(fastifyStatic, {
    root: path.join(__dirname, '../../uploads'),
    prefix: '/uploads/',
});

// Register application routes
app.register(authRoutes, { prefix: '/auth' }); // Authentication routes
app.register(userRoutes, { prefix: '/users' }); // User management routes
app.register(uploadRoutes, { prefix: '/upload' }); // File upload routes
app.register(postRoutes, { prefix: '/posts' }); // Post management routes
app.register(adminRoutes, { prefix: '/admin' }); // Admin-specific routes
app.register(messageRoutes, { prefix: '/messages' }); // Messaging routes
app.register(broadcastRoutes); // WebSocket broadcast routes

// Custom 404 handler
app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'Route not found' });
})

const isTestEnv = process.env.NODE_ENV === 'test';

// Start the server and log errors if any
app.listen({ port: 3000 }, (err) => {
    if (err) {
        app.log.error(err);
        if (isTestEnv) {
            throw new Error('Failed to start server'); // Allow Jest to catch this
        } else {
            process.exit(1); // Only exit in non-test environments
        }
    }
    app.log.info('Server is running on http://localhost:3000');
});

// Ready function for testing
export const ready = async () => {
    if (!app.server.listening) {
        await app.listen({ port: 3000 });
    }
    return app;
};

// Stop function for testing
export const stop = async () => {
    if (app.server.listening) {
        await app.close();
    }
};

export default app;