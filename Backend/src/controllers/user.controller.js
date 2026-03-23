import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

/* ------------------------------------------------------------------
   Get Current Logged-In User
-------------------------------------------------------------------*/
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId).select("-password");
  
  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, null, "User not found")
    );
  }
  
  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
    // Make sure ApiResponse is: (statusCode, data, message)
  );
});

/* ------------------------------------------------------------------
   Update User Name Only
-------------------------------------------------------------------*/
const updateName = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { name } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Name updated successfully"));
});

/* ------------------------------------------------------------------
   Change Password
-------------------------------------------------------------------*/
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password are required");
    }

    const user = await User.findById(req.user._id);

    const isCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const requestAdminRole = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.role === "admin") {
        throw new ApiError(400, "You are already an admin");
    }

    if (user.adminRequest === "pending") {
        throw new ApiError(400, "You already requested admin access");
    }

    user.adminRequest = "pending";
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, "Admin role request submitted")
    );
});

const makeAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "User is already an admin");
  }

  user.role = "admin";
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "User promoted to admin successfully")
  );
});

/* ------------------------------------------------------------------
   Get All Users
-------------------------------------------------------------------*/
const getAllUsers = asyncHandler(async (req, res) => {
    // Optional: restrict to admin
    if (req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to access this resource");
    }

    const users = await User.find()
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, users, "All users fetched successfully")
    );
});

export {
    getCurrentUser,
    updateName,
    changePassword,
    requestAdminRole,
    getAllUsers,
    makeAdmin
};