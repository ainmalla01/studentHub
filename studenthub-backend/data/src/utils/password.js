import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export const hashPassword = (password) => bcrypt.hash(password, env.BCRYPT_ROUNDS);

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

// Compared against when the account does not exist so that response time does not
// reveal whether an email is registered (user-enumeration timing attack).
const DUMMY_HASH = bcrypt.hashSync("studenthub-dummy-password", env.BCRYPT_ROUNDS);

export const compareAgainstDummy = (plain) => bcrypt.compare(plain, DUMMY_HASH);
