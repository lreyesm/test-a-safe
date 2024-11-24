import bcrypt from 'bcryptjs';

/**
 * Hashes a plain text password.
 * 
 * @param password The plain text password to hash.
 * @returns A promise resolving to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Adjust salt rounds as needed
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * 
 * @param password The plain text password to compare.
 * @param hashedPassword The hashed password to compare against.
 * @returns A promise resolving to true if the passwords match, false otherwise.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}
