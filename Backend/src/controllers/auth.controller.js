import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/sendEmail.js";


/* ------------------------------------------------------------------
   Generate Access + Refresh Tokens
-------------------------------------------------------------------*/
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

/* ------------------------------------------------------------------
   REGISTER USER — (name, email, password)
-------------------------------------------------------------------*/
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "Invalid email format");
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const existedUser = await User.findOne({ email: email.toLowerCase() });

    if (existedUser) {
        if (existedUser.isVerified) {
            throw new ApiError(409, "Email already registered and verified");
        }

        // Resend OTP for unverified user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        existedUser.name = name.trim();
        existedUser.password = password;
        existedUser.otp = otp;
        existedUser.otpExpiry = Date.now() + 10 * 60 * 1000;

        await existedUser.save();
        await sendOTPEmail(email, otp);

        return res.status(200).json(
            new ApiResponse(200, { email: existedUser.email }, "OTP resent to your email")
        );
    }

    // Create new user
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        isVerified: false
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json(
        new ApiResponse(201, { email: user.email }, "OTP sent to your email. Please verify to complete registration.")
    );
});

/* ------------------------------------------------------------------
   VERIFY OTP
-------------------------------------------------------------------*/
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Email already verified")
        );
    }

    if (!user.otp) {
        throw new ApiError(400, "No OTP found. Please request a new one.");
    }

    if (user.otp !== String(otp).trim()) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP expired. Please request a new one.");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    try {
    await sendWelcomeEmail(user.email, user.name);
} catch (error) {
    console.log("Welcome email failed:", error.message);
}

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully. You can now login.")
    );
});

/* ------------------------------------------------------------------
   LOGIN USER — (email, password)
-------------------------------------------------------------------*/
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (!user.isVerified) {
        throw new ApiError(401, "Please verify your email first");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password.trim());

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/"
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
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
});

/* ------------------------------------------------------------------
   REFRESH ACCESS TOKEN
-------------------------------------------------------------------*/
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, { 
            accessToken, 
            refreshToken: newRefreshToken 
        }, "Access token refreshed successfully")
    );
});

/* ------------------------------------------------------------------
   FORGOT PASSWORD
-------------------------------------------------------------------*/
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found with this email");
    }

    if (!user.isVerified) {
        throw new ApiError(400, "Please verify your email first");
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    return res.status(200).json(
        new ApiResponse(200, { email: user.email }, "Password reset OTP sent to your email")
    );
});

/* ------------------------------------------------------------------
   VERIFY RESET OTP
-------------------------------------------------------------------*/
const verifyResetOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.otp) {
        throw new ApiError(400, "No OTP found. Please request password reset again.");
    }

    if (user.otp !== String(otp).trim()) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP expired. Please request a new one.");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP verified successfully. You can now reset your password.")
    );
});

/* ------------------------------------------------------------------
   RESET PASSWORD
-------------------------------------------------------------------*/
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.otp || user.otp !== String(otp).trim()) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP expired. Please request password reset again.");
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword.trim();
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.refreshToken = undefined; // Invalidate existing sessions

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful. Please login with your new password.")
    );
});

/* ------------------------------------------------------------------
   GET CURRENT USER
-------------------------------------------------------------------*/
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});

/* ------------------------------------------------------------------
   RESEND OTP
-------------------------------------------------------------------*/
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        throw new ApiError(400, "Email already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, otp);

    return res.status(200).json(
        new ApiResponse(200, { email: user.email }, "OTP resent successfully")
    );
});

/* ------------------------------------------------------------------
   EXPORTS
-------------------------------------------------------------------*/
export {
    registerUser,
    verifyOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    getCurrentUser,
    resendOTP
};