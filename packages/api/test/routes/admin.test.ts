/**
 * Test suite for Admin Routes.
 *
 * This test suite verifies the behavior of routes under the `/admin` endpoint,
 * ensuring proper access control and functionality for authorized admin users.
 */

import supertest from 'supertest';
import { ready, stop } from '../../src/index'; // Import application lifecycle functions
import { password } from '../utils/utils'; // Import shared test utilities

let request: supertest.SuperTest<supertest.Test>; // HTTP client for testing
let adminToken: string; // Admin user JWT token

/**
 * Set up the test environment before all tests.
 * - Initialize the application
 * - Authenticate as an admin to obtain a valid token
 */
beforeAll(async () => {
    const app = await ready(); // Wait for the app to initialize
    await app.ready(); // Explicitly ensure Fastify is ready
    request = supertest(app.server) as any; // Cast to ensure compatibility

    // Log in as admin to get a token
    const loginResponse = await request.post('/auth/login').send({
        email: 'admin@example.com',
        password: password,
    });
    adminToken = loginResponse.body.token;
});

/**
 * Tear down the test environment after all tests.
 * - Gracefully stop the application server
 */
afterAll(async () => {
    await stop();
});

/**
 * Test suite for Admin Routes.
 */
describe('Admin Routes', () => {
    /**
     * Test: Access the admin action route with an admin token.
     */
    it('should access the admin action route', async () => {
        const response = await request
            .post('/admin/action')
            .set('Authorization', `Bearer ${adminToken}`); // Set admin token in headers

        // Assert the response
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Admin action successfully performed');
    });

    /**
     * Test: Access the admin dashboard with an admin token.
     */
    it('should access the admin dashboard', async () => {
        const response = await request
            .get('/admin/dashboard')
            .set('Authorization', `Bearer ${adminToken}`); // Set admin token in headers

        // Assert the response
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Welcome to the admin dashboard');
    });

    /**
     * Test: Attempt to access admin routes with a non-admin user token.
     */
    it('should fail for non-admin user', async () => {
        // Log in as a regular user
        const loginResponse = await request.post('/auth/login').send({
            email: 'user@example.com',
            password: password,
        });
        const userToken = loginResponse.body.token;

        // Attempt to access the admin route
        const response = await request
            .post('/admin/action')
            .set('Authorization', `Bearer ${userToken}`); // Set non-admin token in headers

        // Assert the response
        expect(response.status).toBe(403); // Forbidden
        expect(response.body.error).toBe('Forbidden: Admins only');
    });

    /**
     * Test: Attempt to access admin routes without providing an authorization token.
     */
    it('should return unauthorized for missing token', async () => {
        const response = await request.post('/admin/action'); // No token provided

        // Assert the response
        expect(response.status).toBe(401); // Unauthorized
        expect(response.body.error).toBe('No Authorization was found in request.headers');
    });
});
