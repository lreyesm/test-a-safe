/**
 * Test suite for User Routes.
 *
 * This test suite verifies the behavior of routes under the `/users` endpoint,
 */

import supertest from 'supertest';
import { ready, stop } from '../../src/index';
import { password } from '../utils/utils';

let request: supertest.SuperTest<supertest.Test>;
let adminToken: string; // Admin authentication token
let userToken: string;  // User authentication token
let userIdToDelete: number; // ID of the user to delete

beforeAll(async () => {
    const app = await ready();
    await app.ready();
    request = supertest(app.server as unknown as import('http').Server) as any;

    // Login as admin to get the token
    const adminLogin = await request.post('/auth/login').send({
        email: 'admin@example.com',
        password: password,
    });
    adminToken = adminLogin.body.token;

    // Register a regular user
    const userRegistration = await request.post('/users/register').send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: password,
    });
    userIdToDelete = userRegistration.body.user.id;

    // Login as the regular user to get their token
    const userLogin = await request.post('/auth/login').send({
        email: 'testuser@example.com',
        password: password,
    });
    userToken = userLogin.body.token;
});

afterAll(async () => {
    await stop();
});

/**
 * Test Suite: User Routes
 */
describe('User Routes', () => {
    /**
     * Test: Get all users.
     */
    it('should retrieve all users', async () => {
        const response = await request
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    /**
     * Test: Update a user's profile.
     */
    it('should update the user profile', async () => {
        const response = await request
            .put(`/users/${userIdToDelete}`)
            .send({ name: 'Updated Name', email: 'updatedemail@example.com' })
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Name');
        expect(response.body.email).toBe('updatedemail@example.com');
    });

    /**
     * Test: Delete a user.
     */
    it('should delete a user', async () => {
        const response = await request
            .delete(`/users/${userIdToDelete}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(204);
    });

    /**
     * Test: Fail to delete a non-existing user.
     */
    it('should fail to delete a non-existing user', async () => {
        const response = await request
            .delete(`/users/0`) // Non-existent user ID
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('User not found');
    });

    /**
     * Test: Register a new user.
     */
    it('should register a new user', async () => {
        const response = await request.post('/users/register').send({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'newpassword',
        });

        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.name).toBe('New User');
        expect(response.body.user.email).toBe('newuser@example.com');
    });

    /**
     * Test: Fail to register a user with an invalid email.
     */
    it('should fail to register a user with invalid email', async () => {
        const response = await request.post('/users/register').send({
            name: 'Invalid Email User',
            email: 'not-an-email',
            password: 'somepassword',
        });

        // Assert the response status
        expect(response.status).toBe(400);
    
        // Assert the response body
        expect(response.body.error).toEqual('Bad Request');
    });
    

    /**
     * Test: Fail to update user with invalid data.
     */
    it('should fail to update a user with invalid data', async () => {
        const response = await request
            .put(`/users/${userIdToDelete}`)
            .send({ email: 'invalidemail' }) // Invalid email
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Bad Request');
    });
});
