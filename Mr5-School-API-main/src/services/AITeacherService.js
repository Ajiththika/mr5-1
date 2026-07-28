import OpenAI from 'openai';
import { Ollama } from 'ollama';
import Course from '../models/Course.js'; // Assuming Course model exists
import Lesson from '../models/Lesson.js';
import StudentLearningState from '../models/StudentLearningState.js';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOllamaHost } from '../utils/ollamaEnv.js';

class AITeacherService {
    constructor() {
        this.openai = process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : null;
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

    _buildAdaptiveSystemPrompt(context, learningState, locale = "en") {
        const localeInstruction = locale === "ta" 
            ? "Answer in Tamil whenever possible." 
            : locale === "si" ? "Answer in Sinhala whenever possible." 
            : "Answer in the student's preferred language.";

        const stateInfo = learningState ? `
STUDENT LEARNING STATE:
- Target Skill: ${learningState.skill}
- Current Mastery (0-1): ${learningState.mastery}
- Known Errors: ${learningState.errors.join(", ") || "None yet"}
- Recommended Strategy: ${learningState.strategy}` : "No specific learning state available.";

        return `You are an expert, adaptive AI Teacher for MR5 School.
Your goal is to help students learn effectively.
${localeInstruction}

${stateInfo}

CONTEXT CACHE:
${context}

CRITICAL: You MUST respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.
Your JSON must strictly match this schema:
{
  "type": "explanation|question|hint|encouragement",
  "message": "The actual message you want to say to the student (use markdown)",
  "evaluation": {
    "masteryUpdate": 0.0, // float between -0.2 and +0.2 based on student's last answer
    "identifiedErrors": ["error1"], // any specific mistakes noticed
    "strategy": "guided practice|simpler explanation|advanced challenge" // next strategy to use
  },
  "nextAction": "practice|review|advance"
}`;
    }

    async _generateOpenAI(systemPrompt, userQuery, fullMessages = null, jsonMode = false) {
        if (!this.openai) {
            throw new Error("OPENAI_API_KEY is not configured");
        }
        const messages = fullMessages || [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
        ];

        const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages,
            temperature: 0.7,
            ...(jsonMode && { response_format: { type: "json_object" } })
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

    async _generateGemini(systemPrompt, userQuery, fullMessages = null, jsonMode = false) {
        if (!this.genAI) throw new Error("GEMINI_API_KEY is not configured");

        const candidateModels = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ];

        let lastErr;
        for (const modelName of candidateModels) {
            try {
                const model = this.genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemPrompt,
                    generationConfig: jsonMode ? { responseMimeType: "application/json" } : {}
                });

                const result = await model.generateContent(userQuery);
                return result.response.text();
            } catch (err) {
                lastErr = err;
                console.warn(`[Gemini Model Fallback] Model '${modelName}' failed: ${err.message}. Trying next model...`);
            }
        }
        throw lastErr || new Error("All Gemini model candidates failed.");
    }

    /**
     * Adaptive Interaction point for Student -> Teacher
     */
    async adaptiveAsk({ user, messages, courseId, lessonId, skill, locale = "en" }) {
        try {
            // 1. Fetch Learning State
            let learningState = null;
            if (user && courseId && skill) {
                learningState = await StudentLearningState.findOne({ 
                    user: user._id, 
                    course: courseId, 
                    skill 
                });
                
                if (!learningState) {
                    learningState = new StudentLearningState({
                        user: user._id,
                        course: courseId,
                        lesson: lessonId,
                        skill
                    });
                }
            }

            // 2. Build Adaptive Prompt
            const lastMessage = messages[messages.length - 1].content;
            const context = await this._retrieveContext(lastMessage, courseId);
            const systemPrompt = this._buildAdaptiveSystemPrompt(context, learningState, locale);

            // Format history for the query
            const historyText = messages.map(m => `${m.role}: ${m.content}`).join('\n');

            let aiResponseText = "";
            if (this.mode === 'gemini') {
                aiResponseText = await this._generateGemini(systemPrompt, historyText, null, true);
            } else if (this.mode === 'openai') {
                const apiMessages = [
                    { role: "system", content: systemPrompt },
                    ...messages
                ];
                aiResponseText = await this._generateOpenAI(systemPrompt, lastMessage, apiMessages, true);
            } else {
                aiResponseText = await this._generateOllama(systemPrompt, historyText);
            }

            // 3. Parse JSON
            let structuredResponse;
            try {
                const cleanJson = aiResponseText.replace(/\`\`\`json\\n?|\\n?\`\`\`/g, '').trim();
                structuredResponse = JSON.parse(cleanJson);
            } catch (e) {
                console.error("Failed to parse AI JSON response:", e);
                console.log("Raw output was:", aiResponseText);
                structuredResponse = {
                    type: "explanation",
                    message: aiResponseText,
                    evaluation: {},
                    nextAction: "practice"
                };
            }

            // 4. Update Learning State
            if (learningState && structuredResponse.evaluation) {
                const ev = structuredResponse.evaluation;
                if (typeof ev.masteryUpdate === 'number') {
                    learningState.mastery = Math.max(0, Math.min(1, learningState.mastery + ev.masteryUpdate));
                }
                if (Array.isArray(ev.identifiedErrors) && ev.identifiedErrors.length > 0) {
                    const newErrors = ev.identifiedErrors.filter(err => !learningState.errors.includes(err));
                    learningState.errors.push(...newErrors);
                }
                if (ev.strategy) {
                    learningState.strategy = ev.strategy;
                }
                learningState.attempts += 1;
                await learningState.save();
            }

            return {
                response: structuredResponse,
                learningState
            };

        } catch (error) {
            console.error("Adaptive AI Teacher Error:", error);
            
            // Provide a graceful fallback structured response rather than breaking the application
            const lastMessage = (messages && messages.length > 0) ? messages[messages.length - 1].content : "hello";
            return {
                response: {
                    type: "explanation",
                    message: `Vanakkam! I am your MR5 AI Teacher. Regarding "${lastMessage.substring(0, 80)}", let's explore this topic step-by-step together. Ask me any specific question about your course materials or 3D campus!`,
                    evaluation: {
                        masteryUpdate: 0.05,
                        identifiedErrors: [],
                        strategy: "guided practice"
                    },
                    nextAction: "practice"
                },
                learningState: null
            };
        }
    }
}

export default new AITeacherService();
