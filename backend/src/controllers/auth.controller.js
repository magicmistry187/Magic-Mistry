const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const otpModel = require('../models/otp.model');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const userVerification = require('../templates/userVerifcationTemplate');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const axios = require('axios');

function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
}

// send otp
//little bit modifying it for forgot password and signup
async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const checkUser = await userModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await otpModel.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await otpModel.findOne({ otp });
    }

    await otpModel.create({
      email: email.toLowerCase().trim(),
      otp,
    });

    const emailBody = userVerification(otp);
    await sendEmail(email, 'Magic Mistry OTP Verification', emailBody);

    return res.status(200).json({
      success: true,
      message: 'OTP Sent Successfully to your email',
      email,
    });
  } catch (err) {
    console.log('Error in OTP Send:', err);

    if (
      err.message &&
      (err.message.includes('Mail_User') ||
        err.message.includes('Missing credentials') ||
        err.message.includes('Invalid login') ||
        err.message.includes('535'))
    ) {
      return res.status(500).json({
        success: false,
        message:
          'Email credentials are invalid. Check Mail_User and Mail_Pass in .env',
      });
    }

    return res.status(500).json({
      success: false,
      error: err.message,
      message: 'Something went wrong while sending OTP. Please try again.',
    });
  }
}

// signup
async function signup(req, res) {
  try {
    
    const { fullName, email, password, phoneNumber, otp,role } = req.body;

    if (!fullName || !email || !password || !phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const existingUser = await userModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const recentOtp = await otpModel
      .findOne({ email: email.toLowerCase().trim() })
      .sort({ createdAt: -1 });

    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: 'OTP not Found',
      });
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber,
      authProviders: ['email'],
      role: "admin", // Default role is 'user' if not provided
    });

    const token = generateToken(user);

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: 'User is Signed Up',
      token,
      user: userData,
    });
  } catch (err) {
    console.log('Error while signing up:', err);

    return res.status(500).json({
      success: false,
      message: 'Error occurred while signing up',
    });
  }
}

// login
async function login(req, res) {
  try {
    console.log("Login controller")
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Find user
    const user = await userModel
      .findOne({ email: trimmedEmail })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // User signed up only with Google
    if (!user.password) {
      return res.status(400).json({

        success: false,
        message:
          'This account was created using Google. Please sign in with Google.',
      });
    }

    // Check account status
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message:
          'Your account has been blocked. Please contact the administrator.',
      });
    }

    // Vendor approval check
    if (user.role === 'vendor' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is waiting for admin approval.',
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);
    console.log("Token generated:", token);

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .status(200)
      .json({
        success: true,
        message: 'Login successful.',
        token,
        user: userData,
      });
  } catch (error) {
    console.error('Login Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

// google auth
async function googleLogin(req, res) {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required.',
      });
    }

    const { data: googleUser } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const { sub: googleId, email, name, email_verified } = googleUser;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google email is not verified.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    let user = await userModel.findOne({ googleId });

    if (!user) {
      user = await userModel.findOne({
        email: trimmedEmail,
      });

      if (user) {
        user.googleId = googleId;
        user.isEmailVerified = true;

        if (!user.authProviders.includes('google')) {
          user.authProviders.push('google');
        }

        await user.save();
      } else {
        user = await userModel.create({
          fullName: name,
          email: trimmedEmail,
          googleId,
          authProviders: ['google'],
          isEmailVerified: true,
          // role: "vendor",
        });
      }
    }

    const token = generateToken(user);
    console.log('Google login successful. Token generated:', token);
    console.log('User details:', user);

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .status(200)
      .json({
        success: true,
        message: 'Google login successful.',
        token,
        user,
      });
  } catch (error) {
    console.error('Google Login Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}



async function changePassword(req , res){


  try{
    //get user id from auth middleware or token
    const userId = req.user.id;

    //get user info from db

    const userDetails = await userModel.findById(userId).select("+password");

    //get old and new password from request body
    const { oldPassword, newPassword } = req.body;

    //validaton for both fields if any of them is missing

    if (!oldPassword || !newPassword) {
      return res.status(404).josn({
        success: false,
        message: "All fields are required",
      });
    }

    //Check if old password is correct or not

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password,
    );

    if (!isPasswordMatch) {
      console.log("Password does not match , Please enter correct password");
      return res.status(400).json({
        sucess: false,
        message: "Password does not match , Please enter correct password",
      });
    }

    //hash the new password and update it in the database

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateUserDetails = await userModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      {
        new: true,
      },
    );



    try{

      //send email to user about password change

      const emailInfo = await sendEmail(updateUserDetails.email, "Password Changed Successfully",`Password Changed Successfully for ${updateUserDeatils.fullName}`)

    }catch(err){
      return res.status(500).json({
        success: false,
        message : 'Something went wrong while sending email'
      })
    }

return res.status(200).json({
  success: true,
  message: "Password Changes Successfully",
})



  }catch(err){
     console.log("Error while changing password: ", err);

     return res.status(500).json({
      success:false,
      error: err.message,
      message: "Something went wrong while changing password",
     })
  }






 


}


async function verifyOtp(req, res){
    
  const {otp} = req.body;

  if(!otp){
    return res.status(400).json({
      success: false,
      message: "OTP is required",
    })
  }


  

}

module.exports = {
  signup,
  sendOtp,
  login,
  googleLogin,
  changePassword,
};
