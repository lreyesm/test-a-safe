import { PrismaClient } from '@prisma/client';
import { notifyUser } from './broadcast.service';
import { FastifyReply } from 'fastify';

const prisma = new PrismaClient();

/**
 * Sends a new message and notifies the receiver.
 * @param senderId The ID of the sender.
 * @param receiverId The ID of the receiver.
 * @param content The message content.
 * @returns The created message.
 * @throws Error if the message could not be sent.
 */
export async function sendMessage(senderId: number, receiverId: number, content: string) {
    try {
        const message = await prisma.message.create({
            data: { content, senderId, receiverId }
        });

        // Notify the receiver
        notifyUser(receiverId.toString(), `New message from ${senderId}: ${content}`);

        return message;
    } catch (error) {
        throw new Error('Failed to send message');
    }
}

/**
 * Validates the input for sending a message.
 * 
 * @param content The content of the message.
 * @param receiverId The ID of the message recipient.
 * @param reply The FastifyReply object to send responses in case of validation failure.
 * @returns A boolean indicating if the input is valid.
 */
export function validateMessageInput(content: string | undefined, receiverId: number | undefined, reply: FastifyReply): boolean {
    if (!content || content.trim() === '') {
        reply.code(400).send({ error: 'Message content is required' });
        return false;
    }
    if (!receiverId || isNaN(Number(receiverId)) || Number(receiverId) <= 0) {
        reply.code(400).send({ error: 'Valid receiverId is required' });
        return false;
    }
    return true;
}

/**
 * Retrieves all messages between two users.
 * @param userId1 The ID of the first user.
 * @param userId2 The ID of the second user.
 * @returns The list of messages between the two users.
 * @throws Error if messages could not be retrieved.
 */
export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
    try {
        return await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    } catch (error) {
        throw new Error('Failed to retrieve messages');
    }
}
