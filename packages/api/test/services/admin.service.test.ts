import { verifyAdminPrivileges, performAdminActionService, fetchAdminDashboardService } from '../../src/services/admin.service';

describe('Admin Service', () => {
    /**
     * Test: Verify admin privileges for a valid admin user.
     */
    it('should verify admin privileges for a valid admin user', () => {
        expect(() => verifyAdminPrivileges('admin')).not.toThrow();
    });

    /**
     * Test: Throw error for non-admin user.
     */
    it('should throw an error for non-admin user', () => {
        expect(() => verifyAdminPrivileges('user')).toThrow('Forbidden: Admins only');
    });

    /**
     * Test: Perform admin-specific action.
     */
    it('should perform an admin-specific action', async () => {
        const result = await performAdminActionService();
        expect(result).toEqual({ message: 'Admin action successfully performed' });
    });

    /**
     * Test: Fetch admin dashboard data.
     */
    it('should fetch admin dashboard data', async () => {
        const result = await fetchAdminDashboardService();
        expect(result).toEqual({ message: 'Welcome to the admin dashboard' });
    });
});
