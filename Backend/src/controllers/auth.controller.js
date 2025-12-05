import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    console.log("REGISTER HIT:", req.body);
    const { name, email, password } = req.body;

    // Validate all fields are provided
    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists (case-insensitive email check)
    const existedUser = await User.findOne({ 
        email: email.toLowerCase() 
    });

    if (existedUser) {
        throw new ApiError(409, "Email already taken");
    }

    // Create new user (password will be automatically hashed by pre-save hook)
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password // Plain password - model's pre-save hook will hash it
    });

    // Get created user without sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
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

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
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
   CHANGE PASSWORD
-------------------------------------------------------------------*/
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isCorrect) throw new ApiError(400, "Old password incorrect");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

/* ------------------------------------------------------------------
   GET CURRENT LOGGED-IN USER
-------------------------------------------------------------------*/
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});

/* ------------------------------------------------------------------
   UPDATE NAME
-------------------------------------------------------------------*/
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { name } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Name updated successfully"));
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
   EXPORTS
-------------------------------------------------------------------*/


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    registerAdmin
};