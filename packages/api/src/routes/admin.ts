import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createUserSchema } from '../schemas/user.schema';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function adminRoutes(app: FastifyInstance) {

    // Middleware global para proteger todas las rutas en /admin
    app.addHook('preHandler', async (request, reply) => {
        try {
            // Verifica el token
            await request.jwtVerify();

            // Autoriza solo a usuarios con el rol "admin"
            const user = request.user as { role: string };
            if (user.role !== 'admin') {
                reply.code(403).send({ error: 'Forbidden: Admins only' });
            }
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    // Ejemplo de ruta protegida para administradores
    app.post('/admin-action', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Acción administrativa aquí
            reply.send({ message: 'Admin action successfully performed' });
        } catch (error) {
            reply.code(500).send({ error: 'Failed to perform admin action' });
        }
    });

    // Otra ruta de ejemplo para administradores
    app.get('/admin-dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Información administrativa aquí
            reply.send({ message: 'Welcome to the admin dashboard' });
        } catch (error) {
            reply.code(500).send({ error: 'Failed to load admin dashboard' });
        }
    });

    
    // Register route
    app.post('/register', async (request, reply) => {
        try {
            // Validate the request body using Zod
            const validatedData = createUserSchema.parse(request.body);

            // Destructure the validated data
            const { name, email } = validatedData;
            const { password, role } = request.body as { password: string; role?: string };

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the user in the database
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword, // Store the hashed password
                    role: role || 'user', // Default to 'user'
                },
            });

            reply.code(201).send({ message: 'User registered successfully', user });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle validation errors
                reply.code(400).send({ error: error.errors });
            } else {
                // Handle other errors
                reply.code(500).send({ error: 'Error creating user' });
            }
        }
    });
}
