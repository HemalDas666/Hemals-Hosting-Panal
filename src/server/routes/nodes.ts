import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getNodes, getNode, createNode, updateNode, deleteNode, checkNode } from "../controllers/nodes.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getNodes);
router.get("/:id", getNode);
router.post("/", createNode);
router.put("/:id", updateNode);
router.delete("/:id", deleteNode);
router.post("/:id/check", checkNode);

export default router;
