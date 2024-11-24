import { FastifyReply } from 'fastify';
import { z } from 'zod';
import WebSocket from 'ws';

/**
 * Handles errors and sends an appropriate response.
 * @param error - The caught error (could be a validation error or a generic error).
 * @param reply - The FastifyReply object to send the response.
 * @param defaultMessage - A default error message for generic errors.
 */
export function handleServiceError(error: any, reply: FastifyReply, defaultMessage: string) {
    if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        reply.code(400).send({ error: error.errors });
    } else if (error.message?.startsWith('Validation Error:')) {
        // Parse validation errors thrown from services
        reply
            .code(400)
            .send({ error: JSON.parse(error.message.replace('Validation Error: ', '')) });
    } else {
        // Handle other errors (e.g., database errors)
        reply.code(500).send({ error: error.message || defaultMessage });
    }
}

/**
 * Handles errors in hooks or routes.
 * @param err - The caught error (could be unknown or Error).
 * @param reply - The FastifyReply object to send the response.
 * @param forbiddenMessage - Optional forbidden message for specific errors (default: "Forbidden").
 */
export function handleHookError(err: unknown, reply: FastifyReply, forbiddenMessage: string = 'Forbidden') {
    if (err instanceof Error) {
        const statusCode = err.message === forbiddenMessage ? 403 : 401;
        reply.code(statusCode).send({ error: err.message });
    } else {
        reply.code(500).send({ error: 'Unknown error occurred' });
    }
}

/**
 * Handles WebSocket errors by logging them and closing the connection.
 * @param connection The WebSocket connection to close.
 * @param err The error object, which could be unknown.
 * @param defaultMessage The default message to use if the error is unknown.
 */
export function handleWebSocketError(connection: WebSocket, err: unknown, defaultMessage: string = 'Unauthorized') {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('WebSocket connection error:', error.message);
    connection.close(1008, error.message || defaultMessage);
}

/**
 * Handles errors and sends appropriate HTTP responses.
 * @param reply The Fastify reply object.
 * @param error The error object (can be of unknown type).
 * @param defaultMessage A fallback message if the error does not have a meaningful message.
 */
export function handleHttpError(reply: FastifyReply, error: unknown, defaultMessage: string = 'Internal Server Error') {
    const err = error instanceof Error ? error : new Error(defaultMessage);
    console.error(err.message); // Log the error for debugging
    reply.code(500).send({ error: err.message });
}