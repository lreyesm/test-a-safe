/**
 * Broadcast Routes Tests
 * 
 * This test suite validates the behavior of the broadcast-related routes and WebSocket functionalities.
 * It includes tests for WebSocket connections, broadcasting messages, and error handling.
 */

import supertest from 'supertest';
import { ready, stop } from '../../src/index'; // Import server lifecycle functions
import { password } from '../utils/utils'; // Utility for test credentials
import WebSocket from 'ws'; // Import WebSocket library for testing WebSocket connections

// Declare variables for supertest request and admin token
let request: supertest.SuperTest<supertest.Test>;
let adminToken: string;

// Setup before all tests
beforeAll(async () => {
    const app = await ready(); // Initialize the Fastify app
    await app.ready(); // Ensure Fastify is fully ready
    request = supertest(app.server) as any; // Create a supertest instance for HTTP requests

    // Log in as an admin to retrieve a token for authorization
    const loginResponse = await request.post('/auth/login').send({
        email: 'admin@example.com',
        password: password,
    });
    adminToken = loginResponse.body.token; // Store the admin token
});

// Cleanup after all tests
afterAll(async () => {
    await stop(); // Gracefully stop the Fastify server
});

// Test suite for broadcast routes
describe('Broadcast Routes', () => {
    /**
     * Test: Connect to the WebSocket endpoint and send a message.
     */
    it('should connect to the WebSocket endpoint and send a message', async () => {
        const ws = new WebSocket(`ws://localhost:3000/ws?token=${adminToken}`);

        ws.on('open', () => {
            ws.send(JSON.stringify({ message: 'Hello WebSocket' })); // Send a message upon connection
        });

        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            expect(message).toHaveProperty('notification'); // Validate the notification property
            expect(message.notification).toContain('Hello WebSocket'); // Verify message content
            ws.close(); // Close WebSocket connection
        });

        ws.on('close', () => {
            expect(ws.readyState).toBe(WebSocket.CLOSED); // Ensure WebSocket is closed
        });

        ws.on('error', (err) => {
            fail(`WebSocket error: ${err.message}`); // Fail test on WebSocket error
        });
    });

    /**
     * Test: Trigger a broadcast message.
     */
    it('should trigger a broadcast message', async () => {
        const response = await request
            .get('/broadcast')
            .query({ message: 'This is a test broadcast' }) // Send a broadcast message
            .set('Authorization', `Bearer ${adminToken}`);

        // Validate the response
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Broadcast sent');
        expect(response.body.message).toBe('This is a test broadcast');
    });

    /**
     * Test: Fail to broadcast without a message.
     */
    it('should fail to broadcast without a message', async () => {
        const response = await request
            .get('/broadcast')
            .set('Authorization', `Bearer ${adminToken}`); // No message query parameter

        // Validate the error response
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Message is required');
    });

    /**
     * Test: Fail WebSocket connection with an invalid token.
     */
    it('should fail WebSocket connection with invalid token', async () => {
        const ws = new WebSocket(`ws://localhost:3000/ws?token=invalid_token`);

        ws.on('close', (code) => {
            expect(code).toBe(1006); // Connection closed abnormally
        });

        ws.on('error', (err) => {
            expect(err).toBeDefined(); // Validate error occurrence
        });
    });
});
