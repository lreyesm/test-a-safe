import { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import multipart from '@fastify/multipart';

export default async function uploadRoutes(app: FastifyInstance) {
        
    // Middleware global para proteger todas las rutas
    app.addHook('preHandler', async (request, reply) => {
        try {
            await request.jwtVerify(); // Verifica el token
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
    
    app.post('/upload', async (req, reply) => {
        const data = await req.file();
        if(data){
            const filePath = `uploads/${data.filename}`;
            await fs.writeFile(filePath, data.file);
            reply.code(200).send({ message: 'File uploaded', path: filePath });
        } else {
            reply.code(400).send({ message: 'No file uploaded' });
        }
    });
}
