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

const router = express.Router();

router.get("/", verifyToken, authorize("admin"), getAllPayments);
router.get("/verify/:sessionId", verifyToken, verifyPayment);
router.get("/:id", verifyToken, authorize("admin"), getPaymentById);
router.post("/", verifyToken, authorize("admin"), createPayment);
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.put("/:id", verifyToken, authorize("admin"), updatePayment);
router.delete("/:id", verifyToken, authorize("admin"), deletePayment);

export default router;
