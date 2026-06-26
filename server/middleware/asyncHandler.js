// Wraps async route handlers — catches any thrown error and passes to errorHandler
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;