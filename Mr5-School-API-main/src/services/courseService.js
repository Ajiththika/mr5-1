import Course from "../models/Course.js";
import User from "../models/User.js";
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

/**
 * Get all courses with advanced filtering and pagination
 * @param {Object} queryParams - Express query parameters
 * @returns {Promise<Object>} Paginated result
 */
export const getAllCourses = async (queryParams) => {
    const { page, limit, teacher, level, language, search, isApproved, category } = queryParams;

    const cacheKey = `courses:${JSON.stringify(queryParams)}`;
    
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    const query = {};
    if (teacher) query.teacher = teacher;
    if (level) query.level = level;
    if (language) query.language = language;
    if (category) query.category = category;
    if (isApproved !== undefined) query.isApproved = isApproved === "true";

    const searchTerm = typeof search === "string" ? search.trim() : "";
    if (searchTerm) {
        const escapedSearch = escapeRegex(searchTerm);
        const matchingTeachers = await User.find({
            name: { $regex: escapedSearch, $options: "i" },
        })
            .select("_id")
            .lean();

        const teacherIds = matchingTeachers.map((entry) => entry._id);
        const orConditions = [
            { title: { $regex: escapedSearch, $options: "i" } },
            { description: { $regex: escapedSearch, $options: "i" } },
        ];

        if (teacherIds.length > 0) {
            orConditions.push({ teacher: { $in: teacherIds } });
        }

        query.$or = orConditions;
    }

    const result = await paginate(Course, query, {
        page,
        limit,
        sort: "-createdAt",
        populate: [{ path: "teacher", select: "name email profileImage" }],
    });

    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;
};

/**
 * Get course by ID with caching
 * @param {string} id - Course ID
 * @returns {Promise<Object>} Course document
 */
export const getCourseById = async (id) => {
    // Try to get from cache first
    const cacheKey = `course:${id}`;
    const cachedCourse = cache.get(cacheKey);
    if (cachedCourse) {
        return cachedCourse;
    }

    const course = await Course.findById(id).populate(
        "teacher",
        "name email profileImage"
    );
    if (!course) {
        throw new Error("Course not found");
    }

    // Cache the course for 10 minutes
    cache.set(cacheKey, course, 10 * 60 * 1000);

    return course;
};

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @returns {Promise<Object>} Created course
 */
export const createCourse = async (courseData) => {
    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();

    const course = await Course.findById(savedCourse._id).populate(
        "teacher",
        "name email profileImage"
    );

    // Invalidate cache for course listings
    cache.clear();

    return course;
};

/**
 * Update a course
 * @param {string} id - Course ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated course
 */
export const updateCourse = async (id, updateData) => {
    const course = await Course.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate("teacher", "name email profileImage");

    if (!course) {
        throw new Error("Course not found");
    }

    // Invalidate caches
    cache.delete(`course:${id}`);
    cache.clear(); // Clear all course listings cache

    return course;
};

/**
 * Delete a course
 * @param {string} id - Course ID
 * @returns {Promise<Object>} Deleted course
 */
export const deleteCourse = async (id) => {
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
        throw new Error("Course not found");
    }

    // Invalidate caches
    cache.delete(`course:${id}`);
    cache.clear(); // Clear all course listings cache

    return course;
};