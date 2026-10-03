const User = require("../models/user.model");
const Booking = require("../models/booking.model");

exports.checkUserRestricted = async (req, res, next) => {
  try {
    const userId = req.user?.id;


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed",
      });
    }

    //find current user in database
    const user = await User.findById(userId).select("status suspendedUntil");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // const restrictedRole = ["blocked", "suspended"];

    // if (restrictedRole.includes(user.status)) {
    //   return res.status(403).json({
    //     status: false,
    //     message: `Your account is ${user.status}. You cannot perform this action.`,
    //   });
    // }

    //Block action
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. You cannot perform this action. ",
      });
    }

    //Suspend action

    if (user.status === "suspended") {
      //Active suspension

      if (user.suspendedUntil && user.suspendedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is temporarily suspended. You cannot perform this action",
        });
      }

      //Suspension expired
      if (user.suspendedUntil && user.suspendedUntil <= new Date()) {

        user.status = "active";
        user.suspendedUntil = null;


      }

      await user.save();
    }

    //Account is active

    next();
  } catch (err) {
    console.log("Check Restricted User Error: ", err);

    return res.status(500).json({
      success: false,
      message: "Failed to verify account status",
    });
  }
};
