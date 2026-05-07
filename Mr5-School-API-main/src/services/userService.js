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

export const getAllUsers = async (queryParams) => {
    const { page, limit, role, search } = queryParams;

    // Create cache key based on query parameters
    const cacheKey = `users:${JSON.stringify(queryParams)}`;
    
    // Try to get from cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    // Build query
    const query = {};
    if (role) query.role = role;
    if (search) {
        // Escape search term to prevent ReDoS attacks
        const escapedSearch = escapeRegex(search);
        query.$or = [
            { name: { $regex: escapedSearch, $options: "i" } },
            { email: { $regex: escapedSearch, $options: "i" } },
        ];
    }

    const result = await paginate(User, query, {
        page,
        limit,
        sort: "-createdAt",
    });

    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;
};

export const getUserById = async (id) => {
    // Try to get from cache first
    const cacheKey = `user:${id}`;
    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
        return cachedUser;
    }

    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    // Cache the user for 10 minutes
    cache.set(cacheKey, user, 10 * 60 * 1000);

    return user;
};

export const createUser = async (userData) => {
    const newUser = new User(userData);
    const user = await newUser.save();

    // Invalidate cache for user listings
    cache.clear();

    return user;
};

export const updateUser = async (id, updateData) => {
    const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        throw new Error("User not found");
    }

    // Invalidate caches
    cache.delete(`user:${id}`);
    cache.clear(); // Clear all user listings cache

    return user;
};

export const deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw new Error("User not found");
    }

    // Invalidate caches
    cache.delete(`user:${id}`);
    cache.clear(); // Clear all user listings cache

    return user;
};