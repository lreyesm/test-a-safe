export const loginSchema = {
    description: 'Authenticate user with email and password.',
    tags: ['Auth'],
    summary: 'Authenticate user',
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Login successful' },
                token: { type: 'string' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Email and password are required' },
            },
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Invalid email or password' },
            },
        },
    },
};

export const updateProfileSchema = {
    description: 'Update user profile information.',
    tags: ['Auth'],
    summary: 'Update user profile',
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
            },
        },
    },
};

export const protectedRouteSchema = {
    description: 'Get user profile information.',
    tags: ['Auth'],
    summary: 'Get user profile',
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                message: { type: 'string', example: 'Hello, user@example.com' },
            },
        },
    },
};
