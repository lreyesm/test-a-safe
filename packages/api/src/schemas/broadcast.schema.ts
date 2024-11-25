export const webSocketSchema = {
    description: 'WebSocket endpoint for clients to connect and receive real-time updates.',
    tags: ['Broadcast'],
    summary: 'WebSocket Connection',
};

export const broadcastSchema = {
    description: 'Broadcast a message to all connected WebSocket clients.',
    tags: ['Broadcast'],
    summary: 'Broadcast Message',
    querystring: {
        type: 'object',
        required: ['message'],
        properties: {
            message: { type: 'string', description: 'The message to broadcast.' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'Broadcast sent' },
                message: { type: 'string', example: 'Hello everyone!' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Message is required' },
            },
        },
    },
};

export const notifyUserSchema = {
    description: 'Send a notification to a specific user by their user ID.',
    tags: ['Broadcast'],
    summary: 'Notify Specific User',
    querystring: {
        type: 'object',
        required: ['userId', 'message'],
        properties: {
            userId: { type: 'string', description: 'The ID of the user to notify.' },
            message: { type: 'string', description: 'The notification message.' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'Notification sent' },
                userId: { type: 'string', example: '12345' },
                message: { type: 'string', example: 'Hello, User!' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'User ID and message are required' },
            },
        },
    },
};

export const notifyRoleSchema = {
    description: 'Send a notification to all users with a specific role.',
    tags: ['Broadcast'],
    summary: 'Notify Users by Role',
    querystring: {
        type: 'object',
        required: ['role', 'message'],
        properties: {
            role: { type: 'string', description: 'The role to filter users by.' },
            message: { type: 'string', description: 'The notification message.' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'Role-based notification sent' },
                role: { type: 'string', example: 'admin' },
                message: { type: 'string', example: 'System maintenance at midnight.' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Role and message are required' },
            },
        },
    },
};
