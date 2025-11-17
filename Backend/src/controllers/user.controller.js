import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

/* ------------------------------------------------------------------
   Get Current Logged-In User
-------------------------------------------------------------------*/
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
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

export {
    getCurrentUser,
    updateName,
    changePassword,
    requestAdminRole
};