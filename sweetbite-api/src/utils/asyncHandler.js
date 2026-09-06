// Express doesn't catch rejected promises from async route handlers by
// default — without this, a thrown error inside an `async (req, res) => {}`
// handler would hang the request instead of reaching errorHandler.js.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
