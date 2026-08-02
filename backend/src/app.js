const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS must be before all routes
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/address', addressRoutes);

module.exports = app;
