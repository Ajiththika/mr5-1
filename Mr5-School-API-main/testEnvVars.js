import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, ".env") });

console.log("Environment variables:");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("Length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");

// Check if there are any extra characters or line breaks
if (process.env.GEMINI_API_KEY) {
    console.log("First 10 chars:", process.env.GEMINI_API_KEY.substring(0, 10));
    console.log("Last 10 chars:", process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 10));
    
    // Check for special characters
    const specialChars = /[\n\r\t]/g;
    if (specialChars.test(process.env.GEMINI_API_KEY)) {
        console.log("⚠️  WARNING: Found special characters (newline, carriage return, or tab)");
    }
}