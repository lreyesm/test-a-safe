import { hashPassword, verifyPassword } from '../../src/services/password.service';

describe('Password Service', () => {
    it('should hash a password', async () => {
        const hashedPassword = await hashPassword('password123');
        expect(hashedPassword).not.toEqual('password123');
        expect(hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/); // Match bcrypt pattern
    });

    it('should verify a correct password', async () => {
        const hashedPassword = await hashPassword('password123');
        const isValid = await verifyPassword('password123', hashedPassword);
        expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
        const hashedPassword = await hashPassword('password123');
        const isValid = await verifyPassword('wrongpassword', hashedPassword);
        expect(isValid).toBe(false);
    });
});
