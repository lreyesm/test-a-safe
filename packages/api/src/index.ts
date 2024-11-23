import Fastify from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJWT from '@fastify/jwt';

import { PrismaClient } from '@prisma/client';

import userRoutes from './routes/user';
import uploadRoutes from './routes/upload';
import postRoutes from './routes/post';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';

const app = Fastify({ logger: true });

// Configuración de JWT
app.register(fastifyJWT, {
    secret: 'your-secret-key', // Cambia esto por una clave segura
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
