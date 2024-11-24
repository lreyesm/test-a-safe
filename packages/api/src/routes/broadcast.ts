import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import WebSocket from 'ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clients = new Map<string, WebSocket>();

/**
 * Broadcast a notification message to all connected WebSocket clients.
 * @param message The message to broadcast.
 */
export function broadcastNotification(message: string) {
    for (const [, client] of clients) { // Iteramos sobre los valores de Map
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ notification: message }));
        }
    }
}

/**
 * Notifica a un usuario específico usando su userId.
 * @param userId El ID del usuario.
 * @param message El mensaje de la notificación.
 */
export function notifyUser(userId: string, message: string) {
    clients.forEach((client, key) => {
        console.log(`UserID: ${key}, Client:`);
        if(client && key.toString() === userId.toString()) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ notification: message }));
            }
        }
    });
}

export async function notifyUsersByRole(role: string, message: string) {
    for (const [userId, client] of clients.entries()) {
        // Aquí, consulta tu base de datos para verificar el rol del usuario
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (user && user.role === role && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ notification: message }));
        }
    }
}

/**
 * Register broadcast routes for Fastify.
 * @param app The Fastify instance.
 */
export async function broadcastRoutes(app: FastifyInstance) {
    // WebSocket endpoint for clients to connect
    app.get('/ws', { websocket: true }, async (connection, req) => {
        // Extract the token from the query string
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
            connection.socket.close(1008, 'Unauthorized');
            return;
        }

        try {
            const decoded: any = app.jwt.verify(token);
            const userId = decoded.id; // Assuming the token contains the user's ID

            // Register the WebSocket connection
            clients.set(userId, connection.socket as WebSocket);
            console.log(`User connected: ${userId}`);

            // Handle disconnection
            connection.socket.on('close', () => {
                clients.delete(userId);
                console.log(`User disconnected: ${userId}`);
            });
        } catch (err) {
            connection.socket.close(1008, 'Invalid Token');
        }
    });

    // HTTP endpoint to trigger a broadcast
    app.get('/broadcast', async (request: FastifyRequest, reply: FastifyReply) => {
        const { message } = request.query as { message?: string };
        if (!message) {
            return reply.status(400).send({ error: 'Message is required' });
        }

        broadcastNotification(message);
        return reply.send({ status: 'Broadcast sent', message });
    });
}
