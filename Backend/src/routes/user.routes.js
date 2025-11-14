import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requestAdminRole } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/request-admin", authMiddleware, requestAdminRole);

export default router;