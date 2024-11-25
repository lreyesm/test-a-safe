import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

module.exports = async () => {
    console.log('Cleaning up test database...');
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`; // Clear tables (adjust for your schema)
    console.log('Test teardown completed.');
};
