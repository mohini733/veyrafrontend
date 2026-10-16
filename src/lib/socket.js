import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const defaultUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
    'http://localhost:5000';

  if (typeof window !== 'undefined') {
    try {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        /^192\.168\./.test(window.location.hostname) ||
        /^10\./.test(window.location.hostname);

      const targetUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
        defaultUrl;

      // In production (Vercel): use the deployed backend URL directly
      if (!isLocal && targetUrl && !targetUrl.includes('localhost')) {
        return targetUrl.replace(/\/$/, '');
      }

      const url = new URL(targetUrl);
      if (isLocal && url.hostname === 'localhost') {
        url.hostname = window.location.hostname;
        return url.toString().replace(/\/$/, '');
      }
    } catch (e) {}
  }
  return defaultUrl;
};

const SOCKET_URL = getSocketUrl();

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
