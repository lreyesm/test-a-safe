import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { excludePasswordSelect } from '../../../utils/user';

const prisma = new PrismaClient();

export default async function userRoutes(app: FastifyInstance) {
    
    // Middleware global para proteger todas las rutas
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify(); // Verifica el token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    // Get all users
    app.get('/', async () => {
        return await prisma.user.findMany({
            select: excludePasswordSelect(),
        });
    });
    
    // Update a user
    app.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            
            // Validate request body with Zod schema
            const data = updateUserSchema.parse(request.body);
            
            const user = await prisma.user.update({
                where: { id: parseInt(id) },
                data,
                select: excludePasswordSelect(),
            });
            reply.code(200).send(user);
        } catch (error) {
            if (error instanceof z.ZodError) {
                reply.code(400).send({ error: error.errors });
            } else {
                reply.code(400).send({ error: 'Invalid data' });
            }
        }
    });
    
    // Delete a user
    app.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            
            await prisma.user.delete({ where: { id: parseInt(id) } });
            reply.code(204).send();
        } catch (error) {
            reply.code(404).send({ error: 'User not found' });
        }
    });

    // Create a new user
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
                select: excludePasswordSelect(),
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
