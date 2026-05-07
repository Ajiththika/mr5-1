import PricingRule from '../models/PricingRule.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Calculate price based on location
 * @route   POST /api/pricing/calculate
 * @access  Public
 */
export const calculatePrice = asyncHandler(async (req, res) => {
    const { basePrice, location } = req.body;

    if (!basePrice || !location || !location.country) {
        return res.status(400).json({
            success: false,
            message: "Base price and country are required"
        });
    }

    const { country, state, city } = location;

    // Search for the most specific rule (City -> State -> Country)
    let rule = null;

    if (city) {
        rule = await PricingRule.findOne({
            'location.country': country,
            'location.state': state,
            'location.city': city,
            isActive: true
        });
    }

    if (!rule && state) {
        rule = await PricingRule.findOne({
            'location.country': country,
            'location.state': state,
            'location.city': { $exists: false },
            isActive: true
        });
    }

    if (!rule) {
        rule = await PricingRule.findOne({
            'location.country': country,
            'location.state': { $exists: false },
            'location.city': { $exists: false },
            isActive: true
        });
    }

    // Default rule if none found (fallback to global or default values)
    if (!rule) {
        return res.status(200).json({
            success: true,
            data: {
                basePrice,
                location: { country, state, city },
                taxAmount: 0,
                deliveryCharge: 0,
                totalPrice: basePrice,
                currency: 'USD',
                message: "No specific pricing rule found for this location. Using defaults."
            }
        });
    }

    // Calculate details
    const convertedBasePrice = basePrice * rule.currencyMultiplier;
    const taxAmount = (convertedBasePrice * rule.taxPercentage) / 100;
    const finalPrice = convertedBasePrice + taxAmount + rule.deliveryCharge + rule.serviceCharge;

    res.status(200).json({
        success: true,
        data: {
            basePrice: convertedBasePrice,
            originalBasePrice: basePrice,
            location: rule.location,
            taxPercentage: rule.taxPercentage,
            taxAmount,
            deliveryCharge: rule.deliveryCharge,
            serviceCharge: rule.serviceCharge,
            totalPrice: finalPrice,
            currency: rule.currency
        }
    });
});

/**
 * @desc    Get all pricing rules (Admin only)
 * @route   GET /api/pricing/rules
 * @access  Private/Admin
 */
export const getPricingRules = asyncHandler(async (req, res) => {
    const rules = await PricingRule.find();
    res.status(200).json({
        success: true,
        data: rules
    });
});

/**
 * @desc    Create a pricing rule
 * @route   POST /api/pricing/rules
 * @access  Private/Admin
 */
export const createPricingRule = asyncHandler(async (req, res) => {
    const rule = await PricingRule.create(req.body);
    res.status(201).json({
        success: true,
        data: rule
    });
});
