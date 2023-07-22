class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}
module.exports = BadRequest;
