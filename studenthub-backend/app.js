
// app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./src/routes/auth.route.js";
import collegeRoutes from "./src/routes/college/index.js";
// import studentRoutes from "./src/routes/student/index.js";

// Middleware
import { logger } from "./src/middleware/logger.middleware.js";
import { errorHandler } from "./src/middleware/error.middleware.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data
app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true,
  })
);

// Parse cookies
app.use(cookieParser());

// Request logger
app.use(logger);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudentHub AI API Running",
  });
});


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// College
app.use(
  "/api/college",
  collegeRoutes
);

// Student
// app.use(
//   "/api/student",
//   studentRoutes
// );

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
|
| Must be registered AFTER all routes.
|
*/

app.use(errorHandler);

export default app;
