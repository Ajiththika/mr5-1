import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, ".env") });

console.log("Environment variables loaded:");
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("Length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : "undefined");

// Check if there are any extra characters or line breaks
if (process.env.JWT_SECRET) {
    console.log("First 10 chars:", process.env.JWT_SECRET.substring(0, 10));
    console.log("Last 10 chars:", process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 10));
    
    // Check for special characters
    const specialChars = /[\n\r\t]/g;
    if (specialChars.test(process.env.JWT_SECRET)) {
        console.log("⚠️  WARNING: Found special characters (newline, carriage return, or tab)");
    }
}