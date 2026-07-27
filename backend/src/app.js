const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,              
}));

app.get("/", (req, res) => {
  res.send("Backend is working");
});

// importing routes
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes')

//mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/booking',bookingRoutes)

module.exports = app;
