import express from "express";
import {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
} from "../controllers/userController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user management routes are admin-only
router.use(verifyToken);
router.use(authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
