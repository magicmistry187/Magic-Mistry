const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// CORS must be before all routes
app.use(cors({
  origin: 'http://localhost:5173',
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

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);

module.exports = app;
