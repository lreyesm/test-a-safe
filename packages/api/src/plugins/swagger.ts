import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function setupSwagger(app: FastifyInstance) {
    // Registrar el plugin @fastify/swagger
    app.register(swagger, {
        openapi: {
            info: {
                title: 'API Documentation',
                description: 'Comprehensive documentation for the API using Swagger',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                },
            ],
        },
    });

    // Registrar el plugin @fastify/swagger-ui para la UI
    app.register(swaggerUi, {
        routePrefix: '/docs', // Ruta para la documentación
        staticCSP: true,
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
        transformStaticCSP: (header) => header,
        // exposeRoute: true,
    });
}
