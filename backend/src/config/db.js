const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function connectDB() {
  try {
    const dbURI =
      process.env.MongoDB_URI ||
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/magic_mistry';
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

module.exports = connectDB;
