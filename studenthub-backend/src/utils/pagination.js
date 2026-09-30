export const skipTake = ({ page, limit }) => ({ skip: (page - 1) * limit, take: limit });

export const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
