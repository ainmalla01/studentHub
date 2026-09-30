import { ZodError } from "zod";


// ============================================================
// SHARED
// VALIDATION MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// Validate Request Body
// Shared → Zod Schema Validation
// ------------------------------------------------------------

export const validate = (schema) => async (
  req,
  res,
  next
) => {

  try {

    // --------------------------------------------------------
    // Validate and Replace Request Body
    // --------------------------------------------------------

    req.body = await schema.parseAsync(req.body);

    next();

  } catch (err) {

    // --------------------------------------------------------
    // ZOD VALIDATION ERROR
    // --------------------------------------------------------

    if (err instanceof ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",

        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }


    // --------------------------------------------------------
    // OTHER ERRORS
    // --------------------------------------------------------

    next(err);
  }
};