export const uploadProfilePictureSchema = {
    description: 'Upload a profile picture for the authenticated user.',
    tags: ['Upload'],
    summary: 'Upload Profile Picture',
    consumes: ['multipart/form-data'],
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Profile picture uploaded successfully' },
                url: { type: 'string', example: 'https://example.com/uploads/profile-picture.jpg' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'No file uploaded' },
            },
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Failed to upload profile picture' },
            },
        },
    },
};
