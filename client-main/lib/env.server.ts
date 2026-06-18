/**
 * Server-only environment helpers for Next.js API routes.
 * Do not import this file from client components.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See client-main/.env.example`,
    );
  }
  return value;
}

export const serverEnv = {
  geminiApiKey: () => process.env.GEMINI_API_KEY || "",
  openaiApiKey: () => process.env.OPENAI_API_KEY || "",
  weatherApiKey: () => process.env.WEATHER_API_KEY || "",
  nodeEnv: () => process.env.NODE_ENV || "development",
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  apiUrl: () =>
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:5001",
};

export function assertGeminiConfigured() {
  return required("GEMINI_API_KEY", process.env.GEMINI_API_KEY);
}
