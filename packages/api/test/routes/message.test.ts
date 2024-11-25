/**
 * Test suite for Message Routes.
 *
 * This test suite verifies the behavior of routes under the `/messages` endpoint,
 */

import supertest from 'supertest';
import { ready, stop } from '../../src/index';
import { password } from '../utils/utils';

let request: supertest.SuperTest<supertest.Test>;
let userToken: string;
let otherUserId: number;

// Setup before all tests
beforeAll(async () => {
    // Wait for the app to initialize
    const app = await ready();
    await app.ready(); // Ensure Fastify is fully ready
    request = supertest(app.server) as any; // Cast to ensure compatibility

    // Log in as a user to get a token
    const loginResponse = await request.post('/auth/login').send({
        email: 'admin@example.com',
        password: password,
    });
    userToken = loginResponse.body.token;

    // Create another user for messaging
    const createUserResponse = await request
        .post('/users/register')
        .send({
            name: 'Other User',
            email: 'otheruser@example.com',
            password: password,
            role: 'user',
        });
    otherUserId = createUserResponse.body.user.id;
});

afterAll(async () => {
    // Stop the server after all tests are completed
    await stop();
});

describe('Message Routes', () => {
    /**
     * Test: Send a message to another user.
     */
    it('should send a message to another user', async () => {
        const response = await request
            .post('/messages')
            .send({
                content: 'Hello, Other User!',
                receiverId: otherUserId,
            })
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('Message sent');
        expect(response.body.message).toHaveProperty('id');
        expect(response.body.message).toHaveProperty('content', 'Hello, Other User!');
    });

    /**
     * Test: Fail to send a message without content.
     */
    it('should fail to send a message without content', async () => {
        const response = await request
            .post('/messages')
            .send({
                receiverId: otherUserId, // Missing content
            })
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Bad Request');
    });

    /**
     * Test: Fail to send a message without authorization.
     */
    it('should fail to send a message without authorization', async () => {
        const response = await request.post('/messages').send({
            content: 'Hello, World!',
            receiverId: otherUserId,
        });

        // Assert the response
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    /**
     * Test: Retrieve messages between two users.
     */
    it('should retrieve messages between two users', async () => {
        const response = await request
            .get(`/messages/${otherUserId}`)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty('content');
            expect(response.body[0]).toHaveProperty('senderId');
            expect(response.body[0]).toHaveProperty('receiverId');
        }
    });

    /**
     * Test: Fail to retrieve messages without authorization.
     */
    it('should fail to retrieve messages without authorization', async () => {
        const response = await request.get(`/messages/${otherUserId}`);

        // Assert the response
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    /**
     * Test: Fail to retrieve messages with an invalid user ID.
     */
    it('should fail to retrieve messages with an invalid user ID', async () => {
        const response = await request
            .get('/messages/0')
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid user ID');
    });
});
