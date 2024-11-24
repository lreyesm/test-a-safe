import WebSocket from 'ws';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { handleWebSocketError } from './error.service';

const prisma = new PrismaClient();
const clients = new Map<string, WebSocket>();

/**
 * Handles the WebSocket connection lifecycle (connect and disconnect).
 * @param app The Fastify instance.
 * @param connection The WebSocket connection object.
 * @param req The HTTP request object.
 */
export function handleWebSocketConnection(app: FastifyInstance, connection: WebSocket, req: any) {
    try {
        // Extract token and validate
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        const userId = validateWebSocketToken(app, token!);

        // Register WebSocket
        registerWebSocket(userId, connection);

        // Handle disconnection
        connection.on('close', () => {  removeWebSocket(userId); });

    } catch (err) {
        handleWebSocketError(connection, err, 'Unauthorized');
    }
}

/**
 * Broadcast a notification to all connected WebSocket clients.
 * @param message The message to broadcast.
 */
export function broadcastNotification(message: string) {
    for (const [, client] of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ notification: message }));
        }
    }
}

/**
 * Notify a specific user by their user ID.
 * @param userId The ID of the user to notify.
 * @param message The notification message.
 * @returns A boolean indicating whether the notification was sent.
 */
export function notifyUser(userId: string, message: string): boolean {
    for (const [key, client] of clients.entries()) {
        if (key.toString() === userId.toString() && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ notification: message }));
            return true; // Return immediately once the user is found and notified
        }
    }
    return false; // Return false if the user was not found or is not connected
}

/**
 * Notify all users with a specific role.
 * @param role The role to filter users by.
 * @param message The notification message.
 */
export async function notifyUsersByRole(role: string, message: string) {
    for (const [userId, client] of clients.entries()) {
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (user && user.role === role && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ notification: message }));
        }
    }
}

/**
 * Validates the WebSocket token and retrieves the user ID.
 * @param app The Fastify instance.
 * @param token The JWT token to validate.
 * @returns The user ID from the token.
 * @throws Error if the token is invalid or missing.
 */
export function validateWebSocketToken(app: FastifyInstance, token: string): string {
    if (!token) {
        throw new Error('Unauthorized: Token is required');
    }

    const decoded: any = app.jwt.verify(token); // Decode the token
    if (!decoded || !decoded.id) {
        throw new Error('Invalid Token');
    }

    return decoded.id;
}

/**
 * Registers a WebSocket connection for a user.
 * @param userId The ID of the user.
 * @param socket The WebSocket connection.
 */
export function registerWebSocket(userId: string, socket: WebSocket) {
    clients.set(userId, socket);
    console.log(`User connected: ${userId}`);
}

/**
 * Removes a WebSocket connection for a user.
 * @param userId The ID of the user.
 */
export function removeWebSocket(userId: string) {
    clients.delete(userId);
    console.log(`User disconnected: ${userId}`);
}
