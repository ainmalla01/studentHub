
// utils/password.js

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;


export const passwordHash = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};


export const comparePassword = async (
  plainPassword,
  hashedPassword
) => {
  return bcrypt.compare(
    plainPassword,
    hashedPassword
  );
};
