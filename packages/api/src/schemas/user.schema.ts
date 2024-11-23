import { z } from 'zod';

// Schema for creating a user
export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
});

// Schema for updating a user
export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
});
