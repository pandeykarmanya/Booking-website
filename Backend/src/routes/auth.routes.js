import express from "express";
import { registerUser, loginUser, logoutUser, registerAdmin } from "../controllers/auth.controller.js";
import { requireUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/register-admin", registerAdmin);

export default router;