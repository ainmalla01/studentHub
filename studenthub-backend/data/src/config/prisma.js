import pkg from "@prisma/client";
import { env } from "src/config/env.js";

const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
