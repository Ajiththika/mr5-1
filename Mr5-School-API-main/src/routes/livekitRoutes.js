import express from 'express';
import { createToken, createAvatarToken, getRoomInfo } from '../controllers/livekitController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireLegalConsent } from '../middleware/consentMiddleware.js';

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.post('/token', ...protect, createToken);
router.post('/avatar-token', ...protect, createAvatarToken);
router.get('/room/:roomName', ...protect, getRoomInfo);

export default router;
