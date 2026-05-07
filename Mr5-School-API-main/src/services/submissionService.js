import Submission from "../models/Submission.js";
import { paginate } from "../utils/pagination.js";
import cache from "../utils/cache.js";

/**
 * Escape special regex characters to prevent ReDoS attacks
 * @param {string} string - Input string to escape
 * @returns {string} Escaped string
 */
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getAllSubmissions = async (queryParams) => {
    const { page, limit, assignment, student, grade, search } = queryParams;

    // Create cache key based on query parameters
    const cacheKey = `submissions:${JSON.stringify(queryParams)}`;
    
    // Try to get from cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    // Build query
    const query = {};
    if (assignment) query.assignment = assignment;
    if (student) query.student = student;
    if (grade) query.grade = grade;
    if (search) {
        // Escape search term to prevent ReDoS attacks
        const escapedSearch = escapeRegex(search);
        query.$or = [
            { feedback: { $regex: escapedSearch, $options: "i" } },
            { fileUrl: { $regex: escapedSearch, $options: "i" } },
        ];
    }

    const result = await paginate(Submission, query, {
        page,
        limit,
        sort: "-createdAt",
        populate: [
            {
                path: "assignment",
                select: "title description dueDate",
                populate: {
                    path: "course",
                    select: "title",
                },
            },
            {
                path: "student",
                select: "name email profileImage",
            },
        ],
    });

    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;
};

export const getSubmissionById = async (id) => {
    const submission = await Submission.findById(id)
        .populate({
            path: "assignment",
            select: "title description dueDate",
            populate: {
                path: "course",
                select: "title",
            },
        })
        .populate("student", "name email profileImage");

    if (!submission) {
        throw new Error("Submission not found");
    }
    return submission;
};

export const createSubmission = async (submissionData) => {
    const newSubmission = new Submission(submissionData);
    const savedSubmission = await newSubmission.save();

    return await Submission.findById(savedSubmission._id)
        .populate({
            path: "assignment",
            select: "title description dueDate",
            populate: {
                path: "course",
                select: "title",
            },
        })
        .populate("student", "name email profileImage");
};

export const updateSubmission = async (id, updateData) => {
    const submission = await Submission.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        },
    )
        .populate({
            path: "assignment",
            select: "title description dueDate",
            populate: {
                path: "course",
                select: "title",
            },
        })
        .populate("student", "name email profileImage");

    if (!submission) {
        throw new Error("Submission not found");
    }
    return submission;
};

export const deleteSubmission = async (id) => {
    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) {
        throw new Error("Submission not found");
    }
    return submission;
};
