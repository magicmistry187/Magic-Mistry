const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();

// Trust reverse proxy (Render, Cloudflare, Heroku) for accurate IP rate limiting and secure cookies
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://magic-mistry.onrender.com',
  'https://magic-mistry.vercel.app',
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : []),
].filter(Boolean);

// CORS must be before all routes
app.use(
  cors({
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
  }),
);

app.use(cookieParser());

// express.json() is for JSON bodies only — multer handles multipart/form-data separately
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Backend is working');
});

// Routes
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const addressRoutes = require('./routes/address.routes');
const vendorApplicationRoutes = require('./routes/vendorApplication.routes');
const vendorRoutes = require('./routes/vendor.routes');
const adminRoutes = require('./routes/admin.routes')

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/vendor-application', vendorApplicationRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
