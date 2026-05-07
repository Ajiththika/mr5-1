import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
console.log("JWT_SECRET length:", process.env.JWT_SECRET.length);

// Test the JWT token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDNhY2I0MmEyYThkMDViNjcxNzBhMSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjYxMDEwNDMsImV4cCI6MTc2NjEwMTk0M30.nPJnCyBM71AU1yGWKAxPDDnVtc8Vmmqh64Nf";

console.log("\nTrying to verify token...");

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("  Token verified successfully:");
    console.log("Decoded payload:", decoded);
} catch (error) {
    console.error("❌ Token verification failed:", error.message);
    
    // Let's try to generate a new token and see if it works
    console.log("\nTrying to generate a new token...");
    try {
        const newToken = jwt.sign({ id: "6943acb42a2a8d05b67170a1", type: "access" }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
        console.log("  New token generated:", newToken);
        
        // Try to verify the new token
        const newDecoded = jwt.verify(newToken, process.env.JWT_SECRET);
        console.log("  New token verified successfully:");
        console.log("Decoded payload:", newDecoded);
    } catch (newError) {
        console.error("❌ New token generation/verification failed:", newError.message);
    }
}