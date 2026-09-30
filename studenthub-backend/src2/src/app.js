import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import studentChallengeRoutes from "./routes/studentChallenge.routes.js";
import collegeChallengeRoutes from "./routes/collegeChallenge.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import reportRoutes from "./routes/report.routes.js";
import aiSkillRoutes from "./routes/aiSkill.routes.js";
import collegeRoutes from "./routes/college.routes.js";
import verifiedRoutes from "./routes/verefied.route.js";

import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import notificationRoutes from "./routes/notification.routes.js"; // Adjust path as needed


const app = express();

app.disable("x-powered-by");



app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);


console.log(
  "API URL:",
  process.env.NEXT_PUBLIC_API_URL
);

console.log(
  "JWT_SECRET loaded:",
  process.env.JWT_SECRET ? "Yes" : "No"
);

console.log(
  "JWT_EXPIRES_IN:",
  process.env.JWT_EXPIRES_IN
);



// Ensure this line exists in your Express app:
app.use("/api/v1/notifications", notificationRoutes);


app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "StudentHub API is running",
  });
});



app.use("/api/auth", authRoutes);

app.use(
  "/api/reports/dashboard",
  dashboardRoutes
);

app.use("/api/students", studentRoutes);

// College challenge APIs
app.use(
  "/api/college",
  collegeChallengeRoutes
);

// College profile / logo APIs
app.use(
  "/api/college",
  collegeRoutes
);

// Student challenge APIs
app.use(
  "/api/student",
  studentChallengeRoutes
);

// Student verification APIs
app.use(
  "/api",
  verifiedRoutes
);

app.use(
  "/api/submissions",
  submissionRoutes
);

app.use(
  "/api/skills",
  skillRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/college/skills/ai",
  aiSkillRoutes
);

// ======================================================
// ERROR HANDLERS
// ======================================================

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;