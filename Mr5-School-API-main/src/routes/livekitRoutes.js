import express from 'express';
import { createToken, createAvatarToken, getRoomInfo } from '../controllers/livekitController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/token', verifyToken, createToken);
router.post('/avatar-token', verifyToken, createAvatarToken);
router.get('/room/:roomName', verifyToken, getRoomInfo);

export default router;
