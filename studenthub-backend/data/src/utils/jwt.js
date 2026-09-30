import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ALGORITHM = "HS256";
const ISSUER = "studenthub";

export const signToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: ISSUER,
  });

export const verifyToken = (token) =>
  jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM], issuer: ISSUER });
