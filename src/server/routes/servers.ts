import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getServers, createServer, getServer, deleteServer, startServer, stopServer, restartServer, getFiles, uploadFile, deleteFile, renameFile, saveFileContent, sendCommand, getServerStats } from "../controllers/servers.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: ".data/temp/" });

router.use(requireAuth);

router.get("/", getServers);
router.post("/", createServer);
router.get("/:id", getServer);
router.get("/:id/stats", getServerStats);
router.delete("/:id", deleteServer);

router.post("/:id/start", startServer);
router.post("/:id/stop", stopServer);
router.post("/:id/restart", restartServer);
router.post("/:id/command", sendCommand);

// Simple file endpoints
router.get("/:id/files", getFiles);
router.post("/:id/files/upload", upload.single("file"), uploadFile);
router.post("/:id/files/rename", renameFile);
router.post("/:id/files/save", saveFileContent);
router.delete("/:id/files", deleteFile);

export default router;
