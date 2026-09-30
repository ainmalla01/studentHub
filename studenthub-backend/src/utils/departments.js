// Must match the `Department` enum in prisma/schema.prisma
export const DEPARTMENTS = ["ALL", "BCA", "CSIT", "BIT"];

/**
 * Challenge departments a student may see: always "ALL" plus their own
 * department when it maps to a known enum value.
 */
export const visibleDepartmentsFor = (department) => {
  const value = String(department ?? "").trim().toUpperCase();
  return value !== "ALL" && DEPARTMENTS.includes(value) ? ["ALL", value] : ["ALL"];
};
