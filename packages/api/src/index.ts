import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import multipart from '@fastify/multipart';
import path from 'path';

// Utility and service imports
import { ensureUploadDirExists, maxFileSize } from './utils/upload';
import { registerRoutes } from './utils/routes';
import { setupSwagger } from './plugins/swagger';
import { executeSQLFile } from './plugins/sqldata';

// Path to the data.sql file
const sqlFilePath = path.join(__dirname, '../../../prisma/data.sql');
 // Execute the SQL file
executeSQLFile(sqlFilePath);

// Create the Fastify app instance with logging enabled
const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

// Port
const port = parseInt(process.env.PORT || '3000', 10); 

// Get the JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in .env');
}


// Configura Swagger
setupSwagger(app);

// Ensure the upload directory exists
ensureUploadDirExists();

// Register multipart plugin for handling file uploads
app.register(multipart, { limits: { fileSize: maxFileSize } });


// Register WebSocket plugin for WebSocket communication
app.register(fastifyWebsocket);
// Register JWT plugin for authentication
app.register(fastifyJWT, {
    secret: jwtSecret,
});

// Serve static files from the uploads directory
app.register(fastifyStatic, {
    root: path.join(__dirname, '../../uploads'),
    prefix: '/uploads/',
});

registerRoutes(app);

// Custom 404 handler
app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'Route not found' });
})

const isTestEnv = process.env.NODE_ENV === 'test';

// Start the server and log errors if any
app.listen({ port: port }, (err) => {
    if (err) {
        app.log.error(err);
        if (isTestEnv) {
            throw new Error('Failed to start server'); // Allow Jest to catch this
        } else {
            process.exit(1); // Only exit in non-test environments
        }
    }
    app.log.info(`Server is running on http://localhost:${port}`);
});

// Ready function for testing
export const ready = async () => {
    if (!app.server.listening) {
        await app.listen({ port: port });
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