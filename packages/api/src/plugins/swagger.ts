import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10); 

export async function setupSwagger(app: FastifyInstance) {
    // Register the plugin @fastify/swagger
    app.register(swagger, {
        openapi: {
            info: {
                title: 'API Documentation',
                description: 'Comprehensive documentation for the API using Swagger',
                version: '1.0.0',
            },
            servers: [
                {
                    url: `http://localhost:${port}`,
                },
            ],
        },
    });

    // Register the plugin @fastify/swagger-ui para la UI
    app.register(swaggerUi, {
        routePrefix: '/docs', // documentation route
        staticCSP: true,
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
        transformStaticCSP: (header) => header,
    });
}
