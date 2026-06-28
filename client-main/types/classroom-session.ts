export interface ClassroomStudent {
  id: string;
  name: string;
  seat: number;
  courseId: string;
  progress: {
    completedTopics: string[];
    weakAreas: string[];
    quizScores: number[];
  };
  preferences: {
    learningStyle?: "visual" | "auditory" | "kinesthetic" | "mixed";
    captionsEnabled?: boolean;
    highContrast?: boolean;
  };
}

export interface ClassroomLessonSection {
  id: string;
  title: string;
  kind: "intro" | "objectives" | "theory" | "example" | "exercise" | "quiz" | "summary";
  boardLines: string[];
  narration?: string;
  diagramHint?: string;
}

export interface ClassroomLesson {
  courseName: string;
  title: string;
  subject: string;
  sections: ClassroomLessonSection[];
  citations?: string[];
}

export interface ClassroomQuestion {
  studentId: string;
  text: string;
  voice: boolean;
  timestamp: number;
  seat?: number;
  lessonTitle?: string;
}
