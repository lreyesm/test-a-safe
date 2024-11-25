import { z } from 'zod';

// Define the schema for creating a post
export const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    authorId: z.number().positive('Author ID must be a positive number'),
});

// Define the schema for updating a post
export const updatePostSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
});

export const getAllPostsSchema = {
    description: 'Retrieve all posts with their associated author details.',
    tags: ['Post'],
    summary: 'Get All Posts',
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    title: { type: 'string', example: 'Post Title' },
                    content: { type: 'string', example: 'This is the content of the post.' },
                    author: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 101 },
                            name: { type: 'string', example: 'Author Name' },
                        },
                    },
                },
            },
        },
    },
};

export const createPostSwaggerSchema = {
    description: 'Create a new post.',
    tags: ['Post'],
    summary: 'Create Post',
    body: {
        type: 'object',
        required: ['title', 'content', 'authorId'],
        properties: {
            title: { type: 'string', description: 'The title of the post.' },
            content: { type: 'string', description: 'The content of the post.' },
            authorId: { type: 'number', description: 'The ID of the author.' },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Post Title' },
                content: { type: 'string', example: 'This is the content of the post.' },
                authorId: { type: 'number', example: 101 },
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

export const updatePostSwaggerSchema = {
    description: 'Update an existing post by its ID.',
    tags: ['Post'],
    summary: 'Update Post',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number', description: 'The ID of the post to update.' },
        },
    },
    body: {
        type: 'object',
        required: ['title'],
        properties: {
            title: { type: 'string', description: 'The new title of the post.' },
            content: { type: 'string', description: 'The new content of the post.' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Updated Title' },
                content: { type: 'string', example: 'Updated content of the post.' },
                authorId: { type: 'number', example: 101 },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'title is required' },
            },
        },
    },
};

export const deletePostSchema = {
    description: 'Delete a post by its ID.',
    tags: ['Post'],
    summary: 'Delete Post',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number', description: 'The ID of the post to delete.' },
        },
    },
    response: {
        204: {
            description: 'No Content',
            type: 'null',
        },
    },
};
