import { PrismaClient } from '@prisma/client';
import { broadcastNotification } from './broadcast.service';
import { z } from 'zod';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema';

const prisma = new PrismaClient();

/**
 * Fetches all posts, including their authors.
 * @returns A list of all posts with author details.
 * @throws Error if posts cannot be retrieved.
 */
export async function getAllPosts() {
    try {
        return await prisma.post.findMany({
            include: { author: true }, // Include related user data
        });
    } catch (error) {
        throw new Error('Failed to retrieve posts');
    }
}

/**
 * Creates a new post and broadcasts a notification.
 * @param requestBody The request body containing the post data.
 * @returns The created post with author details.
 * @throws Error if the post cannot be created.
 */
export async function createNewPost(requestBody: any) {
    try {
        // Validate request body with Zod schema
        const data = createPostSchema.parse(requestBody);

        const post = await prisma.post.create({ data, include: { author: true } });

        // Broadcast a notification about the new post
        broadcastNotification(`New post created by ${post.author.name}: ${post.title}`);

        return post;
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation Error: ${JSON.stringify(error.errors)}`);
        }
        throw new Error('Failed to create post');
    }
}

/**
 * Updates an existing post.
 * @param postId The ID of the post to update.
 * @param requestBody The request body containing the updated post data.
 * @returns The updated post.
 * @throws Error if the post cannot be updated.
 */
export async function updatePost(postId: number, requestBody: any) {
    try {
        // Validate request body with Zod schema
        const data = updatePostSchema.parse(requestBody);

        return await prisma.post.update({ where: { id: postId }, data});

    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation Error: ${JSON.stringify(error.errors)}`);
        }
        throw new Error('Failed to update post');
    }
}

/**
 * Deletes a post by its ID.
 * @param postId The ID of the post to delete.
 * @throws Error if the post cannot be deleted.
 */
export async function deletePost(postId: number) {
    try {
        await prisma.post.delete({ where: { id: postId } });
    } catch (error) {
        throw new Error('Failed to delete post');
    }
}
