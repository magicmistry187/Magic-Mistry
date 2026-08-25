const jwt = require("jsonwebtoken");
require("dotenv").config();


// verifies that token is there or not
exports.auth = async (req, res, next) => {
  // console.log("Auth middleware")
  // console.log("Cookies:", req.cookies);
  try {

    const token =
      req.cookies?.token ||
      req.cookies?.vendorToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "A user cannot make a booking until they log in.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId,
      };
    } catch (err) {
      console.error("Token verification failed:", err.message);

      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. A user cannot make a booking until they log in."
          : "Invalid session. A user cannot make a booking until they log in.";

      return res.status(401).json({
        success: false,
        message,
      });
    }

    next();
  } catch (err) {
    console.error("Error in Auth Middleware:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during authentication.",
    });
  }
};


const authorizeRoles = (...allowedRoles) => {
  // console.log("in the role checker")
  return async (req, res, next) => {
    try {
      let userRole = req.user?.role?.toLowerCase();

      if (!userRole && (req.user?.id || req.user?.email)) {
        const User = require('../models/user.model');
        const mongoose = require('mongoose');
        let dbUser = null;
        if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
          dbUser = await User.findById(req.user.id).select('role');
        }
        if (!dbUser && req.user?.email) {
          dbUser = await User.findOne({ email: req.user.email.toLowerCase().trim() }).select('role');
        }
        userRole = dbUser?.role?.toLowerCase();
        if (req.user && dbUser?.role) req.user.role = dbUser.role;
      }

      const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

      if (!userRole || !normalizedAllowed.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This route is restricted to: ${allowedRoles.join(", ")}.`,
        });
      }

      next();
    } catch (err) {
      console.error("Error in role authorization middleware:", err);
      return res.status(500).json({
        success: false,
        message: "User role could not be verified, please try again.",
      });
    }
  };
};


exports.isCustomer = authorizeRoles("customer");
exports.isVendor = authorizeRoles("vendor");
exports.isAdmin = authorizeRoles("admin");
exports.authorizeRoles = authorizeRoles;

// Allows both customers AND vendors to access the route (e.g. saving address)
exports.isCustomerOrVendor = authorizeRoles("customer", "vendor");