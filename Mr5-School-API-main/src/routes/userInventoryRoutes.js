import express from "express";
import {
	getUserInventory,
	equipOwnStoreItem,
	updateClassroomSettings,
} from "../controllers/ownStoreController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.get("/inventory", ...protect, getUserInventory);
router.put("/inventory/equip", ...protect, equipOwnStoreItem);
router.put("/classroom-settings", ...protect, updateClassroomSettings);

export default router;
