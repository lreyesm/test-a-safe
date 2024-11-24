//Execute with 'npx ts-node client/client.ts' to test websocket connection

import WebSocket from 'ws';

// Dirección del servidor WebSocket
/**
 * The URL of the WebSocket server.
 * 
 * This constant holds the address of the WebSocket server that the client will connect to.
 * It is currently set to connect to a local server running on port 3000.
 * 
 * @constant {string}
 */
const serverUrl = 'ws://localhost:3000/ws';

// Crear la conexión WebSocket
const ws = new WebSocket(serverUrl);

ws.on('open', () => {
    console.log('Connected to the WebSocket server');

    // Send a message to the server (optional)
    ws.send(JSON.stringify({ message: 'Hello from the client!' }));
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
