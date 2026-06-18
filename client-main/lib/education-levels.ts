export const EDUCATION_LEVELS = [
  "High School",
  "Higher Secondary",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certification",
  "Other",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

const EDUCATION_KEYWORDS: Array<{ level: EducationLevel; patterns: RegExp[] }> = [
  {
    level: "Doctorate",
    patterns: [/phd/i, /doctorate/i, /doctoral/i],
  },
  {
    level: "Master's Degree",
    patterns: [/master/i, /msc/i, /mba/i, /m\.?a\b/i],
  },
  {
    level: "Bachelor's Degree",
    patterns: [/bachelor/i, /bsc/i, /b\.?a\b/i, /undergraduate/i, /degree/i],
  },
  {
    level: "Diploma",
    patterns: [/diploma/i, /associate/i],
  },
  {
    level: "Higher Secondary",
    patterns: [/higher secondary/i, /a[\s-]?level/i, /plus two/i, /12th/i],
  },
  {
    level: "High School",
    patterns: [/high school/i, /secondary school/i, /10th/i, /o[\s-]?level/i],
  },
  {
    level: "Professional Certification",
    patterns: [/certification/i, /certificate/i, /professional/i],
  },
];

export function parseEducationLevelFromSpeech(text: string): EducationLevel | null {
  const normalized = text.trim();
  if (!normalized) return null;

  const direct = EDUCATION_LEVELS.find(
    (level) => level.toLowerCase() === normalized.toLowerCase(),
  );
  if (direct) return direct;

  for (const entry of EDUCATION_KEYWORDS) {
    if (entry.patterns.some((pattern) => pattern.test(normalized))) {
      return entry.level;
    }
  }

  return null;
}

export function parseAgeFromSpeech(text: string): number | null {
  const match = text.match(/\b(\d{1,3})\b/);
  if (!match) return null;
  const age = Number(match[1]);
  if (!Number.isFinite(age) || age < 5 || age > 120) return null;
  return age;
}
