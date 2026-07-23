const express = require('express');

const app = express();
app.use(express.json());

// importing routes
 const authRoutes = require('./routes/auth.routes');


//mounting routes
app.use('/api/auth', authRoutes);





module.exports = app;