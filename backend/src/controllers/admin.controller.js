const User = require("../models/user.model");
const Booking = require("../models/booking.model");

//Update User Account Status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, durationDays } = req.body;
    const { userId } = req.params;

    //Validate the status
    const allowedStatus = ["active", "blocked", "suspended"];

    // console.log("Duraton Days : ", durationDays);

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

    //Handle each status

    if (status === "suspended") {
      if (
        durationDays === undefined ||
        !Number.isInteger(durationDays) ||
        durationDays <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid suspension duration is required",
        });
      }

      const suspendedUntil = new Date();

      suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);

      // console.log("SUSPENSION DATE : ", suspendedUntil);

      user.status = "suspended";
      user.suspendedUntil = suspendedUntil;

      if (user.role === "customer") {
        const allBookingOfCustomer = await Booking.find({
          customer: user._id,
          bookingStatus: { $in: ["Pending", "Accepted", "On the Way"] },
        });

        //Cancel all active bookings by comparing suspend date of the customer

        for (const booking of allBookingOfCustomer) {
          //Bookingg Service Date Before Suspension

          if (booking.serviceDate <= suspendedUntil) {
            booking.bookingStatus = "Cancelled";
            booking.cancelDueToSuspension = false;
            await booking.save();
          } else {
            
            //Booking happens after suspension
            //Temporarily cancel it

            booking.bookingStatus = "Cancelled";
            booking.cancelDueToSuspension = true;
            await booking.save();
          }
        }
      }
    } else if (status === "active") {
      user.status = "active";
      user.suspendedUntil = null;
    } else if (status === "blocked") {
      user.status = "blocked";
      user.suspendedUntil = null;

      if (user.role === "customer") {
        //Cancel all active bookings of the customer

        await Booking.updateMany(
          {
            customer: user._id,
            bookingStatus: {
              $in: ["Pending", "Accepeted", "On the Way"],
            },
          },
          {
            $set: {
              bookingStatus: "Cancelled",
              cancelDueToSuspension: false,
            },
          },
        );
      }
    }

    //Save Changes
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
        suspendedUntil: user.suspendedUntil,
      },
    });
  } catch (err) {
    console.log("Error while Updating user account status:  ", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update user account",
    });
  }
};
