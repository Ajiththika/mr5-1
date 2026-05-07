// Simple test script to verify Ollama integration
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, "../.env") });

import AIService from './src/services/ai.service.js';

async function testOllama() {
    const aiService = new AIService();
    
    try {
        console.log('Testing Ollama integration...');
        
        const response = await aiService.ollamaChatCompletion({
            messages: [
                { role: "system", content: "You are a helpful AI assistant." },
                { role: "user", content: "Hello, how are you?" }
            ]
        });
        
        console.log('Ollama Response:', response.choices[0].message.content);
    } catch (error) {
        console.error('Error testing Ollama:', error.message);
    }
}

testOllama();