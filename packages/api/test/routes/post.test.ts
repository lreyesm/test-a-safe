/**
 * Test suite for Posts Routes.
 *
 * This test suite verifies the behavior of routes under the `/posts` endpoint,
 */
import supertest from 'supertest';
import { ready, stop } from '../../src/index';
import { password } from '../utils/utils';

let request: supertest.SuperTest<supertest.Test>;
let userToken: string;
let postId: number;
let userId: number;


/**
 * Before all tests, start the Fastify server and prepare the request object.
 */
beforeAll(async () => {
    const app = await ready(); // Wait for the app to initialize
    await app.ready(); // Explicitly ensure Fastify is ready
    request = supertest(app.server) as any; // Use supertest for HTTP requests

    // Log in to obtain a valid user token
    const loginResponse = await request.post('/auth/login').send({
        email: 'user@example.com',
        password: password,
    });
    userToken = loginResponse.body.token;
    
    // Get admin id
    const getUserIdResponse = await request
        .get('/auth/protected')
        .set('Authorization', `Bearer ${userToken}`);
    
    userId = getUserIdResponse.body.id;

    // Create a post
    const createPostResponse = await request
        .post('/posts')
        .send({
            title: 'Title of post',
            content: 'Content of post',
            authorId: userId,
        })
        .set('Authorization', `Bearer ${userToken}`);

    postId = createPostResponse.body.id;
});

/**
 * After all tests, stop the Fastify server.
 */
afterAll(async () => {
    await stop(); // Gracefully stop the server after tests
});

describe('Post Routes', () => {
    /**
     * Test: Retrieve all posts.
     */
    it('should retrieve all posts', async () => {
        const response = await request
            .get('/posts')
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); // Response should be an array
    });

    /**
     * Test: Create a new post with valid data.
     */
    it('should create a new post with valid data', async () => {
        const postData = {
            title: 'Test Post',
            content: 'This is a test post.',
            authorId: userId, // Assuming a valid author ID exists
        };

        const response = await request
            .post('/posts')
            .send(postData)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(postData.title);
    });

    /**
     * Test: Fail to create a post with missing fields.
     */
    it('should fail to create a post with missing fields', async () => {
        const postData = {
            content: 'This is a test post without a title.',
        };

        const response = await request
            .post('/posts')
            .send(postData)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(500);
        expect(response.body.error).toContain('Validation Error');
    });

    /**
     * Test: Update an existing post with valid data.
     */
    it('should update an existing post', async () => {
        const updateData = {
            title: 'Updated Test Post',
            content: 'This post has been updated.',
        };

        const response = await request
            .put(`/posts/${postId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updateData.title);
    });

    /**
     * Test: Fail to update a post with invalid data.
     */
    it('should fail to update a post with invalid data', async () => {
        const updateData = {
            title: '', // Invalid title
        };

        const response = await request
            .put(`/posts/${postId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('title is required');
    });

    /**
     * Test: Delete an existing post.
     */
    it('should delete an existing post', async () => {
        const response = await request
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(204); // No content status
    });

    /**
     * Test: Fail to delete a non-existing post.
     */
    it('should fail to delete a non-existing post', async () => {
        const response = await request
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Post not found');
    });
});
