import express from "express";
import { registerUser, loginUser, logoutUser, registerAdmin } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/register-admin", registerAdmin);

export default router;