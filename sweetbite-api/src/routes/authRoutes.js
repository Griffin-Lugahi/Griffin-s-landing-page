const { Router } = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

// Slows down brute-force credential guessing without blocking normal use.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().isEmail().withMessage('A valid email is required.'),
    body('phone').optional({ checkFalsy: true }).isString(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validate,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('A valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  asyncHandler(authController.login)
);

router.get('/me', requireAuth, asyncHandler(authController.getMe));

router.patch(
  '/me',
  requireAuth,
  [
    body('name').optional({ checkFalsy: true }).trim().notEmpty(),
    body('phone').optional({ checkFalsy: true }).isString(),
  ],
  validate,
  asyncHandler(authController.updateMe)
);

router.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  asyncHandler(authController.changePassword)
);

module.exports = router;
