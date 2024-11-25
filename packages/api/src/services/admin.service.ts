
/**
 * Verifies if a user has admin privileges.
 * @param role - The role of the user.
 * @throws Error if the user is not an admin.
 */
export function verifyAdminPrivileges(role: string) {
    if (role !== 'admin') {
        throw new Error('Forbidden: Admins only');
    }
}

/**
 * Performs an example admin-specific action.
 * @returns A success message.
 */
export async function performAdminActionService() {
    return { message: 'Admin action successfully performed' };
}

/**
 * Fetches admin dashboard data.
 * @returns A success message with admin dashboard info.
 */
export async function fetchAdminDashboardService() {
    return { message: 'Welcome to the admin dashboard' };
}
