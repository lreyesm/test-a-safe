/**
 * Test suite for Authentication Routes.
 *
 * This test suite verifies the functionality of the `/auth` endpoint,
 * including login, access to protected routes, and profile updates.
 */

import supertest, { SuperTest, Test } from 'supertest';
import { ready, stop } from '../../src/index'; // Import application lifecycle functions
import { password } from '../utils/utils'; // Shared utility for test credentials

let request: SuperTest<Test>; // HTTP client for testing

/**
 * Set up the test environment before all tests.
 * - Initialize the application
 * - Create an HTTP client for testing
 */
beforeAll(async () => {
    const app = await ready(); // Wait for the app to initialize
    await app.ready(); // Explicitly ensure Fastify is ready
    request = supertest(app.server) as any; // Cast to ensure compatibility
});

/**
 * Tear down the test environment after all tests.
 * - Gracefully stop the application server
 */
afterAll(async () => {
    await stop(); // Stop the server
});

/**
 * Test suite for Authentication Routes.
 */
describe('Auth Routes', () => {
    /**
     * Test: Successfully log in with valid credentials.
     */
    it('should log in with valid credentials', async () => {
        const response = await request.post('/auth/login').send({
            email: 'admin@example.com',
            password: password, // Use plaintext password here, not hashed
        });

        // Assert the response
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token'); // Ensure a token is returned
    });

    /**
     * Test: Fail to log in with invalid credentials.
     */
    it('should fail with invalid credentials', async () => {
        const response = await request.post('/auth/login').send({
            email: 'admin@example.com',
            password: 'wrong_password', // Incorrect password
        });

        // Assert the response
        expect(response.status).toBe(401); // Unauthorized
        expect(response.body.error).toBe('Invalid email or password');
    });

    /**
     * Test: Access a protected route with a valid token.
     */
    it('should access protected route', async () => {
        // Log in to get a token
        const loginResponse = await request.post('/auth/login').send({
            email: 'admin@example.com',
            password: password,
        });
        const token = loginResponse.body.token;

        // Access the protected route
        const response = await request
            .get('/auth/protected')
            .set('Authorization', `Bearer ${token}`); // Set token in headers

        // Assert the response
        expect(response.status).toBe(200);
        expect(response.body.message).toContain('Hello, admin@example.com');
    });

    /**
     * Test: Update the user's profile.
     */
    it('should update profile', async () => {
        // Log in to get a token
        const loginResponse = await request.post('/auth/login').send({
            email: 'admin@example.com',
            password: password,
        });
        const token = loginResponse.body.token;

        // Update profile
        const response = await request
            .put('/auth/profile')
            .set('Authorization', `Bearer ${token}`) // Set token in headers
            .send({
                name: 'Alejandro', // New profile name
            });

        // Assert the response
        expect(response.status).toBe(200); // OK
        expect(response.body.name).toBe('Alejandro'); // Name is updated
        expect(response.body).toHaveProperty('email', 'admin@example.com'); // Email remains unchanged
    });
});
