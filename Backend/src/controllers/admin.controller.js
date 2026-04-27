import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------
   Get Admin Requests (ADMIN ONLY)
-------------------------------------------------------------------*/
const getAdminRequests = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // Filter by status (default: pending)
    const status = req.query.status || "pending";
    const validStatuses = ["pending", "approved", "rejected"];
    
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status. Must be pending, approved, or rejected");
    }

    const filter = { adminRequest: status };

    const [requests, total] = await Promise.all([
        User.find(filter)
            .select("-password -refreshToken")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, `Admin requests (${status}) fetched successfully`)
    );
}); 

/* ------------------------------------------------------------------
   Handle Admin Request 
-------------------------------------------------------------------*/
const handleAdminRequest = asyncHandler(async (req, res) => {
    const { decision } = req.body;
    const { userId } = req.params;

    // Validate inputs
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    if (!decision || !["approve", "reject"].includes(decision)) {
        throw new ApiError(400, "Decision must be 'approve' or 'reject'");
    }

    // Prevent self-approval
    if (userId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot approve your own admin request");
    }

    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

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
            { 
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                adminRequest: user.adminRequest 
            },
            `Admin request ${decision}d successfully`
        )
    );
}); 

export {
    getAdminRequests,
    handleAdminRequest
};
