import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

console.log("REFRESH_TOKEN_EXPIRE_DAYS:", process.env.REFRESH_TOKEN_EXPIRE_DAYS);
const days = parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS);
console.log("Parsed Days:", days);
const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
console.log("Expires At:", expiresAt.toString());

if (isNaN(days)) {
    console.log("ERROR: REFRESH_TOKEN_EXPIRE_DAYS is not a number!");
}
