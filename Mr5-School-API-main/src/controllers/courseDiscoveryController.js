import { asyncHandler } from "../middleware/errorHandler.js";
import {
  discoverCourses,
  startGenerationJob,
  getGenerationJob,
  getSearchSuggestions,
} from "../services/courseGenerationService.js";

export const discover = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  const result = await discoverCourses(query.trim(), req.user?.id);
  res.json({ success: true, data: result });
});

export const generate = asyncHandler(async (req, res) => {
  const { query, forceGenerate } = req.body;
  if (!query?.trim()) {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  const result = await startGenerationJob({
    query: query.trim(),
    userId: req.user?.id,
    forceGenerate: Boolean(forceGenerate),
  });

  res.status(result.action === "poll_job" ? 202 : 200).json({ success: true, data: result });
});

export const getJob = asyncHandler(async (req, res) => {
  const result = await getGenerationJob(req.params.jobId, req.user?.id);
  res.json({ success: true, data: result });
});

export const suggestions = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim() || "";
  const result = await getSearchSuggestions(query);
  res.json({ success: true, data: result });
});
