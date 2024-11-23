import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { z } from 'zod';

const prisma = new PrismaClient();

export default async function userRoutes(app: FastifyInstance) {
    // Get all users
    app.get('/', async () => {
        return await prisma.user.findMany();
    });
    
    // Create a new user
    app.post('/', async (request, reply) => {
        try {
            // Validate request body with Zod schema
            const data = createUserSchema.parse(request.body);
            
            const user = await prisma.user.create({ data });
            reply.code(201).send(user);
        } catch (error) {
            if (error instanceof z.ZodError) {
                reply.code(400).send({ error: error.errors });
            } else {
                reply.code(400).send({ error: 'Invalid data' });
            }
        }
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
}
