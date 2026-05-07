import Lesson from "../models/Lesson.js";
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

export const getAllLessons = async (queryParams) => {
    const { page, limit, course, search } = queryParams;

    // Create cache key based on query parameters
    const cacheKey = `lessons:${JSON.stringify(queryParams)}`;
    
    // Try to get from cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    // Build query
    const query = {};
    if (course) query.course = course;
    if (search) {
        // Escape search term to prevent ReDoS attacks
        const escapedSearch = escapeRegex(search);
        query.$or = [
            { title: { $regex: escapedSearch, $options: "i" } },
            { content: { $regex: escapedSearch, $options: "i" } },
        ];
    }

    const result = await paginate(Lesson, query, {
        page,
        limit,
        sort: "order createdAt",
        populate: [
            {
                path: "course",
                select: "title description thumbnail level teacher",
                populate: {
                    path: "teacher",
                    select: "name email",
                },
            },
        ],
    });

    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;
};

export const getLessonById = async (id) => {
    // Try to get from cache first
    const cacheKey = `lesson:${id}`;
    const cachedLesson = cache.get(cacheKey);
    if (cachedLesson) {
        return cachedLesson;
    }

    const lesson = await Lesson.findById(id).populate({
        path: "course",
        select: "title description thumbnail level teacher",
        populate: {
            path: "teacher",
            select: "name email profileImage",
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    // Cache the lesson for 10 minutes
    cache.set(cacheKey, lesson, 10 * 60 * 1000);

    return lesson;
};

export const createLesson = async (lessonData) => {
    const newLesson = new Lesson(lessonData);
    const savedLesson = await newLesson.save();

    const lesson = await Lesson.findById(savedLesson._id).populate({
        path: "course",
        select: "title description thumbnail level teacher",
        populate: {
            path: "teacher",
            select: "name email",
        },
    });

    // Invalidate cache for lesson listings
    cache.clear();

    return lesson;
};

export const updateLesson = async (id, updateData) => {
    const lesson = await Lesson.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate({
        path: "course",
        select: "title description thumbnail level teacher",
        populate: {
            path: "teacher",
            select: "name email",
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    // Invalidate caches
    cache.delete(`lesson:${id}`);
    cache.clear(); // Clear all lesson listings cache

    return lesson;
};

export const deleteLesson = async (id) => {
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
        throw new Error("Lesson not found");
    }

    // Invalidate caches
    cache.delete(`lesson:${id}`);
    cache.clear(); // Clear all lesson listings cache

    return lesson;
};