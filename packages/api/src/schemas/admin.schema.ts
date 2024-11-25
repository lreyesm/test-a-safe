export const performAdminActionSchema = {
    description: 'Perform an administrative action.',
    tags: ['Admin'],
    summary: 'Administrative Action',
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Admin action performed successfully' },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Failed to perform admin action' },
            },
        },
    },
};

export const fetchAdminDashboardSchema = {
    description: 'Fetch the admin dashboard with relevant statistics and information.',
    tags: ['Admin'],
    summary: 'Admin Dashboard',
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Welcome to the admin dashboard' }, // Agregado
                stats: {
                    type: 'object',
                    properties: {
                        users: { type: 'number', example: 100 },
                        revenue: { type: 'number', example: 5000 },
                    },
                },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Failed to load admin dashboard' },
            },
        },
    },
};
