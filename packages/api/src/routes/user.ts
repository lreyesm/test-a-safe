import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function userRoutes(app: FastifyInstance) {
    app.get('/', async () => {
        return await prisma.user.findMany();
    });
    
    app.post('/', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string };
        const user = await prisma.user.create({ data: { name, email } });
        reply.code(201).send(user);
    });
    
    app.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name, email } = request.body as { name: string; email: string };
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { name, email },
        });
        reply.code(200).send(user);
    });
    
    app.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        await prisma.user.delete({ where: { id: parseInt(id) } });
        reply.code(204).send();
    });
}
