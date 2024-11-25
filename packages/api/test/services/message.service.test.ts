import { PrismaClient } from '@prisma/client';
import { sendMessage, validateMessageInput, getMessagesBetweenUsers } from '../../src/services/message.service';
import { notifyUser } from '../../src/services/broadcast.service';
import { FastifyReply } from 'fastify';

// Mock Prisma Client
const prisma = new PrismaClient();

// Mock dependencies
jest.mock('../../src/services/broadcast.service', () => ({
    notifyUser: jest.fn(),
}));

describe('Message Service', () => {
    const mockReply = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn(),
    } as unknown as FastifyReply;

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test: Fail to send a message due to database error.
     */
    it('should throw an error when message creation fails', async () => {
        const senderId = 1;
        const receiverId = 2;
        const content = 'Hello, how are you?';

        jest.spyOn(prisma.message, 'create').mockRejectedValueOnce(new Error('Database error'));

        await expect(sendMessage(senderId, receiverId, content)).rejects.toThrow('Failed to send message');
        expect(notifyUser).not.toHaveBeenCalled();
    });

    /**
     * Test: Validate input successfully.
     */
    it('should validate input successfully', () => {
        const isValid = validateMessageInput('Hello', 1, mockReply);

        expect(isValid).toBe(true);
        expect(mockReply.code).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
    });

    /**
     * Test: Fail validation for empty content.
     */
    it('should fail validation for empty content', () => {
        const isValid = validateMessageInput('', 1, mockReply);

        expect(isValid).toBe(false);
        expect(mockReply.code).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Message content is required' });
    });

    /**
     * Test: Fail validation for invalid receiverId.
     */
    it('should fail validation for invalid receiverId', () => {
        const isValid = validateMessageInput('Hello', -1, mockReply);

        expect(isValid).toBe(false);
        expect(mockReply.code).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({ error: 'Valid receiverId is required' });
    });

});
