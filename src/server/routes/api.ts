import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
import authRoutes from "./auth.js";
import serverRoutes from "./servers.js";
import systemRoutes from "./system.js";
import aiRoutes from "./ai.js";

router.use("/auth", authRoutes);
router.use("/servers", serverRoutes);
router.use("/system", systemRoutes);
router.use("/ai", aiRoutes);

export default router;
