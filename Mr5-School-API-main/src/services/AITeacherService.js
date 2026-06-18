import OpenAI from 'openai';
import { Ollama } from 'ollama';
import Course from '../models/Course.js'; // Assuming Course model exists

import Lesson from '../models/Lesson.js';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOllamaHost } from '../utils/ollamaEnv.js';

class AITeacherService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-init',
        });
        this.ollama = new Ollama({ host: getOllamaHost() });

        // Gemini initialization
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }

        this.mode = process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai');
    }

    /**
     * Main interaction point for Student -> Teacher
     * @param {string} userId - Student ID
     * @param {string} query - Student's question
     * @param {string} courseId - Current course context
     * @returns {Promise<string>} - The teacher's answer
     */
    async ask(userId, query, courseId) {
        try {
            // 1. Retrieve Context (RAG Lite)
            const context = await this._retrieveContext(query, courseId);

            // 2. Construct System Prompt
            const systemPrompt = this._buildSystemPrompt(context);

            // 3. Generate Answer
            if (this.mode === 'ollama') {
                return await this._generateOllama(systemPrompt, query);
            } else if (this.mode === 'gemini') {
                return await this._generateGemini(systemPrompt, query);
            } else {
                return await this._generateOpenAI(systemPrompt, query);
            }
        } catch (error) {
            console.error("AI Teacher Error:", error);
            return "I'm having trouble connecting to the neural network. Please try again later.";
        }
    }

    /**
     * Retrieves relevant course material segments.
     * Currently uses MongoDB Text Search as a lightweight RAG.
     */
    async _retrieveContext(query, courseId) {
        if (!courseId) return "";

        try {
            const lessons = await Lesson.find({ course: courseId })
                .select('title content')
                .limit(5); // Limit context window

            if (!lessons || lessons.length === 0) return "";

            // Simple keyword filter (Heuristic RAG)
            const relevantLessons = lessons.filter(l =>
                l.title.toLowerCase().includes(query.toLowerCase()) ||
                (l.content && l.content.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 3);

            if (relevantLessons.length === 0) return "";

            return `
              Context from Course Material:
              ${relevantLessons.map(l => `Title: ${l.title}\nContent: ${l.content}`).join('\n\n').substring(0, 2000)}...
            `;
        } catch (err) {
            console.error("Error retrieving context:", err);
            return "";
        }
    }

    _buildSystemPrompt(context) {
        return `You are Professor Nova, an advanced AI tutor in a Metaverse University.
    Your traits: Wise, encouraging, precise, and concise.
    
    CONTEXT CACHE:
    ${context}
    
    INSTRUCTIONS:
    1. Answer the student's question based ONLY on the context if provided.
    2. If the context is empty, use your general knowledge but mention it's "outside the specific course material".
    3. Keep answers under 3 sentences unless asked for a detailed explanation.
    4. Use markdown formatting.`;
    }

    async _generateOpenAI(systemPrompt, userQuery) {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuery }
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content;
    }

    async _generateOllama(systemPrompt, userQuery) {
        const response = await this.ollama.chat({
            model: 'llama3', // or mistral
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userQuery }
            ],
        });
        return response.message.content;
    }

    async _generateGemini(systemPrompt, userQuery) {
        if (!this.genAI) throw new Error("GEMINI_API_KEY is not configured");

        const model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(userQuery);
        return result.response.text();
    }
}

export default new AITeacherService();
