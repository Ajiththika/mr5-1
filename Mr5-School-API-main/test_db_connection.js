import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
console.log("Testing connection to:", uri ? uri.replace(/:([^:@]{1,})@/, ":****@") : "UNDEFINED");

if (!uri) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log("  MongoDB Connection Successful!");
        process.exit(0);
    })
    .catch((err) => {
        console.error(" MongoDB Connection Failed:", err.message);
        process.exit(1);
    });
