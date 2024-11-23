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
