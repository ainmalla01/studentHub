import crypto from "crypto";

export const generateTemporaryPassword = async (length = 12) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const randomBytes = crypto.randomBytes(length);

  let password = "";

  for (let i = 0; i < length; i++) {
    password += characters[randomBytes[i] % characters.length];
  }

  return password;
};