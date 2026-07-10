import { User } from "@/types/user";
import type { LocaleCode } from "@/lib/i18n/config";

interface ChatMemoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ClassroomAiContext {
  studentSeat?: number;
  seatLabel?: string;
  boardContent?: string[];
  teacherName?: string;
  teacherPersonality?: string;
  learningProgress?: {
    sectionIndex?: number;
    completedTopics?: string[];
  };
}

interface BuildPromptOptions {
  user?: User | null;
  recentMessages?: ChatMemoryMessage[];
  courseTitle?: string;
  lessonTitle?: string;
  courseId?: string;
  lessonId?: string;
  classroom?: ClassroomAiContext;
  locale?: LocaleCode;
}

export function buildStudentAiSystemPrompt({
  user,
  recentMessages = [],
  courseTitle,
  lessonTitle,
  courseId,
  lessonId,
  classroom,
  locale = "en",
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

  const classroomLines = [
    classroom?.teacherName ? `Active teacher avatar: ${classroom.teacherName}` : null,
    classroom?.studentSeat
      ? `Student seat: ${classroom.seatLabel ?? `Seat ${classroom.studentSeat}`}`
      : null,
    classroom?.boardContent?.length
      ? `Blackboard content:\n${classroom.boardContent.join("\n")}`
      : null,
    classroom?.learningProgress?.sectionIndex != null
      ? `Lesson section index: ${classroom.learningProgress.sectionIndex}`
      : null,
    classroom?.learningProgress?.completedTopics?.length
      ? `Completed topics: ${classroom.learningProgress.completedTopics.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const localeInstruction = locale === "ta"
    ? "Answer in Tamil whenever possible and use a warm, encouraging tone."
    : locale === "si"
      ? "Answer in Sinhala whenever possible and use a warm, encouraging tone."
      : locale === "ar"
        ? "Answer in Arabic whenever possible and use a warm, encouraging tone."
        : locale === "he"
          ? "Answer in Hebrew whenever possible and use a warm, encouraging tone."
          : "Answer in the student's preferred language whenever possible and keep the explanation clear and supportive.";

  const systemPrompt =
    classroom?.teacherPersonality ??
    `You are an expert AI Teacher for MR5 School immersive 3D classroom. ${localeInstruction}`;

  return [
    systemPrompt,
    profileLines ? `\nSTUDENT PROFILE:\n${profileLines}` : "",
    lessonLines ? `\nLESSON CONTEXT:\n${lessonLines}` : "",
    classroomLines ? `\nCLASSROOM CONTEXT:\n${classroomLines}` : "",
    memoryLines ? `\nRECENT CHAT MEMORY:\n${memoryLines}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
