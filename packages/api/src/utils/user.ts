/**
 * Generates a selection object for excluding sensitive fields from database queries.
 * 
 * This function is used to ensure that sensitive information, like user passwords, 
 * is not included in the query results returned from the database. It is particularly
 * helpful in applications where user data needs to be securely handled.
 * 
 * @returns {object} A Prisma selection object that excludes the password field.
 */
export function excludePasswordSelect(): any {
    return {
        id: true,             // Include the user's unique identifier
        name: true,           // Include the user's name
        email: true,          // Include the user's email address
        role: true,           // Include the user's role (e.g., 'user', 'admin')
        profilePicture: true, // Include the URL to the user's profile picture
    };
}
