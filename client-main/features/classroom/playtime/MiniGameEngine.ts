export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}

export interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

export const CLASSROOM_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What does the whiteboard display in this classroom?",
    options: ["Sports scores", "Lesson content", "Weather map", "Music lyrics"],
    answerIndex: 1,
  },
  {
    id: "q2",
    prompt: "When comfort is low, what should increase?",
    options: ["Curtain closure", "Fan airflow", "Room darkness", "Desk height"],
    answerIndex: 1,
  },
  {
    id: "q3",
    prompt: "Which panel shows live room comfort?",
    options: ["Exit Room", "Environment", "Back button", "Camera"],
    answerIndex: 1,
  },
];

export const MATCH_PAIRS: MatchPair[] = [
  { id: "m1", term: "Fan AUTO", definition: "Adjusts to weather" },
  { id: "m2", term: "Curtains", definition: "Control sunlight" },
  { id: "m3", term: "Board", definition: "Lesson focus area" },
];

export function checkQuizAnswer(question: QuizQuestion, selected: number): boolean {
  return question.answerIndex === selected;
}

export function checkMatch(termId: string, definitionId: string): boolean {
  return termId === definitionId;
}
