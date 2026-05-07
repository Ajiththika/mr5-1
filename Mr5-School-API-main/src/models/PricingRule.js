import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema({
    location: {
        country: { type: String, required: true },
        state: { type: String },
        city: { type: String }
    },
    taxPercentage: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    currencyMultiplier: { type: Number, default: 1 }, // Exchange rate relative to base currency (USD)
    deliveryCharge: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index for fast searching by location
pricingRuleSchema.index({ 'location.country': 1, 'location.state': 1, 'location.city': 1 });

const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);

export default PricingRule;
