import { FastifyInstance } from 'fastify';
import { sendMessage, getMessagesBetweenUsers, validateMessageInput } from '../services/message.service';
import { handleHttpError } from '../services/error.service';

/**
 * Message-related HTTP routes for Fastify.
 * 
 * This module defines routes for sending messages between users and retrieving
 * message histories. The logic is delegated to services for reusability and separation of concerns.
 * 
 * @param app - The Fastify instance.
 */
export default async function messageRoutes(app: FastifyInstance) {
    /**
     * Middleware to verify the JWT token for authentication.
     * 
     * This hook is executed before each route to ensure the request is authenticated.
     */
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify(); // Verify the JWT token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' }); // Respond with an unauthorized error if verification fails
        }
    });

    /**
     * Route to send a new message.
     * 
     * This endpoint allows an authenticated user to send a message to another user.
     * It delegates message creation and notification to the `sendMessage` service.
     * 
     * @route POST /messages
     * @body { content: string, receiverId: number } - The message content and the recipient's user ID.
     * @response { status: string, message: object } - Confirmation of the sent message.
     */
    app.post('/', async (request, reply) => {
        const { content, receiverId } = request.body as { content: string; receiverId: number };
        const senderId = (request.user as any).id; // Retrieve the sender's ID from the authenticated user

        // Validate input
        if (!validateMessageInput(content, receiverId, reply)) return; // Exit early if validation fails
        
        try {
            const message = await sendMessage(senderId, receiverId, content); // Delegate to the service
            reply.code(201).send({ status: 'Message sent', message }); // Send a success response
        } catch (error) {
            handleHttpError(reply, error, 'Error sending message'); // Handle errors using the utility
        }
    });

    /**
     * Route to retrieve messages between two users.
     * 
     * This endpoint retrieves all messages exchanged between the authenticated user and another user.
     * It delegates message retrieval to the `getMessagesBetweenUsers` service.
     * 
     * @route GET /messages/:userId
     * @param { string } userId - The ID of the other user involved in the conversation.
     * @response { object[] } - The list of messages between the two users.
     */
    app.get('/:userId', async (request, reply) => {
        const { userId } = request.params as { userId: string };
        const currentUserId = (request.user as any).id; // Retrieve the current user's ID from the authenticated user

        // Validate userId
        if (isNaN(Number(userId)) || Number(userId) <= 0) return reply.code(400).send({ error: 'Invalid user ID' });
        
        try {
            const messages = await getMessagesBetweenUsers(currentUserId, parseInt(userId)); // Delegate to the service
            reply.code(200).send(messages); // Send the list of messages as the response
        } catch (error) {
            handleHttpError(reply, error, 'Error retrieving messages'); // Handle errors using the utility
        }
    });
}
