export const COURSE_STRUCTURE_SYSTEM = `You are MR5 School's curriculum architect.
Create original instructional material. Do not copy protected text.
Return ONLY valid JSON. No markdown fences.`;

export function buildCourseStructurePrompt(topic, intent = {}) {
  const level = intent.level || "Beginner";
  const subtopics = (intent.subtopics || []).join(", ") || "auto-detect from topic";

  return `Design a complete learning course for the topic: "${topic}".

Student level: ${level}
Likely subtopics: ${subtopics}
Intent: ${intent.intentType || "full_course"}

Return JSON with this exact shape:
{
  "title": "string",
  "description": "string (120-200 words, original instructional prose)",
  "category": "Technology|Design|Business|Security|Education|Development|Other",
  "level": "Beginner|Intermediate|Advanced",
  "learningOutcomes": ["outcome1", "outcome2", "outcome3", "outcome4"],
  "prerequisites": ["prerequisite1"],
  "estimatedWeeks": 4,
  "modules": [
    {
      "title": "Module title",
      "summary": "one sentence",
      "lessons": [
        {
          "title": "Lesson title",
          "objectives": ["objective1"],
          "content": "Original lesson explanation in simple language (200-350 words)",
          "example": "Short practical example",
          "practiceTask": "Guided practice task",
          "quiz": [
            {
              "question": "string",
              "options": ["A", "B", "C", "D"],
              "answerIndex": 0,
              "explanation": "why correct"
            }
          ]
        }
      ]
    }
  ],
  "finalProject": {
    "title": "string",
    "brief": "string",
    "rubric": ["criterion1", "criterion2"]
  },
  "teacherNotes": ["note1", "note2"],
  "faq": [{ "q": "question", "a": "answer" }],
  "resourceLinks": [{ "title": "string", "url": "string", "licenseType": "internal|official_docs|open_education" }]
}`;
}

export const SEARCH_INTENT_SYSTEM = `You are MR5 School's search intent analyzer.
Extract learning intent from natural language queries.
Return ONLY valid JSON. No markdown fences.`;

export function buildSearchIntentPrompt(query) {
  return `Analyze this student search query: "${query}"

Return JSON:
{
  "topic": "primary subject (e.g. JavaScript, UI Design)",
  "level": "Beginner|Intermediate|Advanced",
  "intentType": "full_course|lesson|skill_path",
  "subtopics": ["subtopic1", "subtopic2"],
  "durationWeeks": 4,
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.0
}`;
}

export function buildSummaryQuizPrompt(content) {
  return `Summarize the following lesson content and create 3 quiz questions.
Return JSON: { "summary": "string", "quiz": [{ "question": "", "options": [], "answerIndex": 0 }] }

Content:
${content}`;
}
