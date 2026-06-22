import aiService from "./ai.service.js";
import {
  SEARCH_INTENT_SYSTEM,
  buildSearchIntentPrompt,
} from "../prompts/courseGeneration.prompts.js";
import cache from "../utils/cache.js";

const LEVEL_KEYWORDS = {
  Beginner: ["beginner", "intro", "introduction", "basics", "fundamentals", "101", "starter", "new to"],
  Intermediate: ["intermediate", "mid-level", "some experience"],
  Advanced: ["advanced", "expert", "master", "professional", "deep dive"],
};

const INTENT_KEYWORDS = {
  lesson: ["lesson", "tutorial", "how to", "quick"],
  skill_path: ["path", "track", "roadmap", "career", "full stack", "fullstack"],
};

function detectLevel(query) {
  const lower = query.toLowerCase();
  for (const [level, keywords] of Object.entries(LEVEL_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return level;
  }
  return "Beginner";
}

function detectIntentType(query) {
  const lower = query.toLowerCase();
  if (INTENT_KEYWORDS.lesson.some((kw) => lower.includes(kw))) return "lesson";
  if (INTENT_KEYWORDS.skill_path.some((kw) => lower.includes(kw))) return "skill_path";
  return "full_course";
}

function extractTopic(query) {
  let topic = query.trim();
  const noise = [
    ...Object.values(LEVEL_KEYWORDS).flat(),
    ...Object.values(INTENT_KEYWORDS).flat(),
    "course", "learn", "learning", "class", "training",
  ];
  for (const word of noise) {
    topic = topic.replace(new RegExp(`\\b${word}\\b`, "gi"), "").trim();
  }
  return topic.replace(/\s+/g, " ").trim() || query.trim();
}

function buildDeterministicIntent(query) {
  const topic = extractTopic(query);
  const level = detectLevel(query);
  const intentType = detectIntentType(query);
  const words = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  return {
    topic,
    level,
    intentType,
    subtopics: words.length > 1 ? words : [topic],
    durationWeeks: intentType === "lesson" ? 1 : intentType === "skill_path" ? 8 : 4,
    keywords: words.length ? words : [topic.toLowerCase()],
    confidence: 0.6,
  };
}

function parseJsonSafe(text) {
  const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(jsonStr);
}

export async function parseSearchIntent(query) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed) throw new Error("Search query is required");

  const cacheKey = `search-intent:${trimmed.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const fallback = buildDeterministicIntent(trimmed);

  try {
    const response = await aiService.chatCompletion({
      messages: [
        { role: "system", content: SEARCH_INTENT_SYSTEM },
        { role: "user", content: buildSearchIntentPrompt(trimmed) },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const text = response.choices[0]?.message?.content || "";
    const parsed = parseJsonSafe(text);

    const intent = {
      topic: parsed.topic || fallback.topic,
      level: ["Beginner", "Intermediate", "Advanced"].includes(parsed.level)
        ? parsed.level
        : fallback.level,
      intentType: ["full_course", "lesson", "skill_path"].includes(parsed.intentType)
        ? parsed.intentType
        : fallback.intentType,
      subtopics: Array.isArray(parsed.subtopics) && parsed.subtopics.length
        ? parsed.subtopics
        : fallback.subtopics,
      durationWeeks: parsed.durationWeeks || fallback.durationWeeks,
      keywords: Array.isArray(parsed.keywords) && parsed.keywords.length
        ? parsed.keywords
        : fallback.keywords,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
    };

    cache.set(cacheKey, intent, 10 * 60 * 1000);
    return intent;
  } catch {
    cache.set(cacheKey, fallback, 5 * 60 * 1000);
    return fallback;
  }
}
