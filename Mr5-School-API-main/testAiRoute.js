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

async function testAiRoute() {
    try {
        console.log("Testing AI route...");
        
        // 1. Login
        console.log("\n1. Logging in...");
        const loginResponse = await api.post("/api/auth/login", {
            email: "admin@mr5school.com",
            password: "Admin@123456"
        });
        
        console.log("  Login successful");
        const accessToken = loginResponse.data.data.accessToken;
        console.log("Access token:", accessToken.substring(0, 50) + "...");
        
        // 2. Test text-based AI route
        console.log("\n2. Accessing AI route with text...");
        const aiResponse = await api.post("/api/ai/gemini", {
            message: "Hello, how are you?"
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        
        console.log("  AI route access successful");
        console.log("AI response:", aiResponse.data);
        
        // 3. Test multimodal AI route
        console.log("\n3. Testing multimodal AI route...");
        // Create a simple base64 encoded image (1x1 pixel PNG)
        const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        
        const multimodalResponse = await api.post("/api/ai/gemini", {
            messages: [{
                role: "user",
                content: {
                    text: "What is in this image?",
                    images: [`data:image/png;base64,${base64Image}`]
                }
            }],
            multimodal: true
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        
        console.log("  Multimodal AI route access successful");
        console.log("Multimodal AI response:", multimodalResponse.data);
        
    } catch (error) {
        console.error("❌ Error in AI route test:", error.response?.data || error.message);
        
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Headers:", error.response.headers);
        }
    }
}

testAiRoute();