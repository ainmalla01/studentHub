import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { isProduction } from "src/config/env.js";
import { logger } from "src/config/logger.js";
import { AppError } from "src/utils/AppError.js";

const send = (res, req, status, body) =>
  res.status(status).json({ success: false, ...body, ...(req.id ? { requestId: req.id } : {}) });

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (error, req, res, _next) => {
  if (res.headersSent) return;

  if (error instanceof ZodError) {
    return send(res, req, 400, { message: "Validation failed", errors: error.flatten() });
  }

  if (error instanceof AppError) {
    return send(res, req, error.statusCode, {
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return send(res, req, 409, { message: "A record with this unique value already exists." });
    }
    if (error.code === "P2025") {
      return send(res, req, 404, { message: "Requested record was not found." });
    }
    if (error.code === "P2003") {
      return send(res, req, 400, { message: "A referenced record does not exist." });
    }
  }

  // Malformed / oversized JSON bodies (body-parser)
  if (error?.type === "entity.parse.failed") {
    return send(res, req, 400, { message: "Malformed JSON body." });
  }
  if (error?.type === "entity.too.large") {
    return send(res, req, 413, { message: "Request body is too large." });
  }

  // Multer upload errors
  if (error?.name === "MulterError") {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return send(res, req, status, { message: error.message });
  }

  (req.log ?? logger).error({ err: error }, "Unhandled error");

  return send(res, req, 500, {
    message: isProduction ? "Internal server error" : error?.message || "Internal server error",
  });
};
