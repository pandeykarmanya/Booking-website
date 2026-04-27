import express from "express";
import { registerUser, loginUser, logoutUser, verifyOTP, forgotPassword, resetPassword, getCurrentUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  validateEmailOtp,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "../validators/auth.validators.js";

const router = express.Router();
const authRateLimiter = createRateLimiter({
  keyPrefix: "auth",
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many auth attempts. Please wait 15 minutes and try again.",
});

router.post("/register", authRateLimiter, validateRequest(validateRegister), registerUser);
router.post("/login", authRateLimiter, validateRequest(validateLogin), loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/verify-otp", authRateLimiter, validateRequest(validateEmailOtp), verifyOTP);
router.post("/forgot-password", authRateLimiter, validateRequest(validateForgotPassword), forgotPassword);
router.post("/reset-password", authRateLimiter, validateRequest(validateResetPassword), resetPassword);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
