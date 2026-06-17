import express from "express";
import {
	getShopItems,
	getMyInventory,
	purchaseItem,
	equipItem,
} from "../controllers/shopController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/items", getShopItems);
router.get("/inventory", verifyToken, getMyInventory);
router.post("/purchase", verifyToken, purchaseItem);
router.put("/inventory/:inventoryId/equip", verifyToken, equipItem);

export default router;
