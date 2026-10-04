const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const sendEmail = require("../utils/sendEmail");

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

    const newStatus = status.toLowerCase();

    //Handle each status

    if (newStatus === "suspended") {
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
    } else if (newStatus === "active") {
      user.status = "active";
      user.suspendedUntil = null;
    } else if (newStatus === "blocked") {
      user.status = "blocked";
      user.suspendedUntil = null;

      if (user.role === "customer") {
        //Cancel all active bookings of the customer

        await Booking.updateMany(
          {
            customer: user._id,
            bookingStatus: {
              $in: ["Pending", "Accepted", "On the Way"],
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

    if (
      user.role === "vendor" &&
      (newStatus === "suspended" || newStatus === "blocked")
    ) {
      //Find the accepted Booking of vendor and update it

      // await Booking.updateOne(
      //   {
      //     vendor: user._id,
      //     bookingStatus: "Accepted",
      //   },
      //   {
      //     $set: {
      //       vendor: null,
      //       bookingStatus: "Pending",
      //       isReassignmentRequired: true,
      //     },
      //   },
      // );

      const booking = await Booking.findOneAndUpdate(
        {
          vendor: user._id,
          bookingStatus: "Accepted",
        },
        {
          $set: {
            vendor: null,
            bookingStatus: "Pending",
            isReassignmentRequired: true,
          },
        },
        {
          new: true,
        },
      ).populate("customer", "email fullName phoneNumber");

      console.log("Email of customer : ", booking.customer.email);

      if (booking) {
        try {
          //sending mail to customer for updating about booking

          const emailBody = `
  <div>
    <p>Dear ${booking.customer.fullName},</p>

    <p>
      We wanted to let you know that due to an unexpected issue with the
      service provider assigned to your booking, there may be a delay in
      your scheduled service.
    </p>

    <p>
      We apologize for the inconvenience. Our team is currently working to
      arrange another suitable service provider for you and will update you
      as soon as possible.
    </p>

    <p>
      Thank you for your patience and understanding.
    </p>

    <p>
      Regards,<br>
      <strong>Magic Mistry Team</strong>
    </p>
  </div>
`;

          await sendEmail(
            booking.customer.email,
            "Update regarding your Magic Mistry service booking",
            emailBody,
          );
        } catch (emailErr) {
          console.warn(
            " Email notification failed while updating customer about service:",
            emailErr.message,
          );
        }
      }
    }

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
