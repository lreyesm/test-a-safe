import { Client } from 'pg';
import fs from 'fs';


/**
 * Executes the SQL commands contained in the specified file.
 *
 * @param filePath - The path to the SQL file to be executed.
 * @returns A promise that resolves when the SQL commands have been executed.
 *
 * @throws Will throw an error if there is an issue connecting to the database,
 * reading the SQL file, or executing the SQL commands.

 * @example
 * ```
 *  // Path to the data.sql file
 *  const sqlFilePath = path.join(__dirname, '../../../prisma/data.sql');
 *  // Execute the SQL file
 *  executeSQLFile(sqlFilePath);
 * ```
 */
export const executeSQLFile = async (filePath: string) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        // Connect to the database
        await client.connect();

        // Read the SQL file
        const sql = fs.readFileSync(filePath, 'utf8');

        // Execute the SQL commands
        await client.query(sql);
    } catch (error) {
        throw error;
    } finally {
        // Close the database connection
        await client.end();
    }
};
