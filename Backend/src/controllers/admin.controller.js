import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🟧 Get all admin requests
export const getAdminRequests = asyncHandler(async (req, res) => {
    const requests = await User.find({ adminRequest: "pending" })
        .select("-password");

    return res.status(200).json(
        new ApiResponse(200, requests, "Admin requests fetched")
    );
});

// 🟧 Approve / reject
export const handleAdminRequest = asyncHandler(async (req, res) => {
    const { decision } = req.body; // "approve" or "reject"
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (decision === "approve") {
        user.role = "admin";
        user.adminRequest = "approved";
    } else {
        user.adminRequest = "rejected";
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, `Request ${decision}d successfully`)
    );
});