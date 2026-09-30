import crypto from "node:crypto";

/**
 * Human-friendly public student ID, e.g. "CSIT-2024-04821".
 * Uniqueness is enforced by the database; callers retry on collision.
 */
export const generateStudentId = ({ batch, department }) => {
  const dept =
    String(department ?? "")
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 4) || "STU";
  const suffix = crypto.randomInt(0, 100000).toString().padStart(5, "0");
  return `${dept}-${batch}-${suffix}`;
};
