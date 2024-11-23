import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema';
import { z } from 'zod';

const prisma = new PrismaClient();

export default async function postRoutes(app: FastifyInstance) {
    // Get all posts
    app.get('/', async () => {
        return await prisma.post.findMany({
            include: { author: true }, // Include related user data
        });
    });
    
    // Create a new post
    app.post('/', async (request, reply) => {
        try {
            // Validate request body with Zod schema
            const data = createPostSchema.parse(request.body);
        
            const post = await prisma.post.create({ data });
            reply.code(201).send(post);
        } catch (error) {
            if (error instanceof z.ZodError) {
                reply.code(400).send({ error: error.errors });
            } else {
                reply.code(400).send({ error: 'Invalid data' });
            }
        }
    });
    
    // Update a post
    app.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            
            // Validate request body with Zod schema
            const data = updatePostSchema.parse(request.body);
            
            const post = await prisma.post.update({
                where: { id: parseInt(id) },
                data,
            });
            reply.code(200).send(post);
        } catch (error) {
            if (error instanceof z.ZodError) {
                reply.code(400).send({ error: error.errors });
            } else {
                reply.code(400).send({ error: 'Invalid data' });
            }
        }
    });
    
    // Delete a post
    app.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            
            await prisma.post.delete({ where: { id: parseInt(id) } });
            reply.code(204).send();
        } catch (error) {
            reply.code(404).send({ error: 'Post not found' });
        }
    });
}
