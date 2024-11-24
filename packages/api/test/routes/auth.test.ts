import supertest, { SuperTest, Test } from 'supertest';
import { ready, stop } from '../../src/index';
import { hashPassword } from '../../src/services/password.service';


let request: SuperTest<Test>;

beforeAll(async () => {
    const app = await ready(); // Wait for the app to initialize
    await app.ready(); // Explicitly ensure Fastify is ready
    request = supertest(app.server) as any; // Cast to ensure compatibility
});

afterAll(async () => {
    await stop(); // Gracefully stop the server after tests
});

describe('Auth Routes', () => {
    it('should log in with valid credentials', async () => {
        const hashedPassword = await hashPassword('12345678');
        const response = await request.post('/auth/login').send({
            email: 'admin@example.com',
            password: '12345678', // Use plaintext password here, not hashed
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
        const response = await request.post('/auth/login').send({
            email: 'admin@example.com',
            password: 'wrong_password',
        });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid email or password');
    });
});
