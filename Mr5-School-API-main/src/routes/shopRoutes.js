import express from "express";
import {
	getShopItems,
	getMyInventory,
	purchaseItem,
	equipItem,
} from "../controllers/shopController.js";
import {
	getOwnStoreCatalog,
	getUserInventory,
	equipOwnStoreItem,
	updateClassroomSettings,
	createOwnStoreCheckout,
	verifyOwnStorePurchase,
} from "../controllers/ownStoreController.js";
import {
	getTeacherAvatars,
	getOwnedTeachers,
	setActiveTeacher,
	createTeacherCheckout,
	verifyTeacherPurchase,
} from "../controllers/teacherAvatarController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.get("/items", getShopItems);
router.get("/inventory", ...protect, getMyInventory);
router.post("/purchase", ...protect, purchaseItem);
router.put("/inventory/:inventoryId/equip", ...protect, equipItem);

router.get("/teacher-avatars", getTeacherAvatars);
router.get("/owned-teachers", ...protect, getOwnedTeachers);
router.put("/active-teacher", ...protect, setActiveTeacher);
router.post("/teacher-checkout", ...protect, createTeacherCheckout);
router.get("/verify-teacher/:sessionId", ...protect, verifyTeacherPurchase);

router.get("/own-store/catalog", getOwnStoreCatalog);
router.get("/inventory-full", ...protect, getUserInventory);
router.put("/equip", ...protect, equipOwnStoreItem);
router.put("/classroom-settings", ...protect, updateClassroomSettings);
router.post("/own-store/checkout", ...protect, createOwnStoreCheckout);
router.get("/verify-purchase/:sessionId", ...protect, verifyOwnStorePurchase);

export default router;
