import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/user';
import uploadRoutes from './routes/upload';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

app.register(userRoutes, { prefix: '/users' });
app.register(uploadRoutes, { prefix: '/upload' });

app.listen({ port: 3000 }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info('Server is running on http://localhost:3000');
});
