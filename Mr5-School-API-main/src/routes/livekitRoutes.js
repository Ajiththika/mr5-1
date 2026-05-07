import express from 'express';
import { createToken, createAvatarToken, getRoomInfo } from '../controllers/livekitController.js';
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get LiveKit token
// POST /api/livekit/token
router.post('/token', createToken);

// Route to get LiveKit token for avatar agent
// POST /api/livekit/avatar-token
router.post('/avatar-token', createAvatarToken);

// Route to get room information
// GET /api/livekit/room/:roomName
router.get('/room/:roomName', getRoomInfo);

export default router;
