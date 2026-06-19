import express from "express";
import {
	getShopItems,
	getMyInventory,
	purchaseItem,
	equipItem,
} from "../controllers/shopController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.get("/items", getShopItems);
router.get("/inventory", ...protect, getMyInventory);
router.post("/purchase", ...protect, purchaseItem);
router.put("/inventory/:inventoryId/equip", ...protect, equipItem);

export default router;
