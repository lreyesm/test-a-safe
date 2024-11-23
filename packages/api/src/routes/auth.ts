import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createUserSchema } from '../schemas/user.schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

export default async function authRoutes(app: FastifyInstance) {
    
    // Middleware global para proteger rutas excepto login y register
    app.addHook('preHandler', async (request, reply) => {
        const unprotectedRoutes = ['/auth/login'];
        if (!unprotectedRoutes.includes(request.routerPath)) {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.code(401).send({ error: 'Unauthorized' });
            }
        }
    });

    // Login route
    app.post('/login', async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string };

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            reply.code(401).send({ error: 'Invalid email or password' });
            return;
        }

        // Generate JWT
        const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
        reply.send({ message: 'Login successful', token });
    });

    app.put('/profile', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string };
        const userId = (request.user as { id: number }).id;

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, email },
            });

            reply.send(updatedUser);
        } catch (error) {
            reply.code(400).send({ error: 'Failed to update profile' });
        }
    });

    app.get('/protected', async (request, reply) => {
        const user = request.user as { id: number; email: string; role: string };
        reply.send({ message: `Hello, ${user.email}` });
    });
}
