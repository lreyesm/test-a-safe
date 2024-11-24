import Fastify from 'fastify';
import fastifyWebsocket, { SocketStream } from '@fastify/websocket';
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
import { ensureUploadDirExists } from './utils/upload';
import { broadcastNotification } from './services/broadcast.service';

// Create the Fastify app instance with logging enabled
const app = Fastify({ logger: true });

// Ensure the upload directory exists
ensureUploadDirExists();

// Register multipart plugin for handling file uploads
app.register(multipart);

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

// Example of periodic WebSocket notification
setInterval(() => {
    broadcastNotification('This is a periodic broadcast notification to all clients!');
}, 30000); // Broadcasts every 30 seconds

// Handle undefined routes with a 404 response
app.all('*', (request, reply) => {
    reply.code(404).send({ error: 'Route not found' });
});

// Start the server and log errors if any
app.listen({ port: 3000 }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info('Server is running on http://localhost:3000');
});
