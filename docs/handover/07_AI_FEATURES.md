# 07 — AI Features Documentation

---

## Overview

MR5 School has a multi-layer AI system:
- **Backend AI Service** (`Mr5-School-API-main/src/services/ai.service.js`) — handles all LLM calls
- **Frontend AI Client** (`client-main/lib/aiClient.ts`) — browser-side Gemini integration for UI
- **AI Routes** (`src/routes/ai.routes.js`) — Express endpoints for AI features
- **AI Teacher System** — AI-generated teacher profiles with TTS voice
- **Avatar Support Agent** — AI-powered student support chatbot

---

## LLM Providers

### 1. Google Gemini (Default)
- **Package:** `@google/generative-ai` (backend + frontend)
- **Default model:** `gemini-1.5-flash`
- **Config:** `GEMINI_API_KEY` env var (backend) / `GEMINI_API_KEY` in Next.js API routes (never in client bundle)
- **Used for:** Course generation, lesson assist, chat tutor, auto-grading, regional detection

### 2. OpenAI
- **Package:** `openai`
- **Default model:** `gpt-3.5-turbo` (configurable via `OPENAI_MODEL` env)
- **Config:** `OPENAI_API_KEY` env var
- **Used for:** Alternative provider when Gemini unavailable, image analysis (future)

### 3. Ollama (Local / Self-hosted)
- **Package:** `ollama`
- **Default model:** `llama2` (configurable via `OLLAMA_MODEL` env)
- **Host:** `OLLAMA_HOST` env (default: `http://127.0.0.1:11434`)
- **Used for:** Local development without API keys, privacy-sensitive features
- **Note:** Test scripts in `test-ollama.mjs` and `test-ollama-simple.mjs`

### Provider Selection
The active provider is determined by `AI_PROVIDER` env var (default: `gemini`).
Individual API calls can override with `{ provider: 'openai' }` parameter.

---

## AIService Class (`src/services/ai.service.js`)

Singleton exported as `aiService`.

### Methods

```javascript
// Generic chat completion (OpenAI-compatible format)
aiService.chatCompletion({
  messages: [{ role: 'user', content: '...' }],
  provider: 'gemini' | 'openai' | 'ollama',  // optional, uses AI_PROVIDER default
  model: 'gemini-1.5-flash',                  // optional
  temperature: 0.7,                           // default
  max_tokens: 1000,                           // default
})
// Returns: { choices: [{ message: { role: 'assistant', content: '...' } }] }

// AI course generation
aiService.generateCourseStructure(topic, intent)
// Returns: { title, description, category, modules: [...], tags: [...] }

// Lesson summary + quiz generation
aiService.generateCourseSummaryAndQuiz(lessonContent)
// Returns: { summary: '...', quiz: [...] }

// Auto-grading
aiService.autoGrade({ studentAnswer, rubric })
// Returns: { score: 0-100, feedback: '...', strengths: [], improvements: [] }

// Content moderation
aiService.moderateContent(text)
// Returns: { flagged: boolean, categories: [] }

// Regional detection from location info
aiService.getRegionalDetection(locationInfo)
// Returns: { language, timezone, gradingSystem, regionalPreferences }
```

---

## Prompt System (`src/prompts/`)

### `courseGeneration.prompts.js`
- `COURSE_STRUCTURE_SYSTEM` — System prompt for AI course generation
- `buildCourseStructurePrompt(topic, intent)` — Builds user prompt with topic + intent
- `buildSummaryQuizPrompt(content)` — Builds prompt for summary + quiz generation

**Course generation output format:**
```json
{
  "title": "Introduction to AI",
  "description": "...",
  "category": "Technology",
  "level": "Beginner",
  "modules": [
    {
      "title": "Module 1: Basics",
      "lessons": [
        { "title": "What is AI?", "duration": 10, "content": "..." }
      ]
    }
  ]
}
```

---

## AI Chat System

### Backend Route: `POST /api/ai/chat`
- Accepts: `{ messages, provider?, model?, temperature?, max_tokens? }`
- Routes to the appropriate provider via `aiService.chatCompletion()`
- Optionally saves conversation to `ChatMemory` model

