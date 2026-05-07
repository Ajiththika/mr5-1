import express from 'express';
import { calculatePrice, getPricingRules, createPricingRule } from '../controllers/pricingController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for calculation
router.post('/calculate', calculatePrice);

// Admin routes for managing rules
router.get('/rules', verifyToken, isAdmin, getPricingRules);
router.post('/rules', verifyToken, isAdmin, createPricingRule);

export default router;
