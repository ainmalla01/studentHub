import crypto from "node:crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O (ambiguous)
const LOWER = "abcdefghijkmnpqrstuvwxyz"; // no l, o
const DIGITS = "23456789"; // no 0, 1
const ALL = UPPER + LOWER + DIGITS;

const pick = (chars) => chars[crypto.randomInt(0, chars.length)];

/**
 * Cryptographically secure temporary password that always contains at least one
 * uppercase letter, one lowercase letter and one digit.
 */
export const generateTemporaryPassword = (length = 12) => {
  if (length < 8) throw new RangeError("Temporary password must be at least 8 characters.");

  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS)];
  while (chars.length < length) chars.push(pick(ALL));

  // Fisher-Yates shuffle with a CSPRNG
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};
