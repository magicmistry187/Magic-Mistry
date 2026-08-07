const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();
console.log("MongoDB URL:", process.env.MONGODB_URI); // Log the MongoDB URL to verify it's being read correctly

// const userModel = require("../src/models/user.model");
const userModel = require('./src/models/user.model');


const seedAdminVendor = async () => {
  try {
   
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    // ------------------ Admin ------------------
    const adminExists = await userModel.findOne({
      email: "admin@gmail.com",
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin123@", 10);

      await userModel.create({
        fullName: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        phoneNumber: "9999999999",
        role: "admin",
        status: "active",
      });

      console.log("Admin created");
    } else {
      console.log("Admin already exists");
    }

    // ------------------ Vendor ------------------
    const vendorExists = await userModel.findOne({
      email: "vendor@gmail.com",
    });

    if (!vendorExists) {
      const hashedPassword = await bcrypt.hash("Vendor123@", 10);

      await userModel.create({
        fullName: "Vendor",
        email: "vendor@gmail.com",
        password: hashedPassword,
        phoneNumber: "8888888888",
        role: "vendor",
        status: "active",
      });

      console.log("✅ Vendor created");
    } else {
      console.log("⚠️ Vendor already exists");
    }

    console.log("🎉 Seeding completed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedAdminVendor();
