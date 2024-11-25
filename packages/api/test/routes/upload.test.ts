/**
 * Test suite for Ppload Routes.
 *
 * This test suite verifies the behavior of routes under the `/upload` endpoint,
 */
import supertest from 'supertest';
import { ready, stop } from '../../src/index';
import path from 'path';
import { password } from '../utils/utils';

let request: supertest.SuperTest<supertest.Test>;
let userToken: string;

beforeAll(async () => {
    const app = await ready(); // Wait for the app to initialize
    await app.ready(); // Ensure Fastify is ready
    request = supertest(app.server) as any; // Cast to ensure compatibility

    // Log in to get the user token
    const loginResponse = await request.post('/auth/login').send({
        email: 'user@example.com',
        password: password,
    });
    userToken = loginResponse.body.token;
});

/**
 * After all tests, stop the Fastify server.
 */
afterAll(async () => {
    await stop(); // Gracefully stop the server after tests
});

/**
 * Test suite for the profile picture upload functionality.
 */
describe('Profile Picture Upload', () => {
    /**
     * Test: Successfully upload a valid profile picture.
     */
    it('should successfully upload a valid profile picture', async () => {
        const filePath = path.join(__dirname, '../files/test-image.png'); // Provide a valid file path
        const response = await request
            .post('/upload/profile-picture')
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', filePath); // Attach the file to the request

        // Assert the response
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Profile picture uploaded successfully');
        expect(response.body).toHaveProperty('url');
    });

    /**
     * Test: Fail to upload a file exceeding the size limit.
     */
    it('should fail to upload a file exceeding the size limit', async () => {
        const filePath = path.join(__dirname, '../files/large-image.png'); // Provide a large file (>5MB)
        const response = await request
            .post('/upload/profile-picture')
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', filePath); // Attach the file to the request

        // Assert the response
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('File size exceeds the 5MB limit.');
    });

    /**
     * Test: Fail to upload when no file is provided.
     */
    it('should fail to upload when no file is provided', async () => {
        const response = await request
            .post('/upload/profile-picture')
            .set('Authorization', `Bearer ${userToken}`);

        // Assert the response
        expect(response.status).toBe(406);
        expect(response.body.error).toBe('Not Acceptable');
    });

    // /**
    //  * Test: Fail to upload an invalid file type.
    //  */
    // it('should fail to upload an invalid file type', async () => {
    //     const filePath = path.join(__dirname, '../files/test-document.txt'); // Provide an invalid file type
    //     const response = await request
    //         .post('/upload/profile-picture')
    //         .set('Authorization', `Bearer ${userToken}`)
    //         .attach('file', filePath); // Attach the file to the request

    //     console.log('Response:', response.body);
    //     // Assert the response
    //     expect(response.status).toBe(400);
    //     expect(response.body.error).toBe('Invalid file type. Only JPG and PNG are allowed.');
    // });

    // /**
    //  * Test: Fail to upload without authentication.
    //  */
    // it('should fail to upload without authentication', async () => {
    //     const filePath = path.join(__dirname, '../files/test-image.png'); // Provide a valid file path
    //     const response = await request.post('/upload/profile-picture').attach('file', filePath);

    //     console.log('============= response =============');
    //     console.log(response.body);

    //     // Assert the response
    //     expect(response.status).toBe(401);
    //     expect(response.body.error).toBe('Unauthorized');
    // });
});
