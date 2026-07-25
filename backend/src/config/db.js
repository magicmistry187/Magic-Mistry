const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    const dbURI = process.env.MongoDB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/magic_mistry';
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB at', dbURI);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

module.exports = connectDB;
