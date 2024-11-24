import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { excludePasswordSelect } from '../utils/user';

const prisma = new PrismaClient();

/**
 * Validates the user's login credentials.
 * @param email - The user's email address.
 * @param password - The plain-text password provided by the user.
 * @returns The user object if credentials are valid, otherwise null.
 */
export async function validateUserCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
        return user;
    }
    return null;
}

/**
 * Generates a JWT token for the authenticated user.
 * @param app - The Fastify instance to use the JWT plugin.
 * @param user - The user object containing id, email, and role.
 * @returns The generated JWT token.
 */
export function generateJWT(app: any, user: { id: number; email: string; role: string }) {
    return app.jwt.sign({ id: user.id, email: user.email, role: user.role });
}

/**
 * Updates the user's profile information.
 * @param userId - The ID of the user to update.
 * @param name - The new name for the user.
 * @param email - The new email for the user.
 * @returns The updated user object without the password field.
 * @throws An error if the update fails.
 */
export async function updateUserProfile(userId: number, name: string, email: string) {
    return await prisma.user.update({
        where: { id: userId },
        data: { name, email },
        select: excludePasswordSelect(),
    });
}
