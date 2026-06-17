import express from 'express';
import { getSpeechToken } from '../controllers/ttsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/speak', verifyToken, getSpeechToken);

export default router;
