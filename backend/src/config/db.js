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

    // Clean up stale legacy index on vendorprofiles if present
    try {
      await mongoose.connection.collection('vendorprofiles').dropIndex('vendorId_1');
    } catch (e) {
      // Stale index does not exist or already dropped
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

module.exports = connectDB;
