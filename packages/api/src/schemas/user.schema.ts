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
