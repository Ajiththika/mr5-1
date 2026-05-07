import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

async function listModels() {
    try {
        console.log("Listing available models...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // List models
        const models = await genAI.listModels();
        console.log("Available models:");
        models.models.forEach(model => {
            console.log(`- ${model.name}: ${model.displayName}`);
        });
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();