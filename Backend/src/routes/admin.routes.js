import express from "express";
import {
    getAdminRequests,
    handleAdminRequest
} from "../controllers/admin.controller.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/requests", authMiddleware, authorizeRoles("admin"), getAdminRequests);

router.post("/handle-request/:userId",
    authMiddleware,
    authorizeRoles("admin"),
    handleAdminRequest
);

export default router;