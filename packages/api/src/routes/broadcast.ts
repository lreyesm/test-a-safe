import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import WebSocket from 'ws';

const clients = new Set<WebSocket>();

/**
 * Broadcast a notification message to all connected WebSocket clients.
 * @param message The message to broadcast.
 */
export function broadcastNotification(message: string) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
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
    app.get('/ws', { websocket: true }, (connection, req) => {
        const ws = connection.socket as WebSocket;
        clients.add(ws);
        console.log('Client connected');

        // Handle incoming messages
        ws.on('message', (message) => {
            console.log(`Message received: ${message}`);
        });

        // Handle client disconnection
        ws.on('close', () => {
            clients.delete(ws);
            console.log('Client disconnected');
        });

        // Send a welcome message to the client
        ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
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
