import express from 'express';
import { getSpeechToken } from '../controllers/ttsController.js';
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to synthesize speech
// POST /api/tts/speak
router.post('/speak', getSpeechToken);

export default router;
