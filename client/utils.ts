
import WebSocket from 'ws';
import axios from 'axios';

// REST and WebSocket server URLs
const restServerUrl = 'http://localhost:3000'; // URL for REST login
const wsServerUrl = 'ws://localhost:3000/ws'; // URL for WebSocket connection

/**
 * Logs in to the server to obtain a JWT token.
 * @returns {Promise<string>} The JWT token received from the server.
 */
export async function login(email: string, password: string): Promise<string> {
    try {
        const response = await axios.post(`${restServerUrl}/auth/login`, {
            email: email, // Replace with valid credentials
            password: password,
        });

        const { token } = response.data; // Ensure the server returns the token in this structure
        console.log('Login successful. Token received:', token);
        return token;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            // Handle Axios errors
            console.error('Error during login:', error.response?.data || error.message);
        } else if (error instanceof Error) {
            // Handle generic errors
            console.error('Error during login:', error.message);
        } else {
            console.error('Unknown error during login');
        }
        process.exit(1); // Exit if the token cannot be obtained
    }
}

/**
 * Connects to the WebSocket server using the JWT token.
 * @param token The JWT token for authentication.
 */
export function connectToWebSocket(token: string) {
    const ws = new WebSocket(`${wsServerUrl}?token=${token}`);

    ws.on('open', () => {
        console.log('Connected to the WebSocket server');
        ws.send(JSON.stringify({ message: 'Hello from the client!' })); // Optional message
    });

    ws.on('message', (data) => {
        console.log('Message received from the server:', data.toString());
    });

    ws.on('close', () => {
        console.log('Connection with the server closed');
    });

    ws.on('error', (error) => {
        console.error('Error in the WebSocket connection:', error);
    });
}