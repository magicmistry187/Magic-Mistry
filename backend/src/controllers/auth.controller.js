const userModel = require('../models/user.model');
const otpModel = require('../models/otp.model');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const userVerification = require('../templates/userVerifcationTemplate');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

//send otp
async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    const checkUser = await userModel.findOne({ email });

    if (checkUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await otpModel.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OtpModel.findOne({ otp: otp });
    }

    const otpBody = await otpModel.create({
      email,
      otp,
    });

    //sending verificaiton email
    const emailBody = userVerification(otp);
    await sendEmail(email, 'Magic Mistry OTP Verification', emailBody);

    res.status(200).json({
      success: true,
      message: 'OTP Send Sucessfully',
      email,
      otp,
    });
  } catch (err) {
    console.log('Error in Otp Send : ', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Something went wrong while sending OTP',
    });
  }
}

// signup
async function signup(req, res) {
  try {
    const { fullName, email, password, phoneNumber, otp } = req.body;

    if (!fullName || !email || !password || !phoneNumber || !otp) {
      console.log('Missing required fields:');
      return res.json({
        message: 'All fields are required',
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(400).json({ message: 'User already exists' });
    }

    const recentOtp = await otpModel
      .findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOtp) {
      console.log('otp not found');
      return res.json({
        success: false,
        message: 'OTP not Found ',
      });
    }
    if (otp !== recentOtp.otp) {
      //Invalid otp
      console.log('Invalid OTP');
      return res.json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return res.status(200).json({
      success: true,
      message: 'User is Signed Up',
      user,
    });
  } catch (err) {
    console.log('error while siginin up', err);
    res.status(500).json({ message: 'Error occurred while signing up' });
  }
}


// login   auth middlewar banana h abhi
async function login(req,res){

  try {
    // Get data
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await userModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Blocked user
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact the administrator.",
      });
    }

    // Vendor approval check
    if (user.role === "vendor" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for admin approval.",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // JWT Payload
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // Generate Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    // Cookie Options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .cookie("token", token, options)
      .status(200)
      .json({
        success: true,
        message: "Login successful.",
        token,
        user: userData,
      });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}


module.exports = {
  signup,
  sendOtp,
  login
};
