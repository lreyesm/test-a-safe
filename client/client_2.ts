import { connectToWebSocket, login } from './utils';

// Client execution
(async () => {
    try {
        const email = 'stan.smith@example.com';
        const password = '12345678';
        const token = await login(email, password); // Perform login and get the token
        connectToWebSocket(token);  // Connect to the WebSocket using the token
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error during client execution:', error.message);
        } else {
            console.error('Unknown error during client execution');
        }
    }
})();
