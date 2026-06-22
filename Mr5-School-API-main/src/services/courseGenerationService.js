import CourseGenerationJob from "../models/CourseGenerationJob.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import { parseSearchIntent } from "./searchIntentService.js";
import { matchCourses } from "./courseMatchingService.js";
import { persistGeneratedCourse, buildMergeSyllabus } from "./contentAssemblyService.js";
import aiService from "./ai.service.js";
import cache from "../utils/cache.js";

function appendAudit(job, action, detail) {
  job.auditLog.push({ at: new Date(), action, detail });
}

export async function discoverCourses(query, userId = null) {
  const intent = await parseSearchIntent(query);
  const matching = await matchCourses(query, intent);

  const response = {
    query,
    intent,
    matches: matching.matches,
    partialModules: matching.partialModules,
    recommendation: matching.recommendation,
    bestMatch: matching.bestMatch,
    action: matching.recommendation === "open_existing" ? "open_existing" : "generate_or_merge",
  };

  if (matching.recommendation === "open_existing" && matching.bestMatch) {
    response.courseId = matching.bestMatch.courseId;
    response.accessPath = `/course/${matching.bestMatch.courseId}`;
  }

  return response;
}

export async function startGenerationJob({ query, userId, forceGenerate = false }) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed) throw new Error("Search query is required");

  const intent = await parseSearchIntent(trimmed);
  const matching = await matchCourses(trimmed, intent);

  if (!forceGenerate && matching.recommendation === "open_existing" && matching.bestMatch) {
    return {
      action: "open_existing",
      courseId: matching.bestMatch.courseId,
      intent,
      matches: matching.matches,
    };
  }

  const existingJob = await CourseGenerationJob.findOne({
    query: trimmed,
    status: { $in: ["queued", "matching", "assembling", "generating"] },
    ...(userId ? { requestedBy: userId } : {}),
  }).sort({ createdAt: -1 });

  if (existingJob) {
    return { action: "poll_job", jobId: existingJob._id, status: existingJob.status };
  }

  const job = await CourseGenerationJob.create({
    query: trimmed,
    intent,
    status: "queued",
    recommendation: matching.recommendation,
    matchedCourseIds: matching.matches.map((m) => m.courseId),
    requestedBy: userId || undefined,
    auditLog: [{ action: "job_created", detail: `Query: ${trimmed}` }],
  });

  setImmediate(() => {
    runGenerationPipeline(job._id.toString()).catch((err) => {
      console.error("Generation pipeline failed:", err);
    });
  });

  return { action: "poll_job", jobId: job._id, status: "queued", intent, matches: matching.matches };
}

async function runGenerationPipeline(jobId) {
  const job = await CourseGenerationJob.findById(jobId);
  if (!job) return;

  try {
    job.status = "matching";
    appendAudit(job, "matching", "Analyzing existing content");
    await job.save();

    const matching = await matchCourses(job.query, job.intent);

    job.status = "assembling";
    appendAudit(job, "assembling", `Recommendation: ${matching.recommendation}`);
    await job.save();

    let existingCourseId = null;
    let partialLessons = [];

    if (matching.recommendation === "merge_partial") {
      existingCourseId = matching.bestMatch?.courseId || matching.partialModules[0]?.courseId;
      partialLessons = matching.partialModules;
      if (existingCourseId) {
        const existingLessons = await Lesson.find({ course: existingCourseId }).lean();
        appendAudit(job, "merge_detected", `Merging with course ${existingCourseId}, ${existingLessons.length} existing lessons`);
      }
    }

    job.status = "generating";
    appendAudit(job, "generating", "Calling AI curriculum architect");
    await job.save();

    const syllabus = await aiService.generateCourseStructure(job.intent.topic, job.intent);

    let finalSyllabus = syllabus;
    if (existingCourseId) {
      const existingLessons = await Lesson.find({ course: existingCourseId }).lean();
      finalSyllabus = buildMergeSyllabus(syllabus, existingLessons, job.intent);
      const baseCourse = await Course.findById(existingCourseId);
      if (baseCourse) {
        finalSyllabus.title = baseCourse.title;
      }
    }

    job.syllabus = finalSyllabus;
    await job.save();

    const { course, sourceIds, lessonCount } = await persistGeneratedCourse({
      syllabus: finalSyllabus,
      requestedBy: job.requestedBy,
      generationJobId: job._id,
      existingCourseId,
      partialLessons,
    });

    job.status = "completed";
    job.course = course._id;
    job.sources = sourceIds;
    job.reviewStatus = "pending_review";
    appendAudit(job, "completed", `Created course ${course._id} with ${lessonCount} lessons`);
    await job.save();

    cache.delete(`course-match:${job.query.toLowerCase()}:${job.intent.level}`);
  } catch (err) {
    job.status = "failed";
    job.error = err.message || "Generation failed";
    appendAudit(job, "failed", job.error);
    await job.save();
  }
}

export async function getGenerationJob(jobId, userId = null) {
  const job = await CourseGenerationJob.findById(jobId)
    .populate("course", "title description level price thumbnail isApproved")
    .populate("matchedCourseIds", "title level thumbnail")
    .lean();

  if (!job) throw new Error("Generation job not found");

  if (userId && job.requestedBy && job.requestedBy.toString() !== userId.toString()) {
    throw new Error("Not authorized to view this job");
  }

  return {
    jobId: job._id,
    query: job.query,
    intent: job.intent,
    status: job.status,
    recommendation: job.recommendation,
    reviewStatus: job.reviewStatus,
    course: job.course,
    matchedCourses: job.matchedCourseIds,
    syllabus: job.status === "completed" ? job.syllabus : undefined,
    error: job.error,
    auditLog: job.auditLog,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function getSearchSuggestions(query) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (!trimmed || trimmed.length < 2) return { suggestions: [], courses: [] };

  const intent = await parseSearchIntent(trimmed);
  const matching = await matchCourses(trimmed, intent);

  const suggestions = [
    intent.topic,
    `${intent.topic} ${intent.level}`,
    ...(intent.subtopics || []).slice(0, 3),
  ].filter((s, i, arr) => arr.indexOf(s) === i);

  return {
    intent,
    suggestions,
    courses: matching.matches.slice(0, 5),
    recommendation: matching.recommendation,
  };
}
