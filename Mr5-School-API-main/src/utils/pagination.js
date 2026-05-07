// Pagination utility function
export const paginate = async (Model, query = {}, options = {}) => {
	const {
		page = 1,
		limit = 10,
		sort = "-createdAt",
		populate = [],
		select = "",
	} = options;

	const pageNum = parseInt(page, 10);
	const limitNum = parseInt(limit, 10);
	const skip = (pageNum - 1) * limitNum;

	// Build query
	let queryBuilder = Model.find(query);

	// Apply populate
	if (populate.length > 0) {
		populate.forEach((pop) => {
			if (typeof pop === "string") {
				queryBuilder = queryBuilder.populate(pop);
			} else if (typeof pop === "object") {
				queryBuilder = queryBuilder.populate(pop);
			}
		});
	}

	// Apply select
	if (select) {
		queryBuilder = queryBuilder.select(select);
	}

	// Apply sort
	queryBuilder = queryBuilder.sort(sort);

	// Execute query with pagination
	const [data, total] = await Promise.all([
		queryBuilder.skip(skip).limit(limitNum).exec(),
		Model.countDocuments(query),
	]);

	const totalPages = Math.ceil(total / limitNum);
	const hasNextPage = pageNum < totalPages;
	const hasPrevPage = pageNum > 1;

	return {
		data,
		pagination: {
			currentPage: pageNum,
			totalPages,
			totalItems: total,
			itemsPerPage: limitNum,
			hasNextPage,
			hasPrevPage,
		},
	};
};
