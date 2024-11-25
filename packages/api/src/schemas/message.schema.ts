export const sendMessageSchema = {
    description: 'Send a new message to another user.',
    tags: ['Message'],
    summary: 'Send Message',
    body: {
        type: 'object',
        required: ['content', 'receiverId'],
        properties: {
            content: { type: 'string', description: 'The content of the message.' },
            receiverId: { type: 'number', description: 'The ID of the recipient.' },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'Message sent' },
                message: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        senderId: { type: 'number', example: 101 },
                        receiverId: { type: 'number', example: 202 },
                        content: { type: 'string', example: 'Hello!' },
                        createdAt: { type: 'string', example: '2023-11-25T10:30:00Z' },
                    },
                },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Invalid input' },
            },
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    },
};

export const getMessagesSchema = {
    description: 'Retrieve all messages exchanged between the authenticated user and another user.',
    tags: ['Message'],
    summary: 'Get Messages Between Users',
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'number', description: 'The ID of the other user involved in the conversation.' },
        },
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    senderId: { type: 'number', example: 101 },
                    receiverId: { type: 'number', example: 202 },
                    content: { type: 'string', example: 'Hello!' },
                    createdAt: { type: 'string', example: '2023-11-25T10:30:00Z' },
                },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Invalid user ID' },
            },
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    },
};