### Frontend: `lib/aiClient.ts`
- Browser-side Gemini client (uses `GEMINI_API_KEY` from Next.js server env)
- **IMPORTANT:** The API key must be accessed via a Next.js API route, never exposed in the client bundle

### Chat Memory (`src/models/ChatMemory.js`)
- Persists conversation history per user
- Used by AI assistant and avatar support agent to maintain context

---

## AI Teacher System

### `src/services/AITeacherService.js`
- Generates AI teacher personality configurations
- Manages teacher voice/tone presets
- Creates lesson delivery scripts for AI teachers

### Teacher Avatar Types
| Type | Description |
|------|-------------|
| `procedural` | R3F mesh-based, configurable skin/hair |
| `ganesha` | Ganesha GLB model (CC BY 4.0) |
| `custom` | User-uploaded GLB (future) |

### TTS Integration (`/api/tts/synthesize`)
- Uses **Microsoft Azure Cognitive Services Speech SDK**
- `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` env vars required
- Converts AI lesson text to speech for avatar delivery
- Voice configured per teacher profile (`Teacher.studio.voiceId`)

---

## Avatar Support Agent

### `src/routes/avatarSupportAgentRoutes.js` → `avatarSupportAgentController.js`
- AI-powered support chatbot with avatar persona
- Maintains conversation context via `ChatMemory`
- Uses `supportService.js` for conversation management
- Frontend: `services/avatarSupport.service.ts`

### `src/services/supportService.js`
- `processStudentQuery(userId, message, context)` — routes query to AI with support persona
- Handles course-related questions, navigation help, technical support
- Falls back gracefully if AI unavailable

---

## Course Generation Workflow

```
Admin POST /api/power-admin/ai/lesson-assist
  -> powerAdminController.generateLessonAssist()
  -> aiService.generateCourseStructure(topic, intent)
  -> Saves as CourseGenerationJob (status: running)
  -> Parses AI JSON response
  -> Creates Course + Lessons in DB
  -> Updates job status: completed
  -> Returns { courseId, structure }
```

---

## AI Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-provider AI service | Complete | Gemini/OpenAI/Ollama |
| Chat completion API | Complete | All providers |
| Course structure generation | Complete | AI JSON parsing + DB save |
| Auto-grading | Complete | Returns score + feedback |
| Content moderation | Basic | Keyword blocklist + AI check |
| TTS synthesis | Complete | Azure Speech SDK |
| AI tutor chat (frontend) | Partial | Backend done, UI partially wired |
| Chat memory persistence | Complete | ChatMemory model |
| Regional AI detection | Complete | Language/timezone detection |
| Voice Q&A pipeline | Incomplete | STT not fully wired |
| AI lesson summary | Complete | Backend method exists |
| AI quiz generation | Complete | Backend method exists |
| Avatar support agent | Complete (backend) | Frontend chat UI exists |

---

## AI Ideas / Future Roadmap (from docs)

| Feature | Priority |
|---------|----------|
| Knowledge tree / concept map | Phase 2 |
| Spaced repetition AI scheduling | Phase 2 |
| Voice-to-voice Q&A in classroom | Phase 2 |
| AI-generated flashcards | Phase 3 |
| Plagiarism detection | Phase 3 |
| Emotional sentiment analysis (engagement) | Phase 3 |
| Multi-lingual support (Tamil + English AI) | Phase 2 |
| Teacher tone customization (AI styleguide) | Phase 2 |
| AI-powered live feedback during lessons | Phase 3 |

---

## Frontend AI Routes (`client-main/app/api/`)

These are Next.js server-side API routes that proxy AI calls:

### `app/api/ai/chat/route.ts`
- Accepts chat messages from browser
- Calls Gemini API using `GEMINI_API_KEY` (server-side only)
- Returns AI response — the API key is NEVER exposed to browser

### `app/api/ai/greeting/route.ts`
- Returns time-appropriate Tamil/English greeting
- Uses `lib/greeting-schedule.ts` + Gemini for personalization

---

## Security Notes for AI Features
- API keys are NEVER sent to the browser
- All LLM calls go through Next.js API routes or directly to the Express backend
- Content moderation is run on user-generated content before it is saved
- AI-generated course content goes through the ContentApproval workflow before publishing
