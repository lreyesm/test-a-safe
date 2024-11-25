import { Client } from 'pg';
import fs from 'fs';

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
