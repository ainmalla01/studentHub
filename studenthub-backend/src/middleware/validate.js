
// middleware/validate.js

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    // Replace the input with Zod's validated/transformed data
    req[source] = result.data;

    next();
  };
};
