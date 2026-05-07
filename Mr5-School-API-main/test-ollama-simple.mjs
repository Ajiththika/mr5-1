// Simple test script to verify Ollama integration directly
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, "../.env") });

async function testOllama() {
    try {
        console.log('Testing Ollama integration directly...');
        
        const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
        const ollamaModel = process.env.OLLAMA_MODEL || "tinyllama";
        
        console.log(`Using Ollama URL: ${ollamaUrl}`);
        console.log(`Using Ollama Model: ${ollamaModel}`);
        
        // Transform messages to Ollama format
        const messages = [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: "Hello, how are you?" }
        ];
        
        const prompt = messages.map(msg => {
            if (msg.role === "system") {
                return `System: ${msg.content}`;
            }
            return `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`;
        }).join("\n") + "\nAssistant:";

        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: prompt,
                stream: false,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('Ollama Response:', data.response);
    } catch (error) {
        console.error('Error testing Ollama:', error.message);
    }
}

testOllama();