import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

async function testAuthFlow() {
    try {
        console.log("Testing authentication flow...");
        
        // 1. Login
        console.log("\n1. Logging in...");
        const loginResponse = await api.post("/api/auth/login", {
            email: "admin@mr5school.com",
            password: "Admin@123456"
        });
        
        console.log("  Login successful");
        console.log("User role:", loginResponse.data.data.user.role);
        console.log("Access token:", loginResponse.data.data.accessToken.substring(0, 50) + "...");
        
        // 2. Use access token to access protected route
        console.log("\n2. Accessing protected route...");
        const authResponse = await api.get("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${loginResponse.data.data.accessToken}`
            }
        });
        
        console.log("  Protected route access successful");
        console.log("User data:", authResponse.data.data);
        
    } catch (error) {
        console.error("❌ Error in auth flow:", error.response?.data || error.message);
        
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Headers:", error.response.headers);
        }
    }
}

testAuthFlow();