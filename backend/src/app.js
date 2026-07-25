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

// importing routes
const authRoutes = require('./routes/auth.routes');

//mounting routes
app.use('/api/auth', authRoutes);

module.exports = app;
