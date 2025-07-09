import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-8dew.onrender.com/';

// Crear y exportar una sola instancia
export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket']
});
