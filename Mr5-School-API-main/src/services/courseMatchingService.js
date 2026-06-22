import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import cache from "../utils/cache.js";

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function scoreCourse(course, intent, searchTerm) {
  let score = 0;
  const title = (course.title || "").toLowerCase();
  const description = (course.description || "").toLowerCase();
  const tags = (course.tags || []).map((t) => t.toLowerCase());
  const topic = intent.topic.toLowerCase();
  const keywords = (intent.keywords || []).map((k) => k.toLowerCase());

  if (title === topic) score += 100;
  else if (title.includes(topic) || topic.includes(title)) score += 70;

  if (description.includes(topic)) score += 30;

  for (const kw of keywords) {
    if (title.includes(kw)) score += 15;
    if (description.includes(kw)) score += 8;
    if (tags.some((t) => t.includes(kw))) score += 12;
  }

  if (searchTerm && title.includes(searchTerm.toLowerCase())) score += 20;

  if (course.level === intent.level) score += 10;
  if (course.isApproved) score += 5;

  return score;
}

async function findTextMatches(intent, searchTerm) {
  const terms = [intent.topic, ...(intent.keywords || []), searchTerm]
    .filter(Boolean)
    .map((t) => t.trim())
    .filter((t, i, arr) => arr.indexOf(t) === i);

  const orConditions = [];
  for (const term of terms) {
    const escaped = escapeRegex(term);
    orConditions.push(
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { tags: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } },
    );
  }

  try {
    const textResults = await Course.find(
      { $text: { $search: intent.topic } },
      { score: { $meta: "textScore" } },
    )
      .populate("teacher", "name email profileImage")
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean();

    if (textResults.length > 0) return textResults;
  } catch {
    /* text index may be unavailable in test env */
  }

  return Course.find({ $or: orConditions })
    .populate("teacher", "name email profileImage")
    .limit(30)
    .lean();
}

export async function matchCourses(query, intent) {
  const cacheKey = `course-match:${query.toLowerCase()}:${intent.level}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const searchTerm = typeof query === "string" ? query.trim() : "";
  const candidates = await findTextMatches(intent, searchTerm);

  const scored = candidates
    .map((course) => ({
      course,
      score: scoreCourse(course, intent, searchTerm),
      matchType: scoreCourse(course, intent, searchTerm) >= 80
        ? "exact"
        : scoreCourse(course, intent, searchTerm) >= 50
          ? "similar"
          : "related",
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  let partialModules = [];

  if (best && best.score < 80) {
    const lessonMatches = await Lesson.find({
      $or: [
        { title: { $regex: escapeRegex(intent.topic), $options: "i" } },
        { content: { $regex: escapeRegex(intent.topic), $options: "i" } },
      ],
    })
      .populate("course", "title level isApproved")
      .limit(10)
      .lean();

    partialModules = lessonMatches.map((lesson) => ({
      lessonId: lesson._id,
      lessonTitle: lesson.title,
      courseId: lesson.course?._id,
      courseTitle: lesson.course?.title,
    }));
  }

  let recommendation = "assemble_new";
  if (best?.score >= 80) recommendation = "open_existing";
  else if (best?.score >= 40 || partialModules.length > 0) recommendation = "merge_partial";

  const result = {
    matches: scored.slice(0, 10).map(({ course, score, matchType }) => ({
      courseId: course._id,
      title: course.title,
      description: course.description,
      level: course.level,
      category: course.category,
      price: course.price,
      thumbnail: course.thumbnail,
      teacher: course.teacher,
      isApproved: course.isApproved,
      score,
      matchType,
    })),
    partialModules,
    recommendation,
    bestMatch: best
      ? { courseId: best.course._id, score: best.score, matchType: best.matchType }
      : null,
  };

  cache.set(cacheKey, result, 3 * 60 * 1000);
  return result;
}
