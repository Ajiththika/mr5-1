import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";
import {
	requireHubAdmin,
	requirePermission,
} from "../middleware/permissionMiddleware.js";
import { PERMISSIONS } from "../config/adminRoles.js";
import * as ctrl from "../controllers/powerAdminController.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireLegalConsent);
router.use(requireHubAdmin);

// Overview & activity
router.get("/overview", requirePermission(PERMISSIONS.VIEW_OVERVIEW), ctrl.getOverview);
router.get("/activity", requirePermission(PERMISSIONS.VIEW_ACTIVITY), ctrl.getActivity);

// Teachers
router.get("/teachers", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.listTeachers);
router.get("/teachers/:id", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.getTeacher);
router.post("/teachers", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.createTeacher);
router.put("/teachers/:id", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.updateTeacher);
router.post("/teachers/:id/clone", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.cloneTeacher);
router.patch("/teachers/:id/archive", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.archiveTeacher);
router.delete("/teachers/:id", requirePermission(PERMISSIONS.MANAGE_TEACHERS), ctrl.deleteTeacher);

// Classrooms
router.get("/classrooms", requirePermission(PERMISSIONS.MANAGE_CLASSROOMS), ctrl.listClassrooms);
router.get("/classrooms/:id", requirePermission(PERMISSIONS.MANAGE_CLASSROOMS), ctrl.getClassroom);
router.post("/classrooms", requirePermission(PERMISSIONS.MANAGE_CLASSROOMS), ctrl.createClassroom);
router.put("/classrooms/:id", requirePermission(PERMISSIONS.MANAGE_CLASSROOMS), ctrl.updateClassroom);
router.delete("/classrooms/:id", requirePermission(PERMISSIONS.MANAGE_CLASSROOMS), ctrl.deleteClassroom);

// Approvals
router.get("/approvals", requirePermission(PERMISSIONS.REVIEW_CONTENT), ctrl.listApprovals);
router.post("/approvals/submit", requirePermission(PERMISSIONS.MANAGE_COURSES), ctrl.submitForReview);
router.post("/approvals/:id/approve", requirePermission(PERMISSIONS.REVIEW_CONTENT), ctrl.approveContent);
router.post("/approvals/:id/reject", requirePermission(PERMISSIONS.REVIEW_CONTENT), ctrl.rejectContent);
router.post("/approvals/:id/publish", requirePermission(PERMISSIONS.PUBLISH_CONTENT), ctrl.publishContent);

// Course factory
router.get("/courses/:id", requirePermission(PERMISSIONS.MANAGE_COURSES), ctrl.getCourseDetail);

// Analytics & content
router.get("/analytics", requirePermission(PERMISSIONS.VIEW_ANALYTICS), ctrl.getAnalytics);
router.get("/content-library", requirePermission(PERMISSIONS.MANAGE_COURSES), ctrl.getContentLibrary);

// Roles
router.get("/roles", requirePermission(PERMISSIONS.MANAGE_ROLES), ctrl.getRoles);
router.patch("/roles/:userId", requirePermission(PERMISSIONS.MANAGE_ROLES), ctrl.assignRole);

// AI assist
router.post("/ai/lesson-assist", requirePermission(PERMISSIONS.USE_AI_ASSIST), ctrl.aiLessonAssist);

export default router;
