import { z } from 'zod';

// Schema for creating a user
export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['user', 'admin']).optional(), // Optional, defaults to 'user'
});

// Schema for updating a user
export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
});

export const getAllUsersSchema = {
    description: 'Retrieve all registered users.',
    tags: ['User'],
    summary: 'Get All Users',
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john.doe@example.com' },
                    role: { type: 'string', example: 'user' },
                },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Failed to retrieve users' },
            },
        },
    },
};

export const updateUserSwaggerSchema = {
    description: 'Update user details by ID.',
    tags: ['User'],
    summary: 'Update User',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number', description: 'The ID of the user to update.' },
        },
    },
    body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
            name: { type: 'string', description: 'The updated name of the user.' },
            email: { type: 'string', description: 'The updated email of the user.' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'John Updated' },
                email: { type: 'string', example: 'john.updated@example.com' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Invalid input' },
            },
        },
    },
};

export const deleteUserSchema = {
    description: 'Delete a user by ID.',
    tags: ['User'],
    summary: 'Delete User',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number', description: 'The ID of the user to delete.' },
        },
    },
    response: {
        204: {
            description: 'No Content',
            type: 'null',
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Invalid user ID' },
            },
        },
    },
};

export const registerUserSchema = {
    description: 'Register a new user.',
    tags: ['User'],
    summary: 'Register User',
    body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
            name: { type: 'string', description: 'The name of the user.' },
            email: { type: 'string', format: 'email', description: 'The email address of the user.' },
            password: { type: 'string', description: 'The password for the user account.' },
            role: { type: 'string', enum: ['user', 'admin'], description: 'The role of the user.', default: 'user' },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User registered successfully' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john.doe@example.com' },
                        role: { type: 'string', example: 'user' },
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
    },
};

export const getProfilePictureSchema = {
    description: 'Fetch the profile picture of a user by their ID.',
    tags: ['User'],
    summary: 'Get User Profile Picture',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                type: 'number',
                description: 'The ID of the user whose profile picture is being requested.',
            },
        },
    },
    response: {
        200: {
            description: 'The profile picture file',
            content: {
                'image/png': {
                    schema: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                'image/jpeg': {
                    schema: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Invalid user ID' },
            },
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Profile picture not found' },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Failed to retrieve profile picture' },
            },
        },
    },
};

export const getUserSchema = {
    description: 'Get data of user.',
    tags: ['User'],
    summary: 'Get user',
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' }, // Ensure email is valid
        },
    },
    response: {
        200: {
            description: 'User successfully found',
            type: 'object',
            properties: {
                message: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        profilePicture: { type: ['string', 'null'] }, // Allow null values for profile picture
                    },
                },
            },
        },
        204: {
            description: 'User not found',
            type: 'object',
        }
    },
};