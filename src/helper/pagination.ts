
export const paginate = (
  page: number,
  limit: number,
  totalItems: number
): { totalPages: number; offset: number } => {
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;

  return {
    totalPages,
    offset,
  };
};
