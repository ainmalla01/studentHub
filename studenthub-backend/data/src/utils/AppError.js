export class AppError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message    Safe, user-facing message
   * @param {unknown} [details] Optional structured details
   * @param {string} [code]     Optional machine-readable error code
   */
  constructor(statusCode, message, details, code) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}
