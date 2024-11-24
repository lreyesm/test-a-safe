import Fastify from 'fastify';
import fastifyWebsocket, { SocketStream } from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import multipart from '@fastify/multipart';
import path from 'path';

import userRoutes from './routes/user';
import uploadRoutes from './routes/upload';
import postRoutes from './routes/post';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import messageRoutes from './routes/message';
import { broadcastRoutes } from './routes/broadcast';

import { ensureUploadDirExists} from '../../utils/upload';
import { broadcastNotification } from './routes/broadcast';

const app = Fastify({ logger: true });

ensureUploadDirExists();

// Register multipart plugin
app.register(multipart);

app.register(fastifyWebsocket);

// Get the JWT secret key from the environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in .env');
}

// Configuración de JWT
app.register(fastifyJWT, {
    secret: jwtSecret, // Cambia esto por una clave segura
});

// Serve static files
app.register(fastifyStatic, {
    root: path.join(__dirname, '../../uploads'),
    prefix: '/uploads/', 
});

//Routes
app.register(authRoutes, { prefix: '/auth' }); 
app.register(userRoutes, { prefix: '/users' });
app.register(uploadRoutes, { prefix: '/upload' });
app.register(postRoutes, { prefix: '/posts' });
app.register(adminRoutes, { prefix: '/admin' });
app.register(messageRoutes, { prefix: '/messages' });
app.register(broadcastRoutes);


// Example usage of broadcastNotification (for testing purposes)
setInterval(() => {
    broadcastNotification('This is a periodic broadcast notification to all clients!');
}, 30000); // Broadcast a message every 10 seconds

app.all('*', (request, reply) => {
    reply.code(404).send({ error: 'Route not found' });
});

app.listen({ port: 3000 }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info('Server is running on http://localhost:3000');
});
