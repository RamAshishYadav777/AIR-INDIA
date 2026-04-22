import { io } from 'socket.io-client';

// Determine the socket URL based on the current environment
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'], // Add polling as fallback
});
