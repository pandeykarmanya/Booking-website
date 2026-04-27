import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

/* ------------------------------------------------------------------
   Get Current Logged-In User
-------------------------------------------------------------------*/
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

/* ------------------------------------------------------------------
   Change Password
-------------------------------------------------------------------*/
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password are required");
    }

    // Validate new password length first
    if (newPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }
    
    // Check if new password is same as old
    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from old password");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true }); 

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

/* ------------------------------------------------------------------
   Make User Admin 
-------------------------------------------------------------------*/
const makeAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Prevent self-promotion
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot promote yourself");
  }

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
    new ApiResponse(200, { userId: user._id, role: user.role }, "User promoted to admin successfully")
  );
});

/* ------------------------------------------------------------------
   Get All Users 
-------------------------------------------------------------------*/
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments()
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, "All users fetched successfully")
    );
});

export {
    getCurrentUser,
    changePassword,
    makeAdmin,
    getAllUsers
};
