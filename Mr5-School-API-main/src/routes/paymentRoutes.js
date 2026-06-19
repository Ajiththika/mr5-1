import express from "express";
import {
	getAllPayments,
	getPaymentById,
	createPayment,
	updatePayment,
	deletePayment,
	createCheckoutSession,
	verifyPayment,
} from "../controllers/paymentController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.get("/", ...protect, authorize("admin"), getAllPayments);
router.get("/verify/:sessionId", ...protect, verifyPayment);
router.get("/:id", ...protect, authorize("admin"), getPaymentById);
router.post("/", ...protect, authorize("admin"), createPayment);
router.post("/create-checkout-session", ...protect, createCheckoutSession);
router.put("/:id", ...protect, authorize("admin"), updatePayment);
router.delete("/:id", ...protect, authorize("admin"), deletePayment);

export default router;
