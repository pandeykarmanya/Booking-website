import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------
   Get ALL pending admin requests   (ADMIN ONLY)
-------------------------------------------------------------------*/
const getAdminRequests = asyncHandler(async (req, res) => {
    const requests = await User.find({ adminRequest: "pending" })
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, requests, "Pending admin requests fetched")
    );
});

/* ------------------------------------------------------------------
   Approve OR Reject admin request   (ADMIN ONLY)
-------------------------------------------------------------------*/
const handleAdminRequest = asyncHandler(async (req, res) => {
    const { decision } = req.body;       // expected: "approve" or "reject"
    const { userId } = req.params;

    // Validate decision
    if (!decision || !["approve", "reject"].includes(decision)) {
        throw new ApiError(400, "Decision must be 'approve' or 'reject'");
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Check if request is actually pending
    if (user.adminRequest !== "pending") {
        throw new ApiError(400, "No pending admin request for this user");
    }

    // Apply decision
    if (decision === "approve") {
        user.role = "admin";
        user.adminRequest = "approved";
    } else {
        user.adminRequest = "rejected";
    }

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            { userId: user._id, newRole: user.role, adminRequest: user.adminRequest },
            `Admin request ${decision}d successfully`
        )
    );
});

export {
    getAdminRequests,
    handleAdminRequest 
};