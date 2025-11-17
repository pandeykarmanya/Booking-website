import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getCurrentUser, updateName, changePassword, requestAdminRole } from "../controllers/user.controller.js";

const router = express.Router();

// ✔ All these routes require login
router.get("/me", authMiddleware, getCurrentUser);
router.put("/update-name", authMiddleware, updateName);
router.put("/change-password", authMiddleware, changePassword);
router.post("/request-admin", authMiddleware, requestAdminRole);

export default router;