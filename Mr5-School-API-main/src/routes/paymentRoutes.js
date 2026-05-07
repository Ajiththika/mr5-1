import express from "express";
import {
	getAllPayments,
	getPaymentById,
	createPayment,
	updatePayment,
	deletePayment,
	createCheckoutSession,
	handleStripeWebhook,
	verifyPayment,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook must be before other routes (no JSON parsing)
router.post(
	"/webhook",
	express.raw({ type: "application/json" }),
	handleStripeWebhook,
);

router.get("/", getAllPayments);
router.get("/verify/:sessionId", verifyToken, verifyPayment);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
