class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.success = statusCode < 400;
    this.message = message;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      Object.assign(this, data);
    } else if (data !== null && data !== undefined) {
      this.data = data;
    }
  }
}

export default ApiResponse;
