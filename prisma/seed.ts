import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
* The main function seeds the database with initial data for users, posts, and messages.
* 
* It performs the following operations:
* 
* 1. Seeds Users:
*    - Creates multiple user records with predefined email, name, password, and role.
*    - Logs the number of users seeded.
* 
* 2. Seeds Posts:
*    - Creates multiple post records with predefined title, content, and authorId.
*    - Logs the number of posts seeded.
* 
* 3. Seeds Messages:
*    - Creates multiple message records with predefined content, senderId, and receiverId.
*    - Logs the number of messages seeded.
* 
* @async
* @function main
* @returns {Promise<void>} A promise that resolves when the seeding is complete.
*/
async function main() {
    // Check if the User table is empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        await prisma.user.createMany({
            data: [
                {
                    email: 'admin@example.com',
                    name: 'Admin User',
                    password: '$2a$10$1K5esEJx1/Ey3Q9SkZawnOKQapnQ75DbnEr7gVze0l/nXahDBqizm',
                    role: 'admin',
                    profilePicture: null,
                },
                {
                    email: 'john.doe@example.com',
                    name: 'John Doe',
                    password: '$2a$10$1K5esEJx1/Ey3Q9SkZawnOKQapnQ75DbnEr7gVze0l/nXahDBqizm',
                    role: 'user',
                    profilePicture: null,
                },
                {
                    email: 'jane.smith@example.com',
                    name: 'Jane Smith',
                    password: '$2a$10$1K5esEJx1/Ey3Q9SkZawnOKQapnQ75DbnEr7gVze0l/nXahDBqizm',
                    role: 'user',
                    profilePicture: null,
                },
            ],
        });
        console.log('Users seeded!');
    }
    
    // Check if the Post table is empty
    const postCount = await prisma.post.count();
    if (postCount === 0) {
        const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
        const john = await prisma.user.findUnique({ where: { email: 'john.doe@example.com' } });
        
        if (admin && john) {
            await prisma.post.createMany({
                data: [
                    {
                        title: 'First Post',
                        content: 'This is the content of the first post.',
                        authorId: admin.id,
                    },
                    {
                        title: 'Second Post',
                        content: 'This is another post created by admin.',
                        authorId: admin.id,
                    },
                    {
                        title: 'User’s First Post',
                        content: 'Content created by John Doe.',
                        authorId: john.id,
                    },
                ],
            });
            console.log('Posts seeded!');
        }
    }
    
    // Check if the Message table is empty
    const messageCount = await prisma.message.count();
    if (messageCount === 0) {
        const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
        const john = await prisma.user.findUnique({ where: { email: 'john.doe@example.com' } });
        const jane = await prisma.user.findUnique({ where: { email: 'jane.smith@example.com' } });
        
        if (admin && john && jane) {
            await prisma.message.createMany({
                data: [
                    {
                        content: 'Hello, Jane!',
                        senderId: john.id,
                        receiverId: jane.id,
                        createdAt: new Date('2024-11-01T10:30:00Z'),
                        read: true,
                    },
                    {
                        content: 'Hey John, how are you?',
                        senderId: jane.id,
                        receiverId: john.id,
                        createdAt: new Date('2024-11-01T11:00:00Z'),
                        read: false,
                    },
                    {
                        content: 'Welcome to the platform!',
                        senderId: admin.id,
                        receiverId: john.id,
                        createdAt: new Date('2024-11-01T09:00:00Z'),
                        read: true,
                    },
                    {
                        content: 'Thanks for the message!',
                        senderId: john.id,
                        receiverId: admin.id,
                        createdAt: new Date('2024-11-01T12:00:00Z'),
                        read: false,
                    },
                ],
            });
            console.log('Messages seeded!');
        }
    }
}

main()
.catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});