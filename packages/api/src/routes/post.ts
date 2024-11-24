import { FastifyInstance } from 'fastify';
import { getAllPosts, createNewPost, updatePost, deletePost } from '../services/post.service';
import { handleHttpError } from '../services/error.service';

/**
 * Post-related HTTP routes for Fastify.
 * 
 * This module defines routes for creating, updating, deleting, and retrieving posts.
 * The logic is delegated to services for reusability and separation of concerns.
 * 
 * @param app - The Fastify instance.
 */
export default async function postRoutes(app: FastifyInstance) {
    
    /**
     * Middleware to verify the JWT token for authentication.
     * 
     * This hook ensures that all routes in this module are protected.
     */
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify(); // Verify the token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    /**
     * Route to fetch all posts.
     * 
     * This endpoint retrieves all posts along with their associated author details.
     * 
     * @route GET /posts
     * @response { object[] } - The list of posts.
     */
    app.get('/', async (_request, reply) => {
        try {
            const posts = await getAllPosts();
            reply.code(200).send(posts);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to retrieve posts');
        }
    });

    /**
     * Route to create a new post.
     * 
     * This endpoint allows authenticated users to create a new post. 
     * A notification is broadcasted when a post is created.
     * 
     * @route POST /posts
     * @body { title: string, content: string, authorId: number } - The post data.
     * @response { object } - The created post.
     */
    app.post('/', async (request, reply) => {
        try {
            const post = await createNewPost(request.body);
            reply.code(201).send(post);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to create post');
        }
    });

    /**
     * Route to update an existing post.
     * 
     * This endpoint allows users to update the content of an existing post by its ID.
     * 
     * @route PUT /posts/:id
     * @param { string } id - The ID of the post to update.
     * @response { object } - The updated post.
     */
    app.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const post = await updatePost(parseInt(id), request.body);
            reply.code(200).send(post);
        } catch (error) {
            handleHttpError(reply, error, 'Failed to update post');
        }
    });

    /**
     * Route to delete a post by its ID.
     * 
     * This endpoint allows users to delete a post by providing its ID.
     * 
     * @route DELETE /posts/:id
     * @param { string } id - The ID of the post to delete.
     * @response { void }
     */
    app.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            await deletePost(parseInt(id));
            reply.code(204).send(); // Send a "No Content" response
        } catch (error) {
            handleHttpError(reply, error, 'Failed to delete post');
        }
    });
}
