import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { activateTrial, getStatus } from "../controllers/trialController.js";

const router = express.Router();

router.get("/status", verifyToken, getStatus);
router.post("/start", verifyToken, activateTrial);

export default router;
