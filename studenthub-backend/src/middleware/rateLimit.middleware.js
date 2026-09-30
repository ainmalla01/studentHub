import rateLimit from "express-rate-limit";
import { isTest } from "../config/env.js";


// ============================================================
// SHARED
// RATE LIMITING MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// Base Rate Limit Configuration
// Shared configuration used by all limiters
// ------------------------------------------------------------

const base = {
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Disable rate limiting during tests
  skip: () => isTest,

  // Response when rate limit is exceeded
  handler: (_req, res) =>
    res.status(429).json({
      success: false,
      message:
        "Too many requests. Please try again later.",
    }),
};


// ------------------------------------------------------------
// API LIMITER
// Shared → Whole API
// ------------------------------------------------------------

/**
 * Generous limit for the whole API.
 */

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});


// ------------------------------------------------------------
// AUTH LIMITER
// Shared → Login / Registration
// ------------------------------------------------------------

/**
 * Strict limit for login/registration;
 * only failed attempts count.
 */

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
});


// ------------------------------------------------------------
// AI LIMITER
// Shared → AI Requests
// ------------------------------------------------------------

/**
 * AI calls cost money - keep them tightly limited.
 */

export const aiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 20,
});