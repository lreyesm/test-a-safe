import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import WebSocket from 'ws';
import {
    broadcastNotification,
    handleWebSocketConnection,
    notifyUser,
    notifyUsersByRole,
} from '../services/broadcast.service';

export async function broadcastRoutes(app: FastifyInstance) {
    
    /**
     * WebSocket endpoint for clients to connect.
     */
    app.get('/ws', { websocket: true }, (connection, req) => {
        handleWebSocketConnection(app, connection.socket as WebSocket, req);
    });

    /**
     * HTTP endpoint to broadcast a message to all clients.
     * @route GET /broadcast
     * @query message - The message to broadcast.
     */
    app.get('/broadcast', async (request: FastifyRequest, reply: FastifyReply) => {
        const { message } = request.query as { message?: string };
        if (!message) {
            return reply.status(400).send({ error: 'Message is required' });
        }

        broadcastNotification(message);
        reply.send({ status: 'Broadcast sent', message });
    });

    /**
     * HTTP endpoint to notify a specific user.
     * @route GET /notify
     * @query userId - The ID of the user to notify.
     * @query message - The notification message.
     */
    app.get('/notify', async (request: FastifyRequest, reply: FastifyReply) => {
        const { userId, message } = request.query as { userId?: string; message?: string };
        if (!userId || !message) {
            return reply.status(400).send({ error: 'User ID and message are required' });
        }

        notifyUser(userId, message);
        reply.send({ status: 'Notification sent', userId, message });
    });

    /**
     * HTTP endpoint to notify all users with a specific role.
     * @route GET /notify/role
     * @query role - The role to filter users by.
     * @query message - The notification message.
     */
    app.get('/notify/role', async (request: FastifyRequest, reply: FastifyReply) => {
        const { role, message } = request.query as { role?: string; message?: string };
        if (!role || !message) {
            return reply.status(400).send({ error: 'Role and message are required' });
        }

        await notifyUsersByRole(role, message);
        reply.send({ status: 'Role-based notification sent', role, message });
    });
}
