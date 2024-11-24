import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import multipart from '@fastify/multipart';
import path from 'path';

import userRoutes from './routes/user';
import uploadRoutes from './routes/upload';
import postRoutes from './routes/post';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';

const app = Fastify({ logger: true });

// Register multipart plugin
app.register(multipart);

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


app.listen({ port: 3000 }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info('Server is running on http://localhost:3000');
});
