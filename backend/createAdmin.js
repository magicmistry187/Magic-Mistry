const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./src/models/user.model'); // Adjust path as needed

dotenv.config();

async function createAdmin() {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
      console.log('Usage: node createAdmin.js <email> <password>');
      process.exit(1);
    }

    const email = args[0].toLowerCase().trim();
    const password = args[1];

    // Connect to database
    const dbURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!dbURI) {
      console.error('Database URI is not defined in .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(dbURI);
    console.log('Connected to database.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.password = hashedPassword;
      if (!existingUser.authProviders.includes('email')) {
        existingUser.authProviders.push('email');
      }
      await existingUser.save();
      console.log('User role updated to admin and password updated successfully!');
      process.exit(0);
    }



    await User.create({
      fullName: 'System Admin',
      email,
      password: hashedPassword,
      phoneNumber: '0000000000',
      authProviders: ['email'],
      role: 'admin',
      isEmailVerified: true
    });

    console.log('Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
