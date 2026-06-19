import express from "express";
import {
	listDocuments,
	getDocument,
	getStatus,
	acceptDocuments,
	getRequired,
	getPreferences,
	patchPreferences,
	getMandatoryIds,
} from "../controllers/legalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/documents", listDocuments);
router.get("/documents/:slug", getDocument);
router.get("/mandatory-ids", getMandatoryIds);

router.get("/status", verifyToken, getStatus);
router.get("/required", verifyToken, getRequired);
router.post("/accept", verifyToken, acceptDocuments);
router.get("/preferences", verifyToken, getPreferences);
router.patch("/preferences", verifyToken, patchPreferences);

export default router;
