import express from 'express';
import { syncContext, getMyContext } from '../controllers/contextController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/me', getMyContext);
router.post('/sync', syncContext);

export default router;
