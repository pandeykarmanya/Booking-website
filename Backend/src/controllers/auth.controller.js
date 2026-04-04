import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------
   Generate Access + Refresh Tokens
-------------------------------------------------------------------*/
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

/* ------------------------------------------------------------------
   REGISTER USER  — (name, email, password)
-------------------------------------------------------------------*/
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        if (existedUser.isVerified) {
            throw new ApiError(409, "Email already taken");
        }

        // 🔁 resend OTP for unverified user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        existedUser.name = name;
        existedUser.password = password;
        existedUser.otp = otp;
        existedUser.otpExpiry = Date.now() + 10 * 60 * 1000;

        await existedUser.save();
        await sendOTPEmail(email, otp);

        return res.status(200).json(
            new ApiResponse(200, {}, "OTP resent to your email")
        );
    }

    // 🆕 new user
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
        name,
        email,
        password,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        isVerified: false
    });

    await sendOTPEmail(email, otp);
    const otpStore = {};

    return res.status(201).json(
        new ApiResponse(201, {}, "OTP sent to your email")
    );
});

/* ------------------------------------------------------------------
   LOGIN USER  — (email, password)
-------------------------------------------------------------------*/
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    if (!user.isVerified) {
        throw new ApiError(401, "Please verify your email first");
    }

    const cleanPassword = password.trim();

    console.log("Entered password:", cleanPassword);
    console.log("Stored password:", user.password);

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // ✅ FIXED COOKIE OPTIONS FOR DEVELOPMENT
    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // true in production, false in development
        sameSite: isProduction ? "none" : "lax", // ✅ Use "lax" for development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/" // ✅ Make cookie available to all paths
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "Login successful")
    );
});

/* ------------------------------------------------------------------
   LOGOUT USER
-------------------------------------------------------------------*/
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    // ✅ MATCH THE LOGIN COOKIE OPTIONS
    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax", // ✅ Must match login
        path: "/"
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
});

/* ------------------------------------------------------------------
   REFRESH TOKEN
-------------------------------------------------------------------*/
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized");
    }

    let decoded;
    try {
        decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token expired");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed")
    );
});


/* ------------------------------------------------------------------
   FORGOT-PASSWORD
-------------------------------------------------------------------*/
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  // Send Email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}`,
  });

  res.json({ message: "OTP sent to email" });
};

/* ------------------------------------------------------------------
   RESET-PASSWORD
-------------------------------------------------------------------*/

  const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  console.log("New Password:", newPassword);

  const cleanPassword = newPassword.trim();

  // ⚠️ IMPORTANT: Let mongoose pre-save hook hash the password
  user.password = cleanPassword;

  console.log("Password before save (will be hashed by model):", cleanPassword);

  // Clear OTP
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();
  console.log("Saved Password in DB:", user.password);

  res.json({ message: "Password reset successful" });
};
/* ------------------------------------------------------------------
   GET CURRENT LOGGED-IN USER
-------------------------------------------------------------------*/
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});

/* ------------------------------------------------------------------
   Register Admin
-------------------------------------------------------------------*/
const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // create user with role admin
    const newAdmin = {
      username,
      email,
      password, // remember to hash it before saving
      role: "admin"
    };

    // Save to DB (assuming you have a User model)
    const savedAdmin = await User.create(newAdmin);

    res.status(201).json({ message: "Admin registered successfully", user: savedAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------------------------------------------
   Verify OTP
-------------------------------------------------------------------*/

const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    if (user.isVerified) {
        return res.status(200).json(
            new ApiResponse(200, {}, "User already verified")
        );
    }

    if (user.otp !== String(otp)) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP expired");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
});


/* ------------------------------------------------------------------
   EXPORTS
-------------------------------------------------------------------*/


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    registerAdmin,
    verifyOTP
};