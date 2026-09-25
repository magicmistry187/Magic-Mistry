const User = require("../models/user.model");

exports.checkBlockedUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed",
      });
    }

    //find current user in database
    const user = await User.findById(userId).select("status");

    const restrictedRole = ["blocked", "suspended"];

    if (restrictedRole.includes(user.status)) {
      return res.status(403).json({
        status: false,
        message: `Your account is ${user.status}. You cannot perform this action.`,
      });
    }

    //Account is active

    next();
  } catch (err) {
    console.log("Check Blocked User Error: ", err);

    return res.status(500).json({
      success: false,
      message: "Failed to verify account status",
    });
  }
};
