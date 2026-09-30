import crypto from "node:crypto";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { corsOrigins, env } from "src/config/env.js";
import { logger } from "src/config/logger.js";
import { prisma } from "src/config/prisma.js";

import { errorMiddleware } from "src/middleware/error.middleware.js";
import { notFoundMiddleware } from "src/middleware/notFound.middleware.js";
import { apiLimiter } from "src/middleware/rateLimit.middleware.js";

import aiSkillRoutes from "src/routes/aiSkill.routes.js";
import authRoutes from "src/routes/auth.routes.js";
import collegeChallengeRoutes from "src/routes/collegeChallenge.routes.js";
import collegeRoutes from "src/routes/college.routes.js";
import reportRoutes from "src/routes/report.routes.js";
import skillRoutes from "src/routes/skill.routes.js";
import studentChallengeRoutes from "src/routes/studentChallenge.routes.js";
import studentRoutes from "src/routes/student.routes.js";
import submissionRoutes from "src/routes/submission.routes.js";

const app = express();

app.disable("x-powered-by");
if (env.TRUST_PROXY > 0) app.set("trust proxy", env.TRUST_PROXY);

// ---------------------------------------------------------------- middleware
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const incoming = req.headers["x-request-id"];
      const id =
        typeof incoming === "string" && /^[\w-]{8,64}$/.test(incoming)
          ? incoming
          : crypto.randomUUID();
      res.setHeader("X-Request-Id", id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url === "/api/health" || req.url === "/api/ready" },
    customLogLevel: (_req, res, err) =>
      err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
  }),
);

app.use(helmet());

app.use(
  cors({
    // Requests without an Origin header (curl, server-to-server, health checks) are allowed.
    origin: (origin, callback) => callback(null, !origin || corsOrigins.includes(origin)),
    credentials: true,
    maxAge: 600,
  }),
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// -------------------------------------------------------------------- health
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "StudentHub API is running" });
});

// Readiness: verifies the database connection (use for orchestrator probes).
app.get("/api/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: "Ready" });
  } catch (error) {
    logger.error({ err: error }, "Readiness check failed");
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

// ---------------------------------------------------------------- API routes
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/college", collegeChallengeRoutes);
app.use("/api/college/skills/ai", aiSkillRoutes);
app.use("/api/student", studentChallengeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/reports", reportRoutes);

// ------------------------------------------------------------ error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
