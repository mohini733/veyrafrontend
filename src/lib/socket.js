import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    const token = localStorage.getItem('veyra_token');
    if (token) {
      connectSocket(token);
    }
  }
  return socket;
};

export const connectSocket = (token) => {
  if (typeof window === 'undefined') return null;

  const authToken = token || localStorage.getItem('veyra_token');
  if (!authToken) return null;

  // If already connected with same token, return existing socket
  if (socket && socket.connected) {
    return socket;
  }

  // If socket exists but disconnected, disconnect completely first
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: authToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('[Veyra Socket] Connected successfully:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Veyra Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Veyra Socket] Disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
