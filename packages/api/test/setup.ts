import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/password.service';

const prisma = new PrismaClient();

module.exports = async () => {
    console.log('Setting up the test database...');
    // Run migrations
    execSync('cross-env DATABASE_URL=postgresql://postgres:26194larm@localhost:5432/mydatabase_test npx prisma migrate dev --name init_test', {
        stdio: 'inherit',
    });

    console.log('Seeding test data...');
    const adminEmail = 'admin@example.com';

    // Avoid duplicate entries
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                name: 'Admin User',
                email: adminEmail,
                password: await hashPassword('12345678'),
                role: 'admin',
            },
        });
    } else {
        console.log('Admin user already exists.');
    }

    console.log('Test setup completed.');
};
