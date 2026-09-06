const { validationResult } = require('express-validator');

// Drop this after any express-validator chain in a route definition:
//   router.post('/x', [body('email').isEmail()], validate, handler)
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
