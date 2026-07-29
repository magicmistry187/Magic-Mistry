const jwt = require("jsonwebtoken");
require("dotenv").config();


// verifies that token is there or not
exports.auth = async (req, res, next) => {
  console.log("Auth middleware")
  try {

    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.error("Token verification failed:", err.message);

      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid token. Please log in again.";

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
  console.log("in the role checker")
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!allowedRoles.includes(userRole)) {
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