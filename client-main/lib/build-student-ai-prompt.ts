import { User } from "@/types/user";

interface ChatMemoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface BuildPromptOptions {
  user?: User | null;
  recentMessages?: ChatMemoryMessage[];
  courseTitle?: string;
  lessonTitle?: string;
  courseId?: string;
  lessonId?: string;
}

export function buildStudentAiSystemPrompt({
  user,
  recentMessages = [],
  courseTitle,
  lessonTitle,
  courseId,
  lessonId,
}: BuildPromptOptions) {
  const profileLines = [
    user?.name ? `Student name: ${user.name}` : null,
    user?.age ? `Age: ${user.age}` : null,
    user?.educationLevel ? `Education level: ${user.educationLevel}` : null,
    user?.language ? `Preferred language: ${user.language}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const memoryLines = recentMessages
    .slice(-16)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  const lessonLines = [
    courseTitle ? `Course: ${courseTitle}` : null,
    lessonTitle ? `Current lesson: ${lessonTitle}` : null,
    courseId ? `Course ID: ${courseId}` : null,
    lessonId ? `Lesson ID: ${lessonId}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "You are an expert AI Teacher for MR5 School.",
    "Be warm, patient, and encouraging.",
    "Always adapt vocabulary and depth to the student's age and education level when known.",
    "Use remembered chat history naturally so the student feels known and supported.",
    profileLines ? `\nSTUDENT PROFILE:\n${profileLines}` : "",
    lessonLines ? `\nLESSON CONTEXT:\n${lessonLines}` : "",
    memoryLines ? `\nRECENT CHAT MEMORY:\n${memoryLines}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
