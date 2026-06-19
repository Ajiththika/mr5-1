import express from 'express';
import { getSpeechToken } from '../controllers/ttsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireLegalConsent } from '../middleware/consentMiddleware.js';

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.post('/speak', ...protect, getSpeechToken);

export default router;
