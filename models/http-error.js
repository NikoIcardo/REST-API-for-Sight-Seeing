class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Will add a 'message' property
    this.code = errorCode; // Adds a 'code' propertty
  }
}

module.exports = HttpError;
