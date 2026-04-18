import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getCurrentUser, changePassword, getAllUsers, makeAdmin} from "../controllers/user.controller.js";

const router = express.Router();

// ✔ All these routes require login
router.get("/me", authMiddleware, getCurrentUser);
router.put("/change-password", authMiddleware, changePassword);
router.get("/all", authMiddleware, getAllUsers);
router.patch("/:userId/make-admin", authMiddleware, makeAdmin);

export default router;