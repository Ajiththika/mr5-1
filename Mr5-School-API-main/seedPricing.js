import mongoose from 'mongoose';
import PricingRule from './src/models/PricingRule.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const seedPricingRules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing rules
        await PricingRule.deleteMany({});

        const rules = [
            {
                location: { country: 'India' },
                taxPercentage: 18, // GST
                currency: 'INR',
                currencyMultiplier: 83,
                deliveryCharge: 100,
                serviceCharge: 0
            },
            {
                location: { country: 'United States' },
                taxPercentage: 8,
                currency: 'USD',
                currencyMultiplier: 1,
                deliveryCharge: 0,
                serviceCharge: 5
            },
            {
                location: { country: 'United Kingdom' },
                taxPercentage: 20, // VAT
                currency: 'GBP',
                currencyMultiplier: 0.79,
                deliveryCharge: 8,
                serviceCharge: 0
            },
            {
                location: { country: 'India', state: 'Tamil Nadu' },
                taxPercentage: 18,
                currency: 'INR',
                currencyMultiplier: 83,
                deliveryCharge: 50, // Discounted for Tamil Nadu
                serviceCharge: 0
            }
        ];

        await PricingRule.insertMany(rules);
        console.log('Pricing rules seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding pricing rules:', error);
        process.exit(1);
    }
};

seedPricingRules();
