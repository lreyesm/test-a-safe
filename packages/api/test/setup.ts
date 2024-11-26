import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/password.service';
import { password } from './utils/utils';

const prisma = new PrismaClient();

const testDatabaseUrl = process.env.DATABASE_URL_TEST;
if (!testDatabaseUrl) {
    throw new Error('JWT_SECRET is not defined in .env');
}
module.exports = async () => {
    console.log('Setting up the test database...');

    // Run migrations
    execSync(`cross-env DATABASE_URL=${testDatabaseUrl} npx prisma migrate dev --name init_test`, {
        stdio: 'inherit',
    });

    console.log('Seeding test data...');
    const adminEmail = 'admin@example.com';
    const userEmail = 'user@example.com';

    // Avoid duplicate entries
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
        await prisma.user.create({
            data: {
                name: 'Admin User',
                email: adminEmail,
                password: await hashPassword(password),
                role: 'admin',
            },
        });
    } else {
        console.log('Admin user already exists.');
    }

    // Avoid duplicate entries
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        await prisma.user.create({
            data: {
                name: 'User',
                email: userEmail,
                password: await hashPassword(password),
                role: 'user',
            },
        });
    } else {
        console.log('User user already exists.');
    }

    console.log('Test setup completed.');
};
