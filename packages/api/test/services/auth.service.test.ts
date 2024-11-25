import { PrismaClient } from '@prisma/client';
import { validateUserCredentials, generateJWT, updateUserProfile } from '../../src/services/auth.service';
import { hashPassword, verifyPassword } from '../../src/services/password.service';
import Fastify from 'fastify';

const prisma = new PrismaClient();

describe('Auth Service', () => {
    const fastifyApp = Fastify();
    const testUser = {
        id: 1,
        name: 'Test User',
        email: 'testuser@example.com',
        role: 'user',
        password: 'password123',
    };

    beforeAll(async () => {
        // Register JWT plugin
        fastifyApp.register(require('@fastify/jwt'), { secret: 'test-secret' });

        // Create a test user
        const user = await prisma.user.create({
            data: {
                name: testUser.name,
                email: testUser.email,
                password: await hashPassword(testUser.password),
                role: testUser.role,
            },
        });
        testUser.id = user.id;
    });

    afterAll(async () => {
        // Clean up database
        await prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma.$disconnect();
    });

    /**
     * Test: Validate user credentials with correct email and password.
     */
    it('should validate user credentials with correct email and password', async () => {
        const user = await validateUserCredentials(testUser.email, testUser.password);

        expect(user).not.toBeNull();
        expect(user).toHaveProperty('id', testUser.id);
        expect(user).toHaveProperty('email', testUser.email);
    });

    /**
     * Test: Fail to validate user credentials with incorrect password.
     */
    it('should fail to validate user credentials with incorrect password', async () => {
        const user = await validateUserCredentials(testUser.email, 'wrongpassword');

        expect(user).toBeNull();
    });

    /**
     * Test: Fail to validate user credentials with non-existing email.
     */
    it('should fail to validate user credentials with non-existing email', async () => {
        const user = await validateUserCredentials('nonexistent@example.com', testUser.password);

        expect(user).toBeNull();
    });
});
