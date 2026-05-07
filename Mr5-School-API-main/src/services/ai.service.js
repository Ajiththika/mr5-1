import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { Ollama } from 'ollama';

class AIService {
    constructor() {
        // Initialize defaults
        this.defaultProvider = process.env.AI_PROVIDER || "gemini";
        this.defaultModel = "gemini-1.5-flash";

        // Clients
        this.genAI = null;
        this.openai = null;
        this.ollama = null;
    }

    // Lazy Initializers
    getGeminiClient() {
        if (!this.genAI && process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        return this.genAI;
    }

    getOpenAIClient() {
        if (!this.openai && process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.openai;
    }

    getOllamaClient() {
        if (!this.ollama) {
            // Ollama usually runs locally on default port 11434, but host can be configured
            this.ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
        }
        return this.ollama;
    }

    async chatCompletion({ messages, provider = null, model = null, temperature = 0.7, max_tokens = 1000 }) {
        const activeProvider = provider || this.defaultProvider;

        try {
            switch (activeProvider.toLowerCase()) {
                case 'openai':
                    return this.chatOpenAI(messages, model, temperature, max_tokens);
                case 'ollama':
                    return this.chatOllama(messages, model, temperature);
                case 'gemini':
                default:
                    return this.chatGemini(messages, model, temperature, max_tokens);
            }
        } catch (error) {
            console.error(`AI Service Error (${activeProvider}):`, error);
            throw error;
        }
    }

    // --- Gemini Implementation ---
    async chatGemini(messages, model, temperature, max_tokens) {
        const genAI = this.getGeminiClient();
        if (!genAI) throw new Error("GEMINI_API_KEY is not configured");

        const modelName = model || "gemini-1.5-flash";
        const generativeModel = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature, maxOutputTokens: max_tokens }
        });

        let systemInstruction = "";
        let history = [];
        let lastUserMessage = "";

        for (const msg of messages) {
            if (msg.role === "system") {
                systemInstruction += msg.content + "\n";
            } else if (msg.role === "user") {
                if (lastUserMessage) history.push({ role: "user", parts: [{ text: lastUserMessage }] });
                lastUserMessage = msg.content;
            } else if (msg.role === "assistant") {
                // Gemini checks for alternating turns, so logic can be tricky if history is messy
                if (lastUserMessage) {
                    history.push({ role: "user", parts: [{ text: lastUserMessage }] });
                    lastUserMessage = "";
                }
                history.push({ role: "model", parts: [{ text: msg.content }] });
            }
        }

        const finalModel = systemInstruction ?
            genAI.getGenerativeModel({ model: modelName, systemInstruction }) :
            generativeModel;

        const chat = finalModel.startChat({
            history: history,
            generationConfig: { temperature, maxOutputTokens: max_tokens },
        });

        const result = await chat.sendMessage(lastUserMessage || "Hello");
        const responseText = result.response.text();

        return {
            choices: [{
                message: { role: "assistant", content: responseText }
            }]
        };
    }

    // --- OpenAI Implementation ---
    async chatOpenAI(messages, model, temperature, max_tokens) {
        const client = this.getOpenAIClient();
        if (!client) throw new Error("OPENAI_API_KEY is not configured");

        const completion = await client.chat.completions.create({
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            model: model || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            temperature: temperature,
            max_tokens: max_tokens,
        });

        return {
            choices: [{
                message: {
                    role: "assistant",
                    content: completion.choices[0].message.content
                }
            }]
        };
    }

    // --- Ollama Implementation ---
    async chatOllama(messages, model, temperature) {
        const client = this.getOllamaClient();
        // Fallback model: llama2, mistral, or whatever user env specifies
        const modelName = model || process.env.OLLAMA_MODEL || "llama2";

        // Ollama 'chat' API
        const response = await client.chat({
            model: modelName,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            options: { temperature }
        });

        return {
            choices: [{
                message: {
                    role: "assistant",
                    content: response.message.content
                }
            }]
        };
    }

    // --- Regional Detection (Keeping original logic but generic) ---
    async getRegionalDetection(locationInfo) {
        // Use default provider (Gemini is best for this structured JSON task usually)
        const prompt = `
            Based on the detected location information: "${locationInfo}", 
            determine: language, timezone, gradingSystem, regionalPreferences.
            Return JSON with keys: language, timezone, gradingSystem, regionalPreferences.
        `;

        // Simple one-shot call; we can reuse chatCompletion for simplicity
        const response = await this.chatCompletion({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        const text = response.choices[0].message.content;
        try {
            // Clean markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn("Failed to parse regional JSON", e);
            return { language: "English", timezone: "UTC", gradingSystem: "Standard" }; // Fallback
        }
    }
}

export default new AIService();