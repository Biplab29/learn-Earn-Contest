export const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = Array.isArray(err.errors) ? err.errors : [];

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(", ");
    message = `Duplicate field value entered: ${field}`;
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    message = "Invalid token, please login again";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired, please login again";
    statusCode = 401;
  }

  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  if (err.name === "ValidationError") {
    errors = Object.values(err.errors || {}).map((error) => error.message);
    message = "Validation failed";
    statusCode = 400;
  }

  if (err.name === "MulterError") {
    message =
      err.code === "LIMIT_UNEXPECTED_FILE" && err.field
        ? `Unexpected field: ${err.field}. Allowed upload fields are image, projectBriefing, and projectBriefingPdf.`
        : err.message || "Invalid upload request";
    statusCode = 400;
  }

  if (
    /Only JPG, JPEG, PNG, and WEBP images are allowed|Only PDF files are allowed for the project briefing|Only contest images and PDF project briefings are allowed/i.test(
      message
    )
  ) {
    statusCode = 400;
  }

  statusCode = Number(statusCode);

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
