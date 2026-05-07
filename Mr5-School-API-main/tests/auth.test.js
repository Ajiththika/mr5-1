import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import dotenv from 'dotenv';

dotenv.config();

// Mocks or Setup
beforeAll(async () => {
    // Connect to a test database if MONGO_URI_TEST provided, else use default but be careful
    // For safety in this environment, we might skip actual DB writes or use memory server if available
    // But adhering to user snippet:
    const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
    console.log("Connecting to MongoDB in test...", mongoUri ? "URI Set" : "URI Missing");
    if (mongoUri && mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB in test");
    }
}, 30000);

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
    it('should redirect to Google for authentication', async () => {
        const res = await request(app).get('/api/auth/google');
        expect(res.statusCode).toEqual(302); // Redirect status
        // Passport redirect location usually to accounts.google.com
        expect(res.headers.location).toMatch(/accounts\.google\.com/);
    });
});
