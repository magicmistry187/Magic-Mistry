const User = require("../models/user.model");

//Update User Account Status
exports.updateUserStatus = async (req, res) => {
  try {

    
    const { status } = req.body;
    const { userId } = req.params;

    //Validate the status
    const allowedStatus = ["active", "blocked", "suspended"];

    if (!allowedStatus.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid Status",
      });
    }

    //Find User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    //Prevent admins status change
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin acount status cant be changed",
      });
    }

    //update user status
    user.status = status.toLowerCase();
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.log("Error while Updating user account status:  ", err);
    return res.status(500).json({
        success: false,
        message: "Failed to update user account",
    })
  }
};
