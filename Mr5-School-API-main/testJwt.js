import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

// Test the JWT token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDNhY2I0MmEyYThkMDViNjcxNzBhMSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjYxMDEwNDMsImV4cCI6MTc2NjEwMTk0M30.nPJnCyBM71AU1yGWKAxPDDnVtc8Vmmqh64Nf";

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("  Token verified successfully:");
    console.log("Decoded payload:", decoded);
} catch (error) {
    console.error("❌ Token verification failed:", error.message);
}