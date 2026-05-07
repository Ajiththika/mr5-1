import express from "express";
import {
	getPendingRegistrations,
	approveRegistration,
	rejectRegistration,
	getPlatformStats
} from "../controllers/adminController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for platform stats
router.get("/stats", getPlatformStats);

// Protect admin-only routes
router.use(verifyToken);
router.use(authorize("admin"));

router.get("/registrations/pending", getPendingRegistrations);
router.post("/registrations/:id/approve", approveRegistration);
router.post("/registrations/:id/reject", rejectRegistration);

export default router;