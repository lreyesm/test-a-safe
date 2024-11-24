import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { notifyUser } from './broadcast'; // Make sure to import your notification function

const prisma = new PrismaClient();

export default async function messageRoutes(app: FastifyInstance) {
    // Middleware to verify JWT
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify(); // Verify the token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    // Send a message
    app.post('/', async (request, reply) => {
        const { content, receiverId } = request.body as { content: string; receiverId: number };
        const senderId = (request.user as any).id; 
        
        try {
            const message = await prisma.message.create({
                data: {
                    content,
                    senderId,
                    receiverId,
                },
            });
            
            notifyUser(receiverId.toString(), `New message from ${senderId}: ${content}`);
            
            reply.code(201).send({ status: 'Message sent', message });
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Error sending message' });
        }
    });

    // Get messages between two users
    app.get('/:userId', async (request, reply) => {
        const { userId } = request.params as { userId: string };
        const currentUserId = (request.user as any).id; 
        
        try {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: parseInt(userId) },
                        { senderId: parseInt(userId), receiverId: currentUserId },
                    ],
                },
                orderBy: { createdAt: 'asc' },
            });
            
            reply.code(200).send(messages);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Error retrieving messages' });
        }
    });

}
