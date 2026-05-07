import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

async function testGemini() {
    try {
        console.log("Testing Gemini API...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try different model names
        const modelNames = [
            "gemini-1.0-pro",
            "gemini-1.5-pro-latest",
            "gemini-1.5-flash-latest",
            "models/gemini-1.0-pro",
            "models/gemini-1.5-pro-latest"
        ];
        
        for (const modelName of modelNames) {
            try {
                console.log(`\nTrying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = "Hello, how are you?";
                console.log("Sending prompt:", prompt);
                
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                
                console.log("  Success with model:", modelName);
                console.log("Response:", text);
                return; // Exit on first success
            } catch (error) {
                console.log(`❌ Failed with model ${modelName}:`, error.message.split('\n')[0]);
            }
        }
        
        console.log("All model attempts failed");
    } catch (error) {
        console.error("Error testing Gemini:", error.message);
        console.error("Full error:", error);
    }
}

testGemini();