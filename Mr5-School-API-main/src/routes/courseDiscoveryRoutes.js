import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";
import {
  discover,
  generate,
  getJob,
  suggestions,
} from "../controllers/courseDiscoveryController.js";

const router = express.Router();

router.get("/suggestions", suggestions);

router.post("/discover", verifyToken, requireLegalConsent, discover);
router.post("/generate", verifyToken, requireLegalConsent, generate);
router.get("/jobs/:jobId", verifyToken, requireLegalConsent, getJob);

export default router;
