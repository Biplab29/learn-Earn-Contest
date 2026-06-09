import ApiError from "./ApiError.js";

class ErrorHandler extends ApiError {
  constructor(message = "Internal Server Error", statusCode = 500) {
    super(statusCode, message);
  }
}

export default ErrorHandler;
