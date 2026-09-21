const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { setIO } = require('./socketEmitter');

const allowedOrigins = [
  'https://magic-mistry.onrender.com',
  'https://magic-mistry.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : []),
].filter(Boolean);

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          process.env.NODE_ENV !== 'production'
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication Middleware for Socket connections
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.token;

      if (!token) {
        // Allow unauthenticated connection or reject?
        // Rejecting unauthorized sockets keeps rooms private & secure.
        return next(new Error('Authentication token required for real-time connection.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        ...decoded,
        id: decoded.id || decoded.userId,
      };

      next();
    } catch (err) {
      console.warn('[Socket Auth Error]:', err.message);
      return next(new Error('Authentication failed: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const role = (user?.role || '').toLowerCase();
    const userId = String(user?.id);

    console.log(`[Socket Connected] User ${userId} (${role}) | Socket ID: ${socket.id}`);

    // Join personal user room (for customer & vendor specific updates)
    socket.join(`user:${userId}`);

    // Role-specific rooms
    if (role === 'vendor') {
      socket.join(`vendor:${userId}`);
      socket.join('vendors:available');
      console.log(`[Socket] Vendor ${userId} joined room 'vendors:available'`);
    } else if (role === 'admin') {
      socket.join('admin');
      console.log(`[Socket] Admin ${userId} joined room 'admin'`);
    }

    // Ping / health check event
    socket.on('client:ping', () => {
      socket.emit('server:pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] User ${userId} | Reason: ${reason}`);
    });
  });

  // Store singleton instance in socketEmitter
  setIO(io);

  return io;
};

module.exports = { initSocket };
